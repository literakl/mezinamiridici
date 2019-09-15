<template>
    <div>
        <h4>
            {{name}}, {{date}}
        </h4>
        <p>
            {{title}}
        </p>
        <div>
            +{{mutableUpvotes}} / -{{mutableDownvotes}}
            <button v-on:click="upvote" class="comment__reply-vote-button">+</button>
            <button v-on:click="downvote"  class="comment__reply-vote-button">-</button>
            <span class="comment__reply-link" v-on:click="reply" v-if="!replying">Reply</span>
            <span class="comment__reply-link" v-on:click="reply" v-if="replying">Close Reply</span>
            <div v-bind:class="(replying ? 'comment__reply-wrapper' : 'comment__reply-wrapper--hidden')">
              <Textarea />
            </div>
        </div>
    </div>
</template>

<script>
import Textarea from '@/components/atoms/Textarea.vue'

export default {
  name: 'Comment',
  props: {
    name: String,
    title: String,
    date: String,
    upvotes: Number,
    downvotes: Number,
    depth: Number,
  },
  components: {
    Textarea
  },
  data() {
    return {
      mutableUpvotes: this.upvotes,
      mutableDownvotes: this.downvotes,
      upvoted: false,
      downvoted: false,
      replying: false,
    };
  },
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
      this.mutableUpvotes = this.mutableUpvotes + 1;
      this.toggleUpvoted();
    },
    downvote() {
      if (this.downvoted) return;
      this.mutableDownvotes = this.mutableDownvotes - 1;
      this.toggleDownvoted();
    },
    reply() {
      this.replying = !this.replying;
    }
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

.comment__reply-wrapper {
  margin-top: 20px;
}

.comment__reply-wrapper--hidden  {
  display: none;
}

.comment__reply-vote-button {
  background-color: black;
  color: white;
  height: 20px;
  width: 20px;
  border-radius: 5px;
  font-size: 20px;
  font-weight: 700;
  border: 0px;
  line-height: 1px;
  margin: 0 0 0 10px;
  padding: 0;
  padding-bottom: 3px;
  cursor: pointer;
}

.comment__reply-vote-button:hover {
  background: #333333;
}
</style>
