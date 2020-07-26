<template>
  <div class="comment__child">
    <div v-for="reply in replies" v-bind:key="reply._id">
      <Comment :itemId="itemId" :comment="reply" />
    </div>
    <Button v-if="!comment.allShown" :value="$t('comment.show-all')" @clicked="showAll()"
            size="sm" class="mb-2"
    />
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
    replies() {
      return this.$store.getters.GET_REPLIES(this.comment._id).map(id => this.$store.getters.GET_COMMENT(id));
    },
  },
  methods: {
    getComment(commentId) {
      return this.$store.getters.GET_COMMENT(commentId);
    },
    async showAll() {
      this.$store.commit('SHOW_ALL_REPLIES', { commentId: this.comment._id });
    },
    async refreshReplies() {
      const payload = {
        itemId: this.itemId,
        commentId: this.comment._id,
        // lastSeen: this.replies[this.replies.length - 1]._id,
      };
      await this.$store.dispatch('FETCH_REPLIES', payload);
    },
  },
};
</script>

<style>
.comment__child {
  margin-left: 60px;
}
</style>
