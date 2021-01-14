<template>
  <div class="mt-5 center-box">
    <div class="head-area">
      <h2>{{ $t('poll.forms.edit-poll') }}</h2>
    </div>
    <PollForm v-if="poll" :poll="poll" :isCreate="false"/>
  </div>
</template>

<script>

import PollForm from '@/components/organisms/PollForm.vue';

export default {
  components: {
    PollForm,
  },
  props: {
    slug: String,
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
    role() {
      return this.$store.getters.USER_ROLE[0] === 'admin:poll';
    },
  },
  created() {
    this.$store.dispatch('GET_POLL', { slug: this.slug });
  },
  mounted() {
    if (!this.role) this.$router.push('/');
  },
};
</script>
<style scoped>
.center-box{
  background-color: #fff;
  padding: 20px 20px;
  font-size: 0.8em;
  color: #777A7C;
  font-weight: 600;
  box-shadow: var(--drop-shadow-two);
     max-width: 700px;
  margin: 0 auto 30px auto;
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
.center-box h2{
  margin: 0;
  font-size: 22px;
  color: var(--text-color);
}

</style>
