<template>
    <div>
        <div v-for="comment in comments" v-bind:key="comment.id">
            <div
                v-bind:class="(
                    parseInt(depth) === 0  || parseInt(depth) > 5) ?
                    'comment__parent' :
                    'comment__child'"
            >   
                <Comment
                    :pollId="pollId"
                    :commentId="comment.commentId"
                    :userId="comment.userId"
                    :name="comment.nickname"
                    :title="comment.text"
                    :upvotes="comment.upvotes"
                    :downvotes="comment.downvotes"
                    :date="comment.created.toString()"
                    :depth="parseInt(depth)"
                />
                <Comments
                    :pollId="pollId"
                    v-if="comment.comments !== undefined"
                    :comments="comment.comments"
                    :depth="parseInt(depth) + 1"
                />
            </div>
        </div>
    </div>
</template>

<script>
import Comment from '@/components/molecules/Comment.vue';

export default {
  name: 'Comments',
  props: {
    pollId: String,
    comments: Array,
    depth: Number,
  },
  components: {
    Comment,
  },
};
</script>

<style>
.comment__child {
  margin-left: 30px;
}
</style>
