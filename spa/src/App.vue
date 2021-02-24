<template>
  <div>
    <header>
      <b-navbar toggleable="sm" type="dark" variant="dark">
        <b-nav-item href="/" class="brand-pic">
          <img src="/images/icons/logo.png" :alt="$t('app.logo-alt')"  class="d-inline-block align-top brand">
        </b-nav-item>
          <b-navbar-nav class="d-none d-sm-block">
            <div class="d-inline-flex flex-column title-tag">
              <h2><a class="text-white" href="/">{{ $t('app.name') }}</a></h2>
              <span class="text-white">{{ $t('app.slogan') }}</span>
            </div>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto align-items-center rightmenu">
            <b-nav-item :to="{ name: 'sign-in'}" v-if="!authorized">{{ $t('app.sign-in-up') }}</b-nav-item>
            <b-nav-item-dropdown v-if="authorized" toggle-class="text-warning" right>
              <template v-slot:button-content>
                <BIconPencilSquare scale="2"></BIconPencilSquare>
                POST
              </template>
              <b-dropdown-item :to="{ name: 'create-blog', params: { id: userId } }">{{ $t('app.new-post') }}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown v-if="authorized" toggle-class="text-warning" right>
              <template v-slot:button-content>
                <BIconPersonCircle scale="2"></BIconPersonCircle>
                USER
              </template>
              <b-dropdown-item :to="{ name: 'user-profile', params: { id: userId } }">{{ $t('app.my-profile') }}</b-dropdown-item>
              <b-dropdown-item :to="{ name: 'update-profile', params: { id: userId }}">{{ $t('app.update-profile') }}</b-dropdown-item>
              <b-dropdown-item href="#0" v-on:click="signMeOut()">{{ $t('app.sign-out') }}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown toggle-class="text-warning" right>
              <template v-slot:button-content>
                <BIconInfoCircle scale="2"></BIconInfoCircle>
                HELP
              </template>
              <b-dropdown-item href="/o/napoveda">{{ $t('app.help') }}</b-dropdown-item>
              <b-dropdown-item href="/o/mise">{{ $t('app.our-mission') }}</b-dropdown-item>
              <b-dropdown-item href="/o/kontakt">{{ $t('app.contact') }}</b-dropdown-item>
              <b-dropdown-item href="/o/reklama">{{ $t('app.advertisement') }}</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
      </b-navbar>
    </header>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
import { BIconPersonCircle, BIconInfoCircle, BIconPencilSquare,
  BNavbar, BNavbarNav, BNavItemDropdown, BDropdownItem,
  BNavItem } from 'bootstrap-vue';

export default {
  name: 'App',
  components: {
    BIconPersonCircle,
    BIconInfoCircle,
    BIconPencilSquare,
    BNavbar,
    BNavbarNav,
    BNavItemDropdown,
    BDropdownItem,
    BNavItem,
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
</style>
