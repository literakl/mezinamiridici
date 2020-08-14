<template>
  <b-container fluid="true" class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! poll" type="poll" />
    <CompletePoll v-if="poll" />
    <Comments v-if="poll" :itemId="poll._id" />
  </b-container>
</template>

<script>
import CompletePoll from '@/components/organisms/CompletePoll.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import Comments from '@/components/organisms/Comments.vue';

export default {
  name: 'poll',
  components: {
    Comments,
    CompletePoll,
    ContentLoading,
  },
  props: {
    slug: String,
  },
  computed: {
    poll() {
      const poll = this.$store.getters.POLL;
      if (poll) document.title += poll.info.caption;
      console.log(document.title);
      return poll;
    },
    role() {
      return (this.$store.getters.USER_ROLE) ? this.$store.getters.USER_ROLE[0] === 'admin:poll' : false;
    },
  },
  created() {
    this.$store.dispatch('GET_POLL', { slug: this.slug });
  },
  beforeRouteUpdate(to, from, next) {
    if (from.params.slug !== to.params.slug) {
      this.$store.dispatch('GET_POLL', { slug: to.params.slug });
    }
    next();
  },
};
</script>
