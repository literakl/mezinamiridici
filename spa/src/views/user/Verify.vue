<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <b-row>
      <b-col>
        <h1>{{ $t(('sign-up.verify-heading')) }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="verified === null">
        <p class="text-success">{{ $t(('sign-up.verify-running')) }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="verified === false">
        <p class="text-danger">{{ $t(('sign-up.verify-error')) }}</p>
      </b-col>
    </b-row>
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
    } catch (error) {
      this.$log.error(error);
      this.verified = false;
    }
  },
};
</script>
