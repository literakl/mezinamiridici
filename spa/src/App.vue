<template>
  <div>
    <header>
      <b-container fluid class="bg-dark">
        <b-row class="pt-4 pb-4 w-75 m-auto">
          <b-col md="9">
            <b-row>
              <b-col md="3">
                <router-link to="/">
                  <img :alt="$t('app.logo-alt')" src="./assets/logo.png" >
                </router-link>
              </b-col>
              <b-col md="9" class="mt-auto">
                  <h1 class="text-white">{{ $t('app.name') }}</h1>
                  <h2 class="text-white">{{ $t('app.slogan') }}</h2>
              </b-col>
            </b-row>
          </b-col>
          <b-col md="3" class="mt-auto mb-auto text-white">
            <router-link class="text-warning" :to="{ name: 'sign-up'}">{{ $t('app.sign-up') }}</router-link> /
            <router-link class="text-warning" :to="{ name: 'sign-in'}">{{ $t('app.sign-in') }}</router-link>
          </b-col>
        </b-row>
      </b-container>
      <div class="bg-warning pt-2"></div>
    </header>
    <main>
      <router-view/>
    </main>
    <footer>
      <b-container fluid class="bg-dark footer">
        <b-row class="pt-4 pb-4 w-75 m-auto">
          <b-col>
            <b-nav>
              <b-nav-item><router-link class="text-warning" :to="{ name: 'help'}">{{ $t('app.help') }}</router-link></b-nav-item>
              <b-nav-item><router-link class="text-warning" :to="{ name: 'mission'}">{{ $t('app.our-mission') }}</router-link></b-nav-item>
              <b-nav-item><router-link class="text-warning" :to="{ name: 'contact'}">{{ $t('app.contact') }}</router-link></b-nav-item>
              <b-nav-item><router-link class="text-warning" :to="{ name: 'advertisement'}">{{ $t('app.advertisement') }}</router-link></b-nav-item>
              <b-nav-item><router-link class="text-warning" :to="{ name: 'archive'}">{{ $t('app.archive') }}</router-link></b-nav-item>
            </b-nav>
          </b-col>
        </b-row>
      </b-container>
    </footer>
  </div>
</template>

<script>


export default {
  name: 'App',
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
    },
  },
};
</script>
