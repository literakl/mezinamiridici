<template>
  <div class="comment__child">
    <div v-for="replyId in comment.replies" v-bind:key="replyId">
      <Comment :itemId="itemId" :comment="getComment(replyId)" />
    </div>
    <!-- nacist novejsi -->
    <Button v-if="!comment.allShown" :value="$t('comment.load-more')" size="sm" @clicked="loadChild()"/>
  </div>
</template>

<script>
import Comment from '@/components/organisms/Comment.vue';
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'Replies',
  components: {
    Comment,
    Button,
  },
  props: {
    itemId: String,
    comment: Object,
  },
  computed: {
  },
  methods: {
    getComment(commentId) {
      return this.$store.getters.GET_COMMENT(commentId);
    },
    loadChild() {
      console.log('loadChild pred');
      const payload = {
        itemId: this.itemId,
        commentId: this.commentId,
        lastSeen: this.replies[this.replies.length - 1]._id,
      };
      this.$store.dispatch('FETCH_REPLIES', payload).then(() => {
        this.replies = this.$store.getters.DISCUSSION;
      });
      console.log('loadChild po');
      // this.$emit('paginate', {  });
    },
  },
};
</script>

<style>
.comment__child {
  margin-left: 60px;
}
</style>
