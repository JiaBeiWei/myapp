<template>
  <div>
    <div class="left-panel">
      <user
        v-for="user in users"
        :key="user.account"
        :user="user"
        :selected="selectedUser === user"
        @select="onSelectUser(user)"
      />
    </div>
    <message-panel
      v-if="selectedUser"
      :user="selectedUser"
      @input="onMessage"
      @live="onLive"
      class="right-panel"
    />
  </div>
</template>

<script>
import socket from "../socket";
import User from "./User";
import MessagePanel from "./MessagePanel";

export default {
  name: "Chat",
  components: { User, MessagePanel },
  data() {
    return {
      selectedUser: null,
      users: [],
      me: null,
    };
  },
  methods: {
    onLive() {
      var user1;
      var user2;
      if (this.me.account < this.selectedUser.account) {
        user1 = this.me.account;
        user2 = this.selectedUser.account;
      } else {
        user2 = this.me.account;
        user1 = this.selectedUser.account;
      }
      let room = user1.toString() +'-'+ user2.toString();
      this.$router.push({name: 'Live', params: { room }});
      console.log(room)
    },
    onSelectUser(user) {
      this.selectedUser = user;
      this.selectedUser.dialog.forEach((message) => {
        message.fromSelf = message.from === this.me.account;
      });
    },
    onMessage(content) {
      let message = {
        from: this.me.account, 
        username: this.me.username,
        to: this.selectedUser.account,
        message: content, 
      }
      if (this.selectedUser) {
        socket.emit("private message", message);
        message.fromSelf = true;
        this.selectedUser.dialog.push(message);
      }
    },
  },
  beforeCreate() {
    console.log('before create')
  },
  created() {
    console.log('created')
    this.me = JSON.parse(localStorage.getItem("me"));
    socket.emit("get friends", this.me, 
      (response) => {
      this.users = response.data;
    });

    socket.on("private message", (message) => {
      message.fromSelf = message.from === this.me.account;
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].account === message.from) {
          if (this.selectedUser !== message.from){
            this.users[i].newMessage = true;
          }
          this.users[i].dialog.push(message);
          break;
        }
      }
    });

    socket.on("user connect", (account) => {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].account === account) {
          this.users[i].connected = true;
          break;
        }
      }
    });

    socket.on("user disconnect", (room) => {
      room = room.split('c')[1].split('-');
      let account = (room[0]==this.me.account)?room[1]:room[0];
      account = parseInt(account);
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].account === account) {
          this.users[i].connected = false;
          break;
        }
      }
    });

  },
  beforeMount() {
    console.log('before mount'); 
  },
  mounted() {
    console.log('mounted');
  },
  beforeUpdate() {
    if (this.users.length==0) {
      alert("你还没有好友")
    }
    console.log('before update');
  },
  updated(){
    console.log('updated');
  },
  beforeDestroy() {
    console.log("before distroy")
  },
  destroyed() {
    console.log("distroyed")
    // socket.disconnect()
  },
};
</script>

<style scoped>
.left-panel {
  position: fixed;
  left: 0;
  top: 63px;
  bottom: 0;
  width: 260px;
  overflow: auto;
  background-color: #00008B;
  color: white;
}

.right-panel {
  margin-left: 260px;
}
</style>
