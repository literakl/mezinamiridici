<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <b-row>
      <b-col>
        <h1>{{ $t(('sign-up.verify-heading')) }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="rejected === null">
        <p class="text-success">{{ $t(('sign-up.verify-running')) }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="rejected === false">
        <p class="text-danger">{{ $t(('sign-up.verify-error')) }}</p>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'Verify',
  data: () => ({
    rejected: null,
    type: String,
  }),
  props: {
    token: String,
  },
  async created() {
    if (this.$route.name.indexOf('poll') > -1) { this.type = 'poll'; }
    if (this.$route.name.indexOf('reaction') > -1) { this.type = 'reaction'; }
    try {
      await this.$store.dispatch('REJECT_NOTIFICATION', {
        token: this.token,
        type: this.type,
      });
      await this.$router.push({
        name: 'sign-in',
        params: {
          message: this.$t('sign-up.verify-success'),
        },
      });
    } catch (error) {
      this.$log.error(error);
      this.rejected = false;
    }
  },
};
</script>
