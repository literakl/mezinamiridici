<template>
  <div>
    <div v-for="comment in replies" v-bind:key="comment._id" class="comment__child">
      <Comment :itemId="itemId" :comment="comment" />
    </div>
    <!-- nacist novejsi -->
    <Button :value="$t('poll.load-more')" @clicked="loadChild()"/>
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
    commentId: String,
    replies: Array,
  },
  computed: {
    showAllReplies() {
      return this.$store.getters.GET_REPLIES(this.commentId).showAllReplies;
    },
  },
  methods: {
    loadChild() {
      const payload = {
        itemId: this.itemId,
        commentId: this.commentId,
        lastSeen: this.replies[this.replies.length - 1]._id,
      };
      this.$store.dispatch('FETCH_REPLIES', payload).then(() => {
        this.replies = this.$store.getters.DISCUSSION;
      });
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
