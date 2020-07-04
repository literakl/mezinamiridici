<template>
  <div class="" id="comments">
    <h3>{{ $t('comment.discussion') }}</h3>

    <div v-if="signedIn">
      <CommentForm :itemId="itemId" />
    </div>

    <!-- Novejsi reload button -->

<!--    <div v-if="comments.length">-->
      <div v-for="comment in comments" v-bind:key="comment._id">
        <div class="comment__parent">
          <Comment
            :itemId="itemId"
            :comment="comment"
          />

          <Replies
            v-if="comment.replies !== undefined"
            :itemId="itemId"
            :commentId="comment._id"
            :replies="comment.replies"
          />

          <!-- nacist odpovedi v-if="comment.replies === undefined" -->
        </div>
      </div>
<!--    </div>-->
    <Button v-if="incomplete" :value="$t('comment.load-more')" @clicked="loadMoreComments(itemId)" />
  </div>
</template>

<script>
import Comment from '@/components/organisms/Comment.vue';
import Replies from '@/components/organisms/Replies.vue';
import Button from '@/components/atoms/Button.vue';
import CommentForm from '@/components/molecules/CommentForm.vue';

export default {
  name: 'Comments',
  components: {
    Comment,
    Replies,
    Button,
    CommentForm,
  },
  props: {
    itemId: String,
  },
  computed: {
    signedIn() {
      return this.$store.getters.IS_AUTHORIZED;
    },
    incomplete() {
      return (this.$store.getters.DISCUSSION) ? this.$store.getters.DISCUSSION.incomplete : false;
    },
    comments() {
      return (this.$store.getters.DISCUSSION) ? this.$store.getters.DISCUSSION.comments : [];
    },
  },
  created() {
    console.log('Starting to fetch comments');
    this.$store.dispatch('FETCH_COMMENTS', { itemId: this.itemId }).then(() => {
      console.log('fetched comments in Comments.vue');
      // this.comments = this.$store.getters.DISCUSSION;
    });
  },
  methods: {
    loadMoreComments(itemId) {
      this.$store.dispatch('FETCH_COMMENTS', { itemId });
    },
    // changeData() {
    //   for (let index = 0; index < this.comments.length; index += 1) {
    //     this.$set(this.paginations, index, 2);
    //   }
    //   return this.paginations;
    // },
  },
  // watch: {
  //   comments() {
  //     this.changeData();
  //   },
  // },
};
</script>

<style>
  .comment__child {
    margin-left: 30px;
  }
</style>
