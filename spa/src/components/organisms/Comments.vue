<template>
    <div v-if="commentslist.length">

        <div v-for="(comment, index) in commentslist" v-bind:key="comment.id">
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
                    :title="comment.commentText"
                    :upvotes="comment.upvotes"
                    :downvotes="comment.downvotes"
                    :date="comment.created.toString()"
                    :depth="parseInt(depth)"
                    :childCommentCount="comment.childCommentCount"
                />
                <ChildComments
                    :pollId="pollId"
                    v-if="comment.comments !== undefined"
                    :childCommentsList="comment.comments"
                    :paginations="paginations[index]"
                    :depth="parseInt(depth) + 1"
                    :rootIndex="index"
                    @paginate="paginate"
                />
            </div>
        </div>
    </div>
</template>

<script>
import Comment from '@/components/molecules/Comment.vue';
import ChildComments from '@/components/organisms/ChildComments.vue';

export default {
  name: 'Comments',
  data() {
    return {
      paginations: [],
    };
  },
  props: {
    pollId: String,
    depth: Number,
    commentslist: Array,
  },
  components: {
    Comment,
    ChildComments,
  },
  methods: {
    paginate(event) {
      this.$set(this.paginations, event.rootIndex, this.paginations[event.rootIndex] + 1);
    },
    changeData() {
      for (let index = 0; index < this.commentslist.length; index += 1) {
        this.$set(this.paginations, index, 2);
      }
      return this.paginations;
    },
  },
  watch: {
    commentslist() {
      this.changeData();
    },
  },
};
</script>

<style>
  .comment__child {
    margin-left: 30px;
  }
</style>
