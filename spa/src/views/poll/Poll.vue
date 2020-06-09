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
       <Comments :pollId="poll._id" :commentslist="commentslist" :depth="parseInt(0)" v-if="commentslist" />

       <div class="poll__other-polls">
         <h2>
           <Button :value="$t('poll.other-polls-button')" class="poll__other-polls-button" @clicked="redirectToOtherPolls" />
           <hr class="poll__double-line" />
           <hr class="poll__double-line" />
         </h2>
       </div>
       <Button :value="$t('poll.load-more')" class="poll__other-polls-button" @clicked="loadMorePoll(poll._id)" v-if="loadMore"/>
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
    redirectToOtherPolls() {
      this.$router.push({ name: 'polls' });
    },
    loadMorePoll(pollId) {
      const { page, limit, rootCommentsCount } = this.$store.getters.POLL_COMMENTS;
      if (page * limit < rootCommentsCount) {
        this.$store.dispatch('GET_POLL_COMMENTS', { id: pollId, page: page + 1, limit });
      }
    },
    redirectToAnalyzeVotes() {
      this.$router.push({ name: 'analyze-votes', params: { id: this.id } });
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
      return true;
    },
  },
};
</script>
