<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">&ensp;主页&ensp;</router-link> |
      <router-link to="/app">&ensp;在线挂号&ensp;</router-link> |
      <router-link to="/chat">&ensp;咨询&ensp;</router-link> |
      <a>&ensp;在线门诊&ensp;</a> |
      <router-link to="/me">&ensp;我的&ensp;</router-link>
    </div>
    <router-view/>
  </div>
</template>
<script>
  
</script>

<style lang="scss">
@import './assets/common.css';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 0px 20px 0px;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);
  text-align: center;

  a {
    font-weight: bold;
    padding: 10px;
    color: inherit;
    text-decoration: none;

    :hover{
      background: black;
      color: white;
    }

    &.router-link-exact-active {
      background: black;
      color: white;
      text-decoration: none;
    }
  }
}
</style>
