<template>
  <div class="comment_outer" @mouseenter="hoverIn" @mouseleave="hoverOut">
    <div>
      <b>
        <ProfileLink :profile="comment.user"/>
      </b>
      <span v-show="hovered">
        &bull;
        {{epochToTime(comment.date)}}
        </span>
    </div>

    <div class="pt-1 pb-1">
      {{comment.text}}
    </div>

    <div>
      +{{mutableUpvotes}} / -{{mutableDownvotes}}
      <button v-if="canVote" v-show="hovered" v-on:click="upvote" class="comment__reply-vote-button">+</button>
      <button v-if="canVote" v-show="hovered" v-on:click="downvote" class="comment__reply-vote-button">-</button>

      <span v-if="!replying" v-show="hovered" class="comment__reply-link" v-on:click="reply">{{ $t('comment.reply') }}</span>
    </div>

    <div v-show="replying">
      <CommentForm :itemId="itemId" :parent="comment._id" @dismiss="dismiss"/>
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
      hovered: false,
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
    dismiss() {
      this.replying = false;
    },
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
      this.mutableDownvotes = (this.mutableDownvotes || 0) + 1;
      this.voted = true;
      this.$store.dispatch('COMMENT_VOTE', {
        vote: -1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
    },
    reply() {
      this.replying = true;
      this.showByIndex = 1;
    },
    hoverIn() {
      this.hovered = true;
    },
    hoverOut() {
      this.hovered = false;
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
