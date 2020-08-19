<template>
  <div>
    <header>
      <b-navbar toggleable="sm" type="dark" variant="dark">
        <b-navbar-brand href="/">
          <img src="./assets/logo.png" :alt="$t('app.logo-alt')"  class="d-inline-block align-top">
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="d-none d-sm-block">
            <div class="d-inline-flex flex-column">
              <h2><a class="text-white" href="/">{{ $t('app.name') }}</a></h2>
              <span class="text-white">{{ $t('app.slogan') }}</span>
            </div>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto align-items-center">
            <b-nav-item :to="{ name: 'sign-in'}" v-if="!authorized">{{ $t('app.sign-in-up') }}</b-nav-item>
            <b-nav-item-dropdown v-if="authorized" toggle-class="text-warning" right>
              <template v-slot:button-content>
                <BIconPlus scale="2"></BIconPlus>
              </template>
              <b-dropdown-item :to="{ name: 'create-blog' }">{{ $t('app.new-post') }}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown v-if="authorized" toggle-class="text-warning" right>
              <template v-slot:button-content>
                <BIconPersonFill scale="2"></BIconPersonFill>
              </template>
              <b-dropdown-item :to="{ name: 'user-profile', params: { id: userId } }">{{ $t('app.my-profile') }}</b-dropdown-item>
              <b-dropdown-item :to="{ name: 'update-password'}">{{ $t('app.change-password') }}</b-dropdown-item>
              <b-dropdown-item href="#0" v-on:click="signMeOut()">{{ $t('app.sign-out') }}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown toggle-class="text-warning" right>
              <template v-slot:button-content>
                <BIconInfo scale="2"></BIconInfo>
              </template>
              <b-dropdown-item :to="{ name: 'help'}">{{ $t('app.help') }}</b-dropdown-item>
              <b-dropdown-item :to="{ name: 'mission'}">{{ $t('app.our-mission') }}</b-dropdown-item>
              <b-dropdown-item :to="{ name: 'contact'}">{{ $t('app.contact') }}</b-dropdown-item>
              <b-dropdown-item :to="{ name: 'advertisement'}">{{ $t('app.advertisement') }}</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </header>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
import { BIconPersonFill, BIconInfo, BIconPlus } from 'bootstrap-vue';

export default {
  name: 'App',
  components: {
    BIconPersonFill, BIconInfo, BIconPlus,
  },
  computed: {
    authorized() {
      return this.$store.getters.IS_AUTHORIZED;
    },
    userId() {
      return this.$store.getters.USER_ID;
    },
    nickname() {
      return this.$store.getters.USER_NICKNAME;
    },
  },
  created() {
    this.$store.dispatch('LOAD_USER');
  },
  methods: {
    signMeOut() {
      this.$store.dispatch('SIGN_USER_OUT');
      if (this.$route.path === '/') {
        this.$root.$emit('sign-out');
      } else {
        this.$router.push({ name: 'home' });
      }
    },
  },
};
</script>
<style lang="scss">
  @import "./assets/styles/custom.scss";
  @import '~bootstrap/scss/bootstrap.scss';
  @import '~bootstrap-vue/src/index.scss';
</style>
