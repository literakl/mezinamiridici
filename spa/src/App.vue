<template>
  <div>
    <header>
      <b-navbar toggleable="sm" type="dark" variant="dark">
        <b-nav-item class="brand-pic" href="/">
          <img :alt="$t('app.logo-alt')" class="d-inline-block align-top brand"
               src="/images/icons/logo.png">
        </b-nav-item>

        <b-navbar-nav class="d-none d-sm-block d-sm-dark">
          <div class="d-inline-flex flex-column title-tag">
            <h2><a class="text-white" href="/">{{ $t('app.name') }}</a></h2>
            <span class="text-white">{{ $t('app.slogan') }}</span>
          </div>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto align-items-center rightmenu info">
          <b-nav-item v-if="!authorized">
            <router-link :to="{ name: 'sign-in'}">
              {{ $t('app.sign-in-up') }}
            </router-link>
          </b-nav-item>

          <b-nav-item v-if="authorized" v-b-tooltip.hover :title="$t('app.new-post')" class="edit"
                      right toggle-class="text-warning ">
            <router-link :to="{ name: 'create-blog', params: { id: userId } }">
              <BIconPencilSquare scale="2"></BIconPencilSquare>
            </router-link>
          </b-nav-item>

          <b-nav-item-dropdown v-if="authorized" class="sign-out" right
                               toggle-class="text-warning ">
            <template v-slot:button-content>
              <BIconPersonCircle scale="2"></BIconPersonCircle>
            </template>

            <b-dropdown-item>
              <router-link :to="{ name: 'user-profile', params: { id: userId } }"
                           class="dropdown-item p-0">
                {{ $t('app.my-profile') }}
              </router-link>
            </b-dropdown-item>

            <b-dropdown-item>
              <router-link :to="{ name: 'update-profile', params: { id: userId }}"
                           class="dropdown-item p-0">
                {{ $t('app.update-profile') }}
              </router-link>
            </b-dropdown-item>

            <b-dropdown-item v-if="canWriteArticles">
              <router-link :to="{ name: 'articles'}" class="dropdown-item p-0">
                {{ $t('page-title.articles') }}
              </router-link>
            </b-dropdown-item>

            <b-dropdown-item class="sign-out-account" href="#0" v-on:click="signMeOut()">
              {{ $t('app.sign-out') }}
            </b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown right toggle-class="text-warning">
            <template v-slot:button-content>
              <BIconInfoCircle scale="2"></BIconInfoCircle>
            </template>

            <b-dropdown-item href="/o/napoveda">{{ $t('app.help') }}</b-dropdown-item>
            <b-dropdown-item href="/o/mise">{{ $t('app.our-mission') }}</b-dropdown-item>
            <b-dropdown-item href="/o/kontakt">{{ $t('app.contact') }}</b-dropdown-item>
            <b-dropdown-item href="/o/reklama">{{ $t('app.advertisement') }}</b-dropdown-item>
            <b-dropdown-item href="/o/podminky">{{ $t('app.terms') }}</b-dropdown-item>
            <b-dropdown-item href="/o/soukromi">{{ $t('app.privacy') }}</b-dropdown-item>
            <b-dropdown-item href="#0" v-on:click="manageCookies()">{{
                $t('app.cookies')
              }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-navbar>

      <info-box></info-box>

      <b-button v-if="updateExists"
                class="w-100 fixed-top bg-warning text-dark rounded-0 border-warning"
                @click="refreshApp">
        {{ $t('app.update') }}
      </b-button>
    </header>
    <main>
      <router-view/>
    </main>
    <CookiesBox @cookiePreferenceChange="handleCookies($event)"/>
  </div>
</template>

<script>
import {
  BIconPersonCircle,
  BIconInfoCircle,
  BIconPencilSquare,
  BNavbar,
  BNavbarNav,
  BNavItemDropdown,
  BDropdownItem,
  BNavItem,
  BButton
} from 'bootstrap-vue';
import InfoBox from '@/components/molecules/InfoBox.vue';
import CookiesBox from '@/components/molecules/CookiesBox.vue';
import update from './modules/mixins/update';

export default {
  name: 'App',
  mixins: [update],
  components: {
    BButton,
    BIconPersonCircle,
    BIconInfoCircle,
    BIconPencilSquare,
    BNavbar,
    BNavbarNav,
    BNavItemDropdown,
    BDropdownItem,
    BNavItem,
    CookiesBox,
    InfoBox,
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
    canWriteArticles() {
      return this.$store.getters.IS_STAFFER || this.$store.getters.IS_EDITOR_IN_CHIEF;
    },
  },
  created() {
    this.$store.dispatch('LOAD_USER');
  },
  methods: {
    makeToast() {
      this.$bvToast.toast('Toast body content', {
        title: 'Update',
        variant: 'success',
        solid: true
      });
    },
    signMeOut() {
      this.$store.dispatch('SIGN_USER_OUT');
      if (this.$route.path === '/') {
        this.$root.$emit('sign-out');
      } else {
        this.$router.push({ name: 'home' });
      }
    },
    handleCookies(preferences) {
      gtag('consent', 'update', {
        ad_storage: preferences.ad ? 'granted' : 'denied',
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        personalization_storage: preferences.personalization ? 'granted' : 'denied',
      });
    },
    manageCookies() {
      this.$store.commit('SHOW_COOKIES_DIALOG', true);
    },
  },
};
</script>
<style lang="scss">
@import "./assets/styles/custom.scss";
@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-vue/src/index.scss';
</style>
