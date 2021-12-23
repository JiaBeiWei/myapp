<template>
  <div class="me">
    <div>
      <span>用户名: </span> {{user.username}}
      <input v-if="change" v-model="name" type="text" placeholder="新用户名">
    </div>
    <div>
      <span>电话号码: </span> {{user.phone}}
      <input v-if="change" v-model="phone" type="text" placeholder="新手机号">
    </div>
    <input type="submit" value="更改信息" @click="onChange()">
    <input v-if="change" type="button" value="取消" @click="cancel()">
    <input type="submit" value="退出登录" @click="logout()">

  </div>
</template>

<script>
import socket from "../socket";
import auth from '../services/Authentication'

export default {
  name: "Me",
  data() {
    return {
      user: null,
      change: false,
      name: null,
      phone: null
    };
  },
  methods: {
    logout() {
      socket.disconnect();
      localStorage.clear();
      this.$router.push('/login');
    },
    onChange() {
      if (this.change) {
        if (this.name)
          this.user.username = this.name;
        if (this.phone)
          this.user.phone = this.phone;
        auth.changeName(this.user)
        .then((res) => {
          if (res.status == 200) {
            localStorage.setItem('me',  JSON.stringify(res.data.user));
          }
        })
        this.cancel();
      } else {
        this.change = true;
      }
    },
    cancel() {
      this.change = false;
      this.name = null;
    }
  },
  created() { 
    this.user = JSON.parse(localStorage.getItem("me"));
  },
};
</script>

<style scoped>
.me {
  margin-top: 80px;
}
input {
  display: block;
  text-align: center;
}
div, input {
  margin: 20px auto;
}
</style>
