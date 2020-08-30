<template>
  <div class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! poll" type="poll" />
    <CompletePoll v-if="poll" />
    <ShareLink :item="poll" />
    <Comments v-if="poll" :itemId="poll._id" />
  </div>
</template>

<script>
import CompletePoll from '@/components/organisms/CompletePoll.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import ShareLink from '@/components/molecules/ShareLink.vue';
import Comments from '@/components/organisms/Comments.vue';

export default {
  name: 'poll',
  components: {
    Comments,
    CompletePoll,
    ContentLoading,
    ShareLink,
  },
  props: {
    slug: String,
  },
  computed: {
    poll() {
      const poll = this.$store.getters.POLL;
      if (poll) this.changeTitle(poll.info.caption);
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
  methods: {
    changeTitle(title) {
      setTimeout(() => { document.title += `\xa0\xa0-\xa0\xa0${title}`; }, 10);
    },
  },
};
</script>
