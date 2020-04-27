<template>
  <b-container fluid class="w-75 m-auto pt-5 pb-5">
    <CompletePoll v-if="poll" />
    <ContentLoading v-if="! poll" type="poll" />

<!--    <div class="poll__discussion-break-out">-->
<!--      <div class="poll__discussion-wrapper">-->
<!--        <h2>{{ $t('poll.discussion') }} ({{comments ? comments.length : 0}})</h2>-->

<!--        <div v-if="signedIn">-->
<!--          <h3>{{ $t('poll.your-say') }}</h3>-->
<!--          <Textarea :id="id" />-->
<!--        </div>-->

<!--        <Comments :pollId="id" :comments="comments" :depth="parseInt(0)" v-if="comments" />-->

<!--        <div class="poll__other-polls">-->
<!--          <h2>-->
<!--            <Button :value="$t('poll.other-polls-button')" class="poll__other-polls-button" @clicked="redirectToOtherPolls" />-->
<!--            <hr class="poll__double-line" />-->
<!--            <hr class="poll__double-line" />-->
<!--          </h2>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </b-container>
</template>

<script>
import CompletePoll from '@/components/organisms/CompletePoll.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
// import Button from '@/components/atoms/Button.vue';
// import Textarea from '@/components/atoms/Textarea.vue';
// import Comments from '@/components/organisms/Comments.vue';

export default {
  name: 'poll',
  components: {
    // Button,
    // Comments,
    // Textarea,
    CompletePoll,
    ContentLoading,
  },
  props: {
    slug: String,
  },
  created() {
    this.$store.dispatch('GET_POLL', { slug: this.slug });
  },
  methods: {
    // redirectToOtherPolls() {
    //   this.$router.push({ name: 'polls' });
    // },
    // redirectToAnalyzeVotes() {
    //   this.$router.push({ name: 'analyze-votes', params: { id: this.id } });
    // },
    // recursivelyBuildComments(allComments, commentsToSearchThrough) {
    //   allComments.forEach((comment) => {
    //     if (comment.parent) {
    //       commentsToSearchThrough.forEach((x) => {
    //         if (!x.comments) return;
    //         const found = x.comments.find(y => y.commentId === comment.parent);
    //
    //         if (found) {
    //           found.comments = [comment];
    //           this.recursivelyBuildComments(allComments, x.comments);
    //         }
    //       });
    //     }
    //   });
    // },
  },
  computed: {
    signedIn() {
      return this.$store.getters.IS_AUTHORIZED;
    },
    poll() {
      return this.$store.getters.POLL;
    },
    /*
    comments() {
      const comments = this.$store.getters.POLL_COMMENTS;

      if (!comments) return [];

      const commentsTree = [];

      comments.forEach((comment) => {
        if (!comment.parent) {
          commentsTree.push(comment);
        }
      });

      comments.forEach((comment) => {
        if (comment.parent) {
          const found = commentsTree.find(x => x.commentId === comment.parent);

          if (found) {
            found.comments = [comment];
          }
        }
      });

      this.recursivelyBuildComments(comments, commentsTree);

      return commentsTree.sort((a, b) => ((a.created < b.created) ? 1 : -1));
    },
    */
  },
};
</script>
