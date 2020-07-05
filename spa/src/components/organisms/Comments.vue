<template>
  <div class="" id="comments">
    <h3>{{ $t('comment.discussion') }}</h3>

    <div v-if="signedIn">
      <CommentForm :itemId="itemId" :dismissable="false"/>
    </div>

    <!-- Novejsi reload button -->

<!--    <div v-if="comments.length">-->
      <div v-for="comment in comments" v-bind:key="comment._id">
        <Comment :itemId="itemId" :comment="comment" />
        <Replies v-if="comment.replies.length > 0" :itemId="itemId" :comment="comment" />

        <!-- nacist odpovedi v-if="comment.replies === undefined" -->
      </div>
<!--    </div>-->
    <Button v-if="incomplete" :value="$t('comment.load-more')" size="sm" @clicked="loadMoreComments(itemId)" />
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
      return this.$store.getters.DISCUSSION.incomplete;
    },
    comments() {
      return this.$store.getters.DISCUSSION.comments.map(id => this.$store.getters.GET_COMMENT(id));
    },
  },
  created() {
    console.log('Starting to fetch comments');
    this.$store.dispatch('FETCH_COMMENTS', { itemId: this.itemId }).then(() => {
      console.log('fetched comments in Comments.vue');
      // this.comments = this.$store.getters.DISCUSSION;
    });
  },
  beforeDestroy() {
    this.$store.commit('DESTROY_COMMENTS');
  },
  methods: {
    loadMoreComments(itemId) {
      const payload = { itemId };
      if (this.comments.length > 0) {
        payload.lastSeen = this.comments[this.comments.length - 1]._id;
      }
      this.$store.dispatch('FETCH_COMMENTS', payload);
    },
  },
};
</script>
