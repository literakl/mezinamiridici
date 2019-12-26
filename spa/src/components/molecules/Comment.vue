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
    name: String,
    title: String,
    date: String,
    upvotes: Number,
    downvotes: Number,
    depth: Number,
    userId: String
  },
  components: {
    Textarea,
  },
  data() {
    return {
      mutableUpvotes: this.upvotes,
      mutableDownvotes: this.downvotes,
      showByIndex: null,
      upvoted: false,
      downvoted: false,
      replying: false,
    };
  },
  methods: {
    epochToTime(epoch){
      const date = new Date(parseInt(epoch));
      return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
    },
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
      this.mutableUpvotes = (this.mutableUpvotes  || 0) + 1;
      this.toggleUpvoted();
      //call post webservices here
      this.$store.dispatch('COMMENT_VOTE', { vote: 1,pollId:this.pollId,commentId:this.commentId });
    },
    downvote() {
      if (this.downvoted) return;
      this.mutableDownvotes = (this.mutableDownvotes || 0) - 1;
      this.toggleDownvoted();
      //call post webservices here
      this.$store.dispatch('COMMENT_VOTE', { vote: -1,pollId:this.pollId,commentId:this.commentId });
    },
    reply() {
      // this.showByIndex = null
      this.replying = !this.replying;
      this.showByIndex = 1;
    },
    hoverIn() {
      console.log('[hoverIn]');
      this.showByIndex = 1;
    },
    hoverOut() {
      console.log('[hoverOut]');
      if(this.replying){
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
