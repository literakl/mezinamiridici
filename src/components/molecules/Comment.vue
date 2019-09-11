<template>
    <div>
        <h4>
            {{name}}, {{date}}
        </h4>
        <p>
            {{title}}
        </p>
        <div>
            {{mutableVotes}}
            <button v-on:click="upvote">+</button>
            <button v-on:click="downvote">-</button>
            <span class="comment__reply-link">
                Reply
            </span>
        </div>
    </div>
</template>

<script>

export default {
  name: 'Comment',
  props: {
    name: String,
    title: String,
    date: String,
    votes: Number,
    depth: Number,
  },
  data: () => ({
    mutableVotes: this.votes,
    upvoted: false,
    downvoted: false,
  }),
  methods: {
    toggleUpvoted() {
      this.upvoted = true;
      this.downvoted = false;
    },
    toggleDownvoted() {
      this.upvoted = false;
      this.downvoted = true;
    },
    upvote() {
      if (this.upvoted) return;
      this.mutableVotes = this.mutableVotes + 1;
      this.toggleUpvoted();
    },
    downvote() {
      if (this.downvoted) return;
      this.mutableVotes = this.mutableVotes - 1;
      this.toggleDownvoted();
    },
  },
};
</script>

<style>
.comment__reply-link{
    font-weight: 900;
    padding-left: 10px;
}

.comment__reply-link:hover {
    text-decoration: underline;
    cursor: pointer;
}
</style>
