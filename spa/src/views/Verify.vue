<template>
    <div class="verify">
      <h1>{{ $t(('sign-up.verify-heading')) }}</h1>
      <p v-if="verified === null" class="verifying">{{ $t(('sign-up.verify-running')) }}</p>
      <p v-if="verified === false" class="failed">{{ $t(('sign-up.verify-error')) }}</p>
    </div>
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

<style>
.verify {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    height: 100%;
}

.verifying {
  color: blue;
}

.failed {
  color: red;
}
</style>
