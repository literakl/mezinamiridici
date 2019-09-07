<template>
  <div>
    <div id="header-wrapper">
      <div id="header">
        <div id="logo-image">
          <router-link to="/">
            <img src="./assets/logo.png" >
          </router-link>
        </div>
        <div id="logo">
          <h1>Between us Drivers</h1>
          <h2>The only web you can discuss traffic problems</h2>
        </div>
        <div id="sign-in">
          <router-link to="/sign-up">Sign up</router-link> /
          <router-link to="/sign-in">Sign in</router-link>
        </div>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
  body {
    margin: 0;
    padding: 0;
    color: #000;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #header-wrapper {
    background: #000;
    color: #FFF;
    border-bottom: 5px solid #ffd302;
    height: 220px;
  }

  #header {
    display: grid;
    grid-template-columns: 0.1fr 1fr 1fr;
    grid-gap: 1em;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
  }

  #logo {
    grid-column: 2/ span 2;
    padding-top: 30px;
    line-height: 23px;
    font-size: 12px;
  }

  #sign-in {
    grid-column: auto / span 3;
    font-size: 16px;

    a {
      color: #ffd302;

      &.router-link-exact-active {
        color: #a08500;
      }
    }

    a:hover {
      color: #ffe45b
    }
  }

  @media all and (min-width: 850px) {
    #header-wrapper {
      height: 200px;
    }

    #sign-in {
      grid-column: 3 / 3;
      padding-top: 80px;
      text-align: right;
      font-size: 16px;
    }

    #logo {
      grid-column: 2 / 3;
      padding-top: 50px;
      line-height: 20px;
    }

    #logo-image {
      grid-column: 1 / 1;
    }
  }
</style>
