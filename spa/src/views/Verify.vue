<template>
    <div class="verify">
      <h1>{{ $t(('sign-up.verify-heading')) }}</h1>
      <p v-if="verified === null" class="verifying">{{ $t(('sign-up.verify-running')) }}</p>
      <p v-if="verified === false" class="failed">{{ $t(('sign-up.verify-error')) }}</p>
      <p v-if="verified === true" class="success">{{ $t(('sign-up.verify-success')) }} <router-link :to="{ name: 'sign-in' }">{{ $t(('app.sign-in')) }}</router-link></p>
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
      this.verified = true;
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

.success {
}
</style>
