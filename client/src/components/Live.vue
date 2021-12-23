<template>
  <div>
    <video id="localVideo" autoplay muted playsinline></video>
    <video id="remoteVideo" autoplay playsinline></video>
    <input type="button" value="挂断" @click="endcall()">
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "Live",
  props: {
    room: String,
  },
  data() {
    return {
      isChannelReady: false,
      isInitiator: false,
      isStarted: false,
      localStream: null,
      pc: null,
      remoteStream: null,
      turnReady: null,
      pcConfig: {
        'iceServers': [{
          'urls': 'stun:stun.l.google.com:19302'
        }]
      },
      sdpConstraints: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      },
      localVideo: null,
      remoteVideo: null,
    };
  },
  methods: {
    endcall() {
      this.hangup();
      this.$router.push('/chat');
    },
    sendMessage(message) {
      socket.emit('message', this.$props.room, message);
    },
    gotStream(stream) {
      this.localStream = stream;
      this.localVideo.srcObject = stream;
      this.sendMessage('got user media');
      if (this.isInitiator) {
        this.maybeStart();
      }
    },
    createPeerConnection() {
      try {
        this.pc = new RTCPeerConnection(null);
        this.pc.onicecandidate = this.handleIceCandidate;
        this.pc.onaddstream = this.handleRemoteStreamAdded;
        this.pc.onremovestream = this.handleRemoteStreamRemoved;
      } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
      }
    },
    maybeStart() {
      if (!this.isStarted && typeof this.localStream !== 'undefined' && this.isChannelReady) {
        this.createPeerConnection();
        this.pc.addStream(this.localStream);
        this.isStarted = true;
        if (this.isInitiator) {
          this.doCall();
        }
      }
    },
    doCall() {
      this.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
    },
    doAnswer() {
      this.pc.createAnswer().then(
        this.setLocalAndSendMessage,
        this.onCreateSessionDescriptionError
      );
    },
    handleIceCandidate(event) {
      console.log('icecandidate event: ', event);
      if (event.candidate) {
        this.sendMessage({
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      } else {
        console.log('End of candidates.');
      }
    },
    setLocalAndSendMessage(sessionDescription) {
      this.pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      this.sendMessage(sessionDescription);
    },
    handleCreateOfferError(event) {
      console.log('createOffer() error: ', event);
    },
    onCreateSessionDescriptionError(error) {
      console.trace('Failed to create session description: ' + error.toString());
    },
    handleRemoteStreamAdded(event) {
      this.remoteStream = event.stream;
      this.remoteVideo.srcObject = this.remoteStream;
    },
    handleRemoteStreamRemoved(event) {
      console.log('Remote stream removed. Event: ', event);
    },
    handleRemoteHangup() {
      console.log('Session terminated.');
      this.isStarted = false;
      this.pc.close();
      this.pc = null;
      this.isInitiator = false;
      this.stopBothVideoAndAudio(this.remoteStream);
    },
    requestTurn(turnURL) {
      var turnExists = false;
      for (var i in this.pcConfig.iceServers) {
        if (this.pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
          turnExists = true;
          this.turnReady = true;
          break;
        }
      }
      if (!turnExists) {
        console.log('Getting TURN server from ', turnURL);
        // No TURN server. Get one from computeengineondemand.appspot.com:
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            var turnServer = JSON.parse(xhr.responseText);
            console.log('Got TURN server: ', turnServer);
            this.pcConfig.iceServers.push({
              'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
              'credential': turnServer.password
            });
            this.turnReady = true;
          }
        };
        xhr.open('GET', turnURL, true);
        xhr.send();
      }
    },
    hangup() {
      console.log('Hanging up');
      this.isStarted = false;
      if (this.pc)
        this.pc.close();
      this.pc = null;
      socket.emit('end call', this.$props.room);
      this.stopBothVideoAndAudio(this.localStream);
    },
    stopBothVideoAndAudio(stream) {
      console.log('Stop both video and audio');
      stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live') {
          track.stop();
        }
      });
    },
    stopVideoOnly(stream) {
      stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live' && track.kind === 'video') {
          track.stop();
        }
      });
    },
    stopAudioOnly(stream) {
      stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live' && track.kind === 'audio') {
          track.stop();
        }
      });
    }
  },
  created() {
    if (this.$props.room !== '-') {
      socket.emit('live call', this.$props.room);
      console.log('Attempted to start live call: ', this.$props.room);
    }

    socket.on('created', (room,) => {
      console.log('房间已建好 ' + room);
      this.isInitiator = true;
    });

    socket.on('join', (room) => {
      console.log('有人来了 ' + room);
    });

    socket.on('joined', (room) => {
      console.log('你加入成功 ' + room);
    });

    socket.on('ready', () => {
      console.log('两人已到位！');
      this.isChannelReady = true;
    });

    socket.on('message', (message) => {
      if (message === 'got user media') {
        this.maybeStart();
      } else if (message.type === 'offer') {
        if (!this.isInitiator && !this.isStarted) {
          this.maybeStart();
        }
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
        this.doAnswer();
      } else if (message.type === 'answer' && this.isStarted) {
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && this.isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        this.pc.addIceCandidate(candidate);
      } else if (message === 'bye' && this.isStarted) {
        this.handleRemoteHangup();
      }
    });

    socket.on('end call', () => {
      console.log('电话已挂断！');
      this.endcall();
    });
  },
  mounted() {
    this.localVideo = document.querySelector('#localVideo');
    this.remoteVideo = document.querySelector('#remoteVideo');

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
    .then(this.gotStream)
    .catch((e) => {
      alert(e);
    });

    if (location.hostname !== 'localhost') {
      this.requestTurn(
        'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
      );
    }
  },
  beforeDestroy() {
    this.hangup();
  },
  destroyed() {
    socket.off('live call');
    socket.off('created');
    socket.off('join');
    socket.off('joined');
    socket.off('ready');
    socket.off('message');
    socket.off('end call');
  }
};
</script>

<style scoped>
  video {
    background: #222;
    display: inline-block;
    margin: 20px 10px;
    width: 600px;
    height: 400px;
    max-width: 100%;
  }

  input {
    position: fixed;
    bottom: 10px;
    margin: auto;
    background-color: #DC143C; 
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 5px;
    height: 65px;
    width: 65px;
    cursor: pointer;
    border-radius: 100%;
  }
</style>
