<template>
  <div class="border border-secondary rounded mb-2 p-1">
    <div>
      <ProfileLink :profile="comment.user"/>
    </div>

    <div class="pt-1 pb-1">
      {{comment.text}}
    </div>

    <div>
      <b-button v-on:click="reply" class="mr-1" variant="outline-secondary" size="sm">
        <b-icon icon="chat" aria-hidden="true"></b-icon>
        {{ $t('comment.reply') }}
      </b-button>

      <b-button :disabled="!canVote" v-on:click="upvote" class="mr-1" variant="outline-secondary" size="sm">
        <b-icon icon="hand-thumbs-up" aria-hidden="true"></b-icon>
        {{ mutableUpvotes }}
      </b-button>

      <b-button :disabled="!canVote" v-on:click="downvote" class="mr-2" variant="outline-secondary" size="sm">
        {{ mutableDownvotes }}
        <b-icon icon="hand-thumbs-down" aria-hidden="true"></b-icon>
      </b-button>

      <small class="text-muted">{{created}}</small>
    </div>

    <div v-show="replying">
      <CommentForm :itemId="itemId" :parent="replyId" @dismiss="dismiss"/>
    </div>
  </div>
</template>

<script>
import CommentForm from '@/components/molecules/CommentForm.vue';
import ProfileLink from '@/components/atoms/ProfileLink.vue';
import { showDateTime } from '@/utils/dateUtils';

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
      return !this.voted && this.comment.user.id !== this.$store.getters.USER_ID;
    },
    created() {
      return showDateTime(this.comment.date);
    },
    replyId() {
      return (this.comment.parentId) ? this.comment.parentId : this.comment._id;
    },
  },
  methods: {
    dismiss() {
      this.replying = false;
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
      this.replying = !this.replying;
    },
  },
};
</script>
