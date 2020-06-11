<template>
    <div>
        <div v-for="(comment, index) in childCommentsList.slice(0, paginations)" v-bind:key="comment.id">
            <div
                v-bind:class="(
                    parseInt(depth) === 0  || parseInt(depth) > 5) ?
                    'comment__parent' :
                    'comment__child'"
            >
                <Comment
                    :pollId="pollId"
                    :comment="comment"
                    :commentId="comment._id"
                    :userId="comment.author.userId"
                    :name="comment.author.nickname"
                    :text="comment.text"
                    :upvotes="comment.upvotes"
                    :downvotes="comment.downvotes"
                    :date="comment.created"
                    :depth="parseInt(depth)"
                    :childCommentCount="comment.childCommentCount"
                />
                <Button v-if="(index == paginations - 1) && parseInt(depth) !== 0"
                :value="$t('poll.load-more')" class="poll__other-polls-button"
                @clicked="loadChild"/>
            </div>
        </div>
    </div>
</template>

<script>
import Comment from '@/components/molecules/Comment.vue';
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'Comments',
  data() {
    return {
    };
  },
  props: {
    pollId: String,
    childCommentsList: Array,
    depth: Number,
    rootIndex: Number,
    paginations: Number,
  },
  components: {
    Comment,
    Button,
  },
  methods: {
    loadChild() {
      this.$emit('paginate', { rootIndex: this.rootIndex });
    },
  },
};
</script>

<style>
.comment__child {
  margin-left: 60px;
}
</style>
