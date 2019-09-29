<template>
    <div class="verify">
        <h1>Verify your account</h1>
        <p v-if="verified === null">Thanks, we're just verifying that for you, hold tight...</p>
        <p v-if="verified === false">Sorry, we couldn't verify that account, please try again or contact support.</p>
        <p v-if="verified === true">Account now verified, please <router-link :to="{ name: 'sign-in' }">sign in</router-link>.</p>
    </div>
</template>

<script>

export default {
  name: 'verify',
  data: () => ({
    verified: null
  }),
  props: {
    token: String
  },
  created: async function (){
    try {
      await this.$store.dispatch('VERIFY_USER', {
        token: this.token
      });
      this.verified = true;
    } catch(e) {
      this.verified = false;
    }
  }
};
</script>

<style>
.verify {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    height: 100%;
}
</style>
