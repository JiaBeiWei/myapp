<template>
  <div>
    <div class="header">
      <status-icon :connected="user.connected" />{{ user.username }}
    </div>

    <ul class="messages">
      <li
        v-for="(message, index) in user.dialog"
        :key="index"
        class="message"
      >
        <!-- <div v-if="displaySender(message, index)" class="sender" autofocus>
          {{ message.fromSelf ? " 我" : user.username }}
        </div>
        {{ message.message }} -->
        <div v-if="message.fromSelf" class="right" autofocus>
          <span class="content"> {{ message.message }} </span>
          <span v-if="displaySender(message, index)" class="sender" autofocus>
            {{ " 我" }}
          </span>
          <span v-else class="hide sender" autofocus>
            {{ " 我" }}
          </span>
        </div>
        <div v-else class="left" autofocus>
          <span v-if="displaySender(message, index)" class="sender" autofocus>
            {{ user.username }}
          </span>
          <span v-else class="hide sender" autofocus>
            {{ user.username }}
          </span>
          <span class="content"> {{ message.message }} </span>
        </div>
      </li>
    </ul>

    <form @submit.prevent="onSubmit" class="form">
      <textarea v-model="input" placeholder="请输入..." class="input" />
      <button type="submit" :disabled="!isValid" class="send-button">发送</button>
      <button type="button" @click="goLive()" class="send-button">视频</button>
    </form>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon";

export default {
  name: "MessagePanel",
  components: {
    StatusIcon,
  },
  props: {
    user: Object,
  },
  data() {
    return {
      input: "",
      empty: null,
    };
  },
  methods: {
    goLive() {
      this.$emit("live");
    },
    onSubmit() {
      this.$emit("input", this.input);
      this.input = "";
    },
    displaySender(message, index) {
      return (
        index === 0 ||
        this.user.dialog[index - 1].fromSelf !==
          this.user.dialog[index].fromSelf
      );
    },
  },
  computed: {
    isValid() {
      return this.input.length > 0;
    },
  },
};
</script>

<style scoped>
.header {
  position: fixed;
  left: 260px;
  right: 0;
  line-height: 40px;
  padding: 10px 20px;
  border-bottom: 1px solid #dddddd;
}

.messages {
  position: fixed;
  top: 120px;
  left: 260px;
  right: 50px;
  bottom: 90px;
  overflow: auto;
  margin: 5px;
}

.message {
  list-style: none;
  margin: 12px 4px;
}

.sender {
  font-weight: bold;
  margin: 5px;
}

.form {
  position: fixed;
  left: 260px;
  right: 0;
  bottom: 0;
  padding: 10px;
}

.input {
  width: 80%;
  resize: none;
  padding: 10px;
  line-height: 1.5;
  border-radius: 5px;
  border: 1px solid #000;
}

.send-button, input {
  vertical-align: top;
}

.left {
  text-align: left;
}
.right {
  text-align: right;
}
.hide {
  visibility: hidden;
}
.content {
  background: green;
  color: white;
  padding: 4px;
  border-radius: 5px;
}
</style>
