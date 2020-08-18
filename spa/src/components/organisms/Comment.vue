<template>
  <div :id="comment._id" class="border border-secondary rounded mb-2 p-1">
    <div class="font-weight-light border-bottom">
      <Date :date="this.comment.date" format="dynamicDate" /> &bull;
      <ProfileLink :profile="comment.user"/>
    </div>

    <div class="pt-2 pb-2">
      <span v-html="comment.text"></span>
    </div>

    <div>
      <b-button v-on:click="reply" class="mr-1" variant="outline-secondary" size="sm">
        <BIconChat aria-hidden="true"></BIconChat>
        {{ $t('comment.reply') }}
      </b-button>

      <span :id="`upvotes_${comment._id}`">
        <b-button :disabled="!canVote" v-on:click="upvote" class="mr-1" variant="outline-secondary" size="sm">
          <BIconHandThumbsUp aria-hidden="true"></BIconHandThumbsUp>
          {{ comment.up }}
        </b-button>
      </span>

      <span :id="`downvotes_${comment._id}`">
        <b-button :disabled="!canVote" v-on:click="downvote" class="mr-2" variant="outline-secondary" size="sm">
          {{ comment.down }}
          <BIconHandThumbsDown aria-hidden="true"></BIconHandThumbsDown>
        </b-button>
      </span>

      <b-popover :target="`upvotes_${comment._id}`" triggers="hover" placement="top">
        <div v-for="vote in upvotes" v-bind:key="vote._id"><ProfileLink :profile="vote.user"/></div>
      </b-popover>

      <b-popover :target="`downvotes_${comment._id}`" triggers="hover" placement="top">
        <div v-for="vote in downvotes" v-bind:key="vote._id"><ProfileLink :profile="vote.user"/></div>
      </b-popover>

      <b-button v-if="!comment.parentId"  v-on:click="reload" class="mr-2" variant="outline-secondary" size="sm">
        <BIconArrowClockwise aria-hidden="true"></BIconArrowClockwise>
      </b-button>

      <b-button v-if="collapseId" v-on:click="collapse" variant="outline-secondary" size="sm" class="float-right">
        <BIconArrowsExpand v-if="collapsed"  aria-hidden="true"></BIconArrowsExpand>
        <BIconArrowsCollapse v-if="!collapsed"  aria-hidden="true"></BIconArrowsCollapse>
      </b-button>
    </div>

    <div v-show="replying">
      <CommentForm :itemId="itemId" :parent="replyId" :commentId="comment._id" @dismiss="dismiss"/>
    </div>
  </div>
</template>

<script>
import { BIconChat, BIconHandThumbsUp, BIconHandThumbsDown, BIconArrowClockwise, BIconArrowsExpand, BIconArrowsCollapse } from 'bootstrap-vue';
import CommentForm from '@/components/molecules/CommentForm.vue';
import ProfileLink from '@/components/atoms/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';

export default {
  name: 'Comment',
  components: {
    CommentForm,
    ProfileLink,
    Date,
    BIconChat,
    BIconHandThumbsUp,
    BIconHandThumbsDown,
    BIconArrowClockwise,
    BIconArrowsExpand,
    BIconArrowsCollapse,
  },
  props: {
    itemId: String,
    comment: Object,
    collapseId: String,
  },
  data() {
    return {
      voted: this.comment.voted || false,
      replying: false,
      collapsed: false,
      commentVotes: this.comment.votes,
    };
  },
  computed: {
    canVote() {
      return !this.voted && this.comment.user.id !== this.$store.getters.USER_ID;
    },
    replyId() {
      return (this.comment.parentId) ? this.comment.parentId : this.comment._id;
    },
    upvotes() {
      return this.commentVotes.filter(vote => vote.vote === 1);
    },
    downvotes() {
      return this.commentVotes.filter(vote => vote.vote === -1);
    },
  },
  methods: {
    dismiss() {
      this.replying = false;
    },
    collapse() {
      this.collapsed = !this.collapsed;
      this.$root.$emit('bv::toggle::collapse', this.collapseId);
    },
    async reload() {
      await this.$store.dispatch('RELOAD_COMMENT', {
        itemId: this.itemId,
        commentId: this.comment._id,
      });
    },
    async upvote() {
      if (this.voted) return;
      await this.$store.dispatch('VOTE_COMMENT', {
        vote: 1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
      this.voted = true;
    },
    async downvote() {
      if (this.voted) return;
      await this.$store.dispatch('VOTE_COMMENT', {
        vote: -1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
      this.voted = true;
    },
    reply() {
      this.replying = !this.replying;
    },
  },
};
</script>

<style>
  .popover-body {
    max-height: 250px;
    overflow-y: auto;
    white-space:pre-wrap;
  }
</style>
