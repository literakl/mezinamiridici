<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('poll.forms.edit-poll') }}</h1>

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
