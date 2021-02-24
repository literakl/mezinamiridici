<template>
  <div class="pt-3 mt-5 border w-75 centerbox">
    <b-row>
      <b-col>
        <div class="head-area">
          <h2>{{ $t(('sign-up.verify-heading')) }}</h2>
        </div>
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
import { BRow, BCol } from 'bootstrap-vue';

export default {
  name: 'Verify',
  components: {
    BRow,
    BCol,
  },
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
<style scoped>
.centerbox{
  max-width:500px;
  margin: 0 auto 20px;
  box-shadow: var(--big-shadow);
  padding: 25px 20px;
  border-radius: 4px 4px 0 0;
}
.head-area{
  padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ddd;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }
.head-area h2 {
    font-size: 20px;
    margin-bottom: 0;
    padding-bottom: 0px;
}
</style>
