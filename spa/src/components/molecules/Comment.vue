<template>
    <div class="comment_outer" @mouseenter="hoverIn" @mouseleave="hoverOut">
        <h4>
            <router-link :to="{ name: 'user-profile', params: { id: userId }}">{{name}}</router-link>, {{epochToTime(date)}}
        </h4>
        <p>
            {{title}}
        </p>
        <div>
            +{{mutableUpvotes}} / -{{mutableDownvotes}}
            <button v-show="showByIndex === 1" v-on:click="upvote" class="comment__reply-vote-button">+</button>
            <button v-show="showByIndex === 1" v-on:click="downvote"  class="comment__reply-vote-button">-</button>
            <span v-show="showByIndex === 1" class="comment__reply-link" v-on:click="reply" v-if="!replying">{{ $t('comment.reply') }}</span>
            <!-- <span class="comment__reply-link" v-on:click="reply" v-if="replying">{{ $t('comment.close') }}</span> -->
            <div v-show="replying" v-bind:class="(replying ? 'comment__reply-wrapper' : 'comment__reply-wrapper--hidden')">
              <Textarea :id="pollId" :parent="commentId" />
            </div>
        </div>
    </div>
</template>

<script>
import Textarea from '@/components/atoms/Textarea.vue';

export default {
  name: 'Comment',
  props: {
    pollId: String,
    commentId: String,
    comment: Object,
    name: String,
    title: String,
    date: String,
    upvotes: Number,
    downvotes: Number,
    depth: Number,
    userId: String,
  },
  components: {
    Textarea,
  },
  data() {
    if (this.comment !== undefined && this.comment.votedUserList !== undefined
    && this.comment.votedUserList.length > 0 && this.comment.votedUserList.indexOf(this.$store.getters.USER_ID) > -1
    && ((this.comment.upvotes !== undefined && this.comment.upvotes > 0)
    || (this.comment.downvotes !== undefined && this.comment.downvotes > 0))) {
      this.fetched = true;
      this.upvoted = true;
      this.downvoted = true;
    }
    return {
      mutableUpvotes: this.upvotes,
      mutableDownvotes: this.downvotes,
      showByIndex: null,
      upvoted: this.upvoted || false,
      downvoted: this.downvoted || false,
      replying: false,
    };
  },
  methods: {
    epochToTime(epoch) {
      const date = new Date(parseInt(epoch, 10));
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
    toggleUpvoted() {
      this.upvoted = true;
      this.downvoted = true;// false;
    },
    toggleDownvoted() {
      this.upvoted = true;// false;
      this.downvoted = true;
    },
    upvote() {
      console.log('[upvote] ', this.upvoted);
      if (this.upvoted) return;
      this.mutableUpvotes = (this.mutableUpvotes || 0) + 1;
      this.toggleUpvoted();
      // call post webservices here
      this.$store.dispatch('COMMENT_VOTE', { vote: 1, pollId: this.pollId, commentId: this.commentId });
    },
    downvote() {
      console.log('[downvote] ', this.downvoted);
      if (this.downvoted) return;
      this.mutableDownvotes = (this.mutableDownvotes || 0) - 1;
      this.toggleDownvoted();
      // call post webservices here
      this.$store.dispatch('COMMENT_VOTE', { vote: -1, pollId: this.pollId, commentId: this.commentId });
    },
    reply() {
      // this.showByIndex = null
      this.replying = !this.replying;
      this.showByIndex = 1;
    },
    hoverIn() {
      this.showByIndex = 1;
    },
    hoverOut() {
      if (this.replying) {
        this.replying = !this.replying;
      }
      this.showByIndex = null;
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
.comment_outer:hover {
  background: #CFD8DC
}
</style>
