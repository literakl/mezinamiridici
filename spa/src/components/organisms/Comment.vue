<template>
  <div :id="comment._id" class="mb-3 comment-wrap">
    <div class="first-com-box">
      <div class="author-det">
        <span>
          <BIconClock scale="1"></BIconClock>
        <Date :date="this.comment.date" format="dynamicDate" />
        </span>
        <span>
        <BIconPersonCircle scale="1"></BIconPersonCircle>
        <ProfileLink :profile="comment.author"/>
        </span>
      </div>
      <div class="comments">
        <div class="pt-2 pb-2">
          <span v-html="comment.text"></span>
        </div>

        <div class="comment-buttons">
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
            <div v-for="vote in upvotes" v-bind:key="vote._id">
              <ProfileLink :profile="vote.user" :show-user-info="false"/>
            </div>
          </b-popover>

          <b-popover :target="`downvotes_${comment._id}`" triggers="hover" placement="top">
            <div v-for="vote in downvotes" v-bind:key="vote._id">
              <ProfileLink :profile="vote.user" :show-user-info="false"/>
            </div>
          </b-popover>

          <b-button v-if="!comment.parentId"  v-on:click="reload" class="mr-2" variant="outline-secondary" size="sm">
            <BIconArrowClockwise aria-hidden="true"></BIconArrowClockwise>
          </b-button>

          <b-button v-if="collapseId" v-on:click="collapse" variant="outline-secondary" size="sm" class="float-right">
            <BIconArrowsExpand v-if="collapsed"  aria-hidden="true"></BIconArrowsExpand>
            <BIconArrowsCollapse v-if="!collapsed"  aria-hidden="true"></BIconArrowsCollapse>
          </b-button>
        </div>
      </div>
    </div>
    <div class="repling-box">
      <div v-if="replying">
        <CommentForm :isShow="replying" :itemId="itemId" :parent="replyId" :commentId="comment._id" @dismiss="dismiss"/>
      </div>
    </div>
  </div>
</template>

<script>
import { BIconChat, BIconHandThumbsUp, BIconHandThumbsDown,
  BIconArrowClockwise, BIconArrowsExpand, BIconArrowsCollapse,
  BButton, BPopover, BIconPersonCircle, BIconClock } from 'bootstrap-vue';
import CommentForm from '@/components/molecules/CommentForm.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
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
    BButton,
    BPopover,
    BIconPersonCircle,
    BIconClock,
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
      return !this.voted && this.comment.author.id !== this.$store.getters.USER_ID;
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
      if (!this.$store.getters.IS_AUTHORIZED) {
        await this.$router.push({ name: 'sign-in', params: { redirectUrl: this.$route.fullPath } });
        return;
      }
      if (this.voted) return;
      await this.$store.dispatch('VOTE_COMMENT', {
        vote: 1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
      this.voted = true;
    },
    async downvote() {
      if (!this.$store.getters.IS_AUTHORIZED) {
        await this.$router.push({ name: 'sign-in', params: { redirectUrl: this.$route.fullPath } });
        return;
      }
      if (this.voted) return;
      await this.$store.dispatch('VOTE_COMMENT', {
        vote: -1,
        itemId: this.itemId,
        commentId: this.comment._id,
      });
      this.voted = true;
    },
    reply() {
      if (!this.$store.getters.IS_AUTHORIZED) {
        this.$router.push({ name: 'sign-in', params: { redirectUrl: this.$route.fullPath } });
        return;
      }
      this.replying = !this.replying;
    },
  },
};
</script>

<style>

.comment-wrap{
  display: flex;
  width: 100%;
  flex-direction: column;
}
.first-com-box{
   display: flex;
   width: 100%;
   align-items: flex-start;
}
.author-det{    width: 12%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 14px;
  font-weight: 400;
  background: #f9f9f9;
  padding: 5px 8px;
  margin-top: 20px;
  position: relative;
  border-right: 2px solid #dddddd;
}
.author-det:after{
  position: absolute;
  /* content: ""; */
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #f9f9f9;
  right: -15px;
  transform: rotate(90deg);
}
.author-det span{
  color: var(--text-color-light);
}
.author-det span svg{
  margin-right:5px;
  color: var(--text-color-light);
}
.comments{
  width: 88%;
  border: 1px solid #ddd;
  padding: 10px 15px;
}
.comment-buttons button{
  border: 1px solid #ddd;
  color: var(--text-color-light);
}
.comment-buttons button:hover{
  background: #fff;
  color: var(--text-color);
   box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
  border-color: #ddd;

}
.popover-body {
  max-height: 250px;
  overflow-y: auto;
  white-space:pre-wrap;
}
blockquote {
  display: block;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 40px;
  background-color: whitesmoke;
  padding: 20px;
  font-style: italic;
  overflow-wrap: anywhere;
}
  blockquote p {
    font-style: normal;
    font-weight: bold;
  }

  table {
     /* display: block!important;

    overflow-x: auto!important;
    width: 100%!important;
    height: 100%!important; */
    width: 100%!important;
    font-size: 14px!important;
  }
  /* table {
      border: 1px solid #DBDBE2;
      border-radius: 3px;
      position: relative;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
  } */
  td {
      border: 1px solid #DBDBE2;
      padding: 0;
      vertical-align: top;
  }
  td div{
      padding: 10px;
      height: 100%;
  }
  tbody tr:first-child td {
      border-top: none;
  }
  tbody tr:last-child td {
      border-bottom: none;
  }
  tbody tr td:last-child {
      border-right: none;
  }
  tbody tr td:first-child {
      border-left: none;
  }

  @media (min-width: 1920px) {
    p, a, button, li, span{ font-size: 20px}
    .item-footer svg{
    font-size: 14px;
}
 .comment-buttons button{ font-size: 20px;}
}
@media (max-width: 1200px) {
  .first-com-box{
    flex-direction: column;
  }
  .gredient-gray table{
    /* overflow-x: scroll;
    scroll-behavior: smooth; */
  }
  .comment-wrap{
    flex-direction: column;
  }
  .author-det {
    width: 100%;
    flex-direction: row;
    margin-top: 0px;
    border-right: 0;
  }
  .author-det span {
    margin-right: 10px;
  }
  .author-det:after {
    right: 2px;
    transform: rotate(180deg);
    bottom: -10px;
  }
  .comments {
    width: 100%;
  }
}
@media (max-width: 767px) {
.comment__child {
    margin-left: 15px;
}
}
</style>
