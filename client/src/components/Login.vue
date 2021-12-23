<template>
  <div> 
    <h1>登录</h1>
    <input v-model="user.phone" placeholder="手机号码" required="required">          
    <input v-model="user.password" type="password" id="password" placeholder="密码" required="required">
    <input type="submit" value="登录" @click="login()">
  </div>
</template>

<script>
import auth from '../services/Authentication'

export default {
  name: "Login",
  data() {
    return {
      user: { phone: null,
            password: null },
    };
  },
  methods: {
    login() {
      auth.login(this.user)
      .then((res) => {
        if (res.status == 200 && res.data.old){
          localStorage.setItem('me',  JSON.stringify(res.data.user));
        }
        this.$router.push('chat') 
      })
    }
  },
};
</script>

<style scoped>
  h1 {
    padding-top: 40px;
  }
  input {
    display: block;
    vertical-align: middle;
    margin: 20px auto;
  }
</style>
