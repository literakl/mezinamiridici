<template>
  <b-container fluid class="pt-3 w-75 m-auto">
    <h1>{{ $t(('sign-up.verify-heading')) }}</h1>
    <p class="text-success" v-if="verified === null">{{ $t(('sign-up.verify-running')) }}</p>
    <p class="text-danger" v-if="verified === false">{{ $t(('sign-up.verify-error')) }}</p>
  </b-container>
</template>

<script>

export default {
  name: 'Verify',
  data: () => ({
    verified: null,
  }),
  props: {
    token: String,
  },
  async created() {
    try {
      await this.$store.dispatch('VERIFY_USER', {
        token: this.token,
      });
      await this.$router.push({
        name: 'sign-in',
        params: {
          message: this.$t('sign-up.verify-success'),
        },
      });
    } catch (e) {
      this.verified = false;
    }
  },
};
</script>
