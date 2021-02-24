<template>
  <div class="mt-5 border centerbox">
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
.centerbox{
  max-width: 700px;
  padding: 25px 35px;
  margin: 0 auto 30px auto;
}
.head-area{
  padding-bottom:0px;
  margin-bottom:10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.head-area h2{
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  width:100%;
  padding: 0 0 15px 0;
}
@media (max-width: 700px) {
  .centerbox{
    margin-right: 35px;
    margin-left: 35px;
    padding: 25px 20px;
  }
}

</style>
