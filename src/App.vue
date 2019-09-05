<template>
  <div id="app">
    <div id="header">
      <h1>Between us Drivers</h1>
      <div id="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/sign-up">Sign up</router-link> |
        <router-link to="/sign-in">Sign in</router-link>
      </div>
    </div>
    <div id="body">
      <router-view/>
    </div>
  </div>
</template>

<style lang="scss">
body {
  background-color: #f6f6f6;
  margin: 0px;
  padding: 0px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000;
}
#header {
  background-color: #000;
  color: #FFF;
  padding: 30px;
  a {
    font-weight: bold;
    color: #FFF;
    &.router-link-exact-active {
      color: rgb(187, 187, 187);
    }
  }
}
  #body {
    width: 1024px;
    margin: 0 auto;
  }
</style>
