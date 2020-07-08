<template>
  <div class="border border-secondary rounded mb-2 p-1">
    <div class="font-weight-light border-bottom">
      {{created}}
      &bull;
      <ProfileLink :profile="comment.user"/>
    </div>

    <div class="pt-2 pb-2">
      {{comment.text}}
    </div>

    <div>
      <b-button v-on:click="reply" class="mr-1" variant="outline-secondary" size="sm">
        <b-icon icon="chat" aria-hidden="true"></b-icon>
        {{ $t('comment.reply') }}
      </b-button>

      <span :id="`upvotes_${comment._id}`">
        <b-button :disabled="!canVote" v-on:click="upvote" class="mr-1" variant="outline-secondary" size="sm">
          <b-icon icon="hand-thumbs-up" aria-hidden="true"></b-icon>
          {{ comment.up }}
        </b-button>
      </span>

      <span :id="`downvotes_${comment._id}`">
        <b-button :disabled="!canVote" v-on:click="downvote" class="mr-2" variant="outline-secondary" size="sm">
          {{ comment.down }}
          <b-icon icon="hand-thumbs-down" aria-hidden="true"></b-icon>
        </b-button>
      </span>

      <b-popover :target="`upvotes_${comment._id}`" triggers="hover" placement="top">
        <div v-for="vote in upvotes" v-bind:key="vote._id"><ProfileLink :profile="vote.user"/></div>
      </b-popover>

      <b-popover :target="`downvotes_${comment._id}`" triggers="hover" placement="top">
        <div v-for="vote in downvotes" v-bind:key="vote._id"><ProfileLink :profile="vote.user"/></div>
      </b-popover>

      <b-button v-if="!comment.parentId"  v-on:click="reload" class="mr-2" variant="outline-secondary" size="sm">
        <b-icon icon="arrow-clockwise" aria-hidden="true"></b-icon>
      </b-button>

      <b-button v-if="collapseId" v-on:click="collapse" variant="outline-secondary" size="sm" class="float-right">
        <b-icon v-if="collapsed"  icon="arrows-expand" aria-hidden="true"></b-icon>
        <b-icon v-if="!collapsed"  icon="arrows-collapse" aria-hidden="true"></b-icon>
      </b-button>
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
    collapseId: String,
  },
  data() {
    return {
      voted: this.comment.voted || false,
      replying: false,
      collapsed: false,
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
    upvotes() {
      return this.comment.votes.filter(vote => vote.vote === 1);
    },
    downvotes() {
      return this.comment.votes.filter(vote => vote.vote === -1);
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
      await this.$store.dispatch('FETCH_REPLIES', {
        itemId: this.itemId,
        commentId: this.comment._id,
      });
    },
    async upvote() {
      if (this.voted) return;
      await this.$store.dispatch('COMMENT_VOTE', {
        vote: 1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
      this.voted = true;
    },
    async downvote() {
      if (this.voted) return;
      await this.$store.dispatch('COMMENT_VOTE', {
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
