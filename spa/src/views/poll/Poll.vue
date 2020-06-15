<template>
  <b-container fluid="true" class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <CompletePoll v-if="poll" />
    <ContentLoading v-if="! poll" type="poll" />

   <div class="poll__discussion-break-out" v-if="poll">
     <div class="poll__discussion-wrapper">
       <h2>{{ $t('poll.discussion') }} ({{commentslist ? commentslist.length : 0}})</h2>

       <div v-if="signedIn">
         <h3>{{ $t('poll.your-say') }}</h3>
         <Textarea :id="poll._id" />
       </div>
       <Comments :itemId="poll._id" :commentslist="commentslist" :depth="parseInt(0)" v-if="commentslist" />
       <Button v-if="loadMore" :value="$t('poll.load-more')" class="poll__other-polls-button" @clicked="loadMorePoll(poll._id)"/>
     </div>
   </div>
  </b-container>
</template>

<script>
import CompletePoll from '@/components/organisms/CompletePoll.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import Button from '@/components/atoms/Button.vue';
import Textarea from '@/components/atoms/Textarea.vue';
import Comments from '@/components/organisms/Comments.vue';

export default {
  name: 'poll',
  components: {
    Button,
    Comments,
    Textarea,
    CompletePoll,
    ContentLoading,
  },
  props: {
    slug: String,
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
    loadMorePoll(pollId) {
      const { page, limit, rootCommentsCount } = this.$store.getters.POLL_COMMENTS;
      if (page * limit < rootCommentsCount) {
        this.$store.dispatch('GET_POLL_COMMENTS', { id: pollId, page: page + 1, limit });
      }
    },
  },
  computed: {
    signedIn() {
      return this.$store.getters.IS_AUTHORIZED;
    },
    poll() {
      return this.$store.getters.POLL;
    },
    commentslist() {
      const comments = this.$store.getters.POLL_COMMENTS;
      if (!comments) return [];
      return comments.rootComments;
    },
    loadMore() {
      if (this.$store.getters.POLL_COMMENTS != null) {
        return this.$store.getters.POLL_COMMENTS.page * this.$store.getters.POLL_COMMENTS.limit < this.$store.getters.POLL_COMMENTS.rootCommentsCount;
      }
      return false;
    },
  },
};
</script>
