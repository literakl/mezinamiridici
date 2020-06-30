<template>
  <div class="comment_outer" @mouseenter="hoverIn" @mouseleave="hoverOut">
    <ProfileLink :profile="comment.user"/> &bull; {{epochToTime(comment.date)}}
    <p>
      {{comment.text}}
    </p>
    <div>
      +{{mutableUpvotes}} / -{{mutableDownvotes}}
      <button v-if="canVote" v-show="showByIndex === 1" v-on:click="upvote" class="comment__reply-vote-button">+</button>
      <button v-if="canVote" v-show="showByIndex === 1" v-on:click="downvote" class="comment__reply-vote-button">-</button>
      <span v-show="showByIndex === 1" class="comment__reply-link" v-on:click="reply" v-if="!replying">{{ $t('comment.reply') }}</span>
      <div v-show="replying" v-bind:class="(replying ? 'comment__reply-wrapper' : 'comment__reply-wrapper--hidden')">
        <CommentForm :itemId="itemId" :parent="comment._id"/>
      </div>
    </div>
  </div>
</template>

<script>
import CommentForm from '@/components/molecules/CommentForm.vue';
import ProfileLink from '@/components/atoms/ProfileLink.vue';

export default {
  name: 'Comment',
  components: {
    CommentForm,
    ProfileLink,
  },
  props: {
    itemId: String,
    comment: Object,
  },
  data() {
    return {
      mutableUpvotes: this.comment.up,
      mutableDownvotes: this.comment.down,
      showByIndex: null,
      voted: this.comment.voted || false, // TODO in backend
      replying: false,
    };
  },
  computed: {
    canVote() {
      return !this.voted && this.comment.user.userId !== this.$store.getters.USER_ID;
    },
  },
  methods: {
    epochToTime(epoch) {
      const date = new Date(epoch);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
    upvote() {
      if (this.voted) return;
      this.mutableUpvotes = (this.mutableUpvotes || 0) + 1;
      this.voted = true;
      this.$store.dispatch('COMMENT_VOTE', {
        vote: 1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
    },
    downvote() {
      if (this.voted) return;
      this.mutableDownvotes = (this.mutableDownvotes || 0) - 1;
      this.voted = true;
      this.$store.dispatch('COMMENT_VOTE', {
        vote: -1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
    },
    reply() {
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
  .comment__reply-link {
    font-weight: bolder;
    padding-left: 10px;
  }

  .comment__reply-link:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .comment__reply-wrapper {
    margin-top: 20px;
  }

  .comment__reply-wrapper--hidden {
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
    padding: 0 0 3px;
    cursor: pointer;
  }

  .comment__reply-vote-button:hover {
    background: #333333;
  }

  .comment_outer:hover {
    background: #CFD8DC
  }
</style>
