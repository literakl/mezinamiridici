<template>
  <div class="pt-3 mt-5 border centerbox">
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
  max-width:700px;
  margin: 0 auto 20px;
  padding: 25px 35px;
  border-radius: 4px;
}
.head-area{
  padding-bottom:0px;
  margin-bottom:10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  }
.head-area h2 {
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  width:100%;
  padding: 0 0 15px 0;
}
@media (max-width: 700px) {
  .centerbox{
    margin-right:35px;
    margin-left:35px;
    padding:25px 20px;
  }
}
</style>
