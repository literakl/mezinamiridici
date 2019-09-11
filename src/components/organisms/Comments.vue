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
                    :name="comment.name"
                    :title="comment.title"
                    :votes="comment.votes"
                    :date="comment.date"
                    :depth="parseInt(depth)"
                />
                <Comments
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
