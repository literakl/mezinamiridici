<template>

  <div class="comment-area" id="comments">
    <h3>{{ $t('comment.discussion') }}</h3>

    <div v-if="signedIn">
      <CommentForm :isShow="true" :itemId="itemId" />
    </div>

    <!-- Novejsi reload button -->

<!--    <div v-if="comments.length">-->
      <div v-for="comment in comments" v-bind:key="comment._id">
        <Comment :itemId="itemId" :comment="comment" :collapseId="getCollapseId(comment)" />
        <b-collapse :id="`replies_${comment._id}`" visible>
          <Replies v-if="comment.replies && comment.replies.length > 0" :itemId="itemId" :comment="comment" />
        </b-collapse>

        <!-- nacist odpovedi v-if="comment.replies === undefined" -->
      </div>
<!--    </div>-->
   <span class="load-comments"><Button v-if="incomplete" :value="$t('comment.load-more')" size="sm" @clicked="loadMoreComments(itemId)" /></span>
  </div>

</template>

<script>
import Comment from '@/components/organisms/Comment.vue';
import Replies from '@/components/organisms/Replies.vue';
import Button from '@/components/atoms/Button.vue';
import CommentForm from '@/components/molecules/CommentForm.vue';
import { BCollapse } from 'bootstrap-vue';

export default {
  name: 'Comments',
  components: {
    Comment,
    Replies,
    Button,
    CommentForm,
    BCollapse,
  },
  props: {
    itemId: String,
  },
  computed: {
    signedIn() {
      return this.$store.getters.IS_AUTHORIZED;
    },
    incomplete() {
      return this.$store.getters.DISCUSSION.incomplete;
    },
    comments() {
      return this.$store.getters.DISCUSSION.comments.map(id => this.$store.getters.GET_COMMENT(id));
    },
    addedId() {
      return this.$store.getters.DISCUSSION.addedCommentId;
    },
  },
  watch: {
    comments() {
      if (this.addedId !== '') setTimeout(() => { this.$scrollTo(document.getElementById(this.addedId), 500, { easing: 'ease' }); }, 700);
    },
  },
  async created() {
    await this.$store.dispatch('FETCH_COMMENTS', { itemId: this.itemId });
  },
  mounted() {
    const { hash } = this.$route;
    if (this.$route.hash) {
      setTimeout(() => { window.location.href = hash; }, 1000);
    }
  },
  destroyed() {
    this.$store.commit('DESTROY_COMMENTS');
  },
  methods: {
    getCollapseId(comment) {
      return (comment.replies && comment.replies.length > 0) ? `replies_${comment._id}` : undefined;
    },
    loadMoreComments(itemId) {
      const payload = { itemId };
      if (this.comments.length > 0) {
        payload.lastSeen = this.comments[this.comments.length - 1]._id;
      }
      this.$store.dispatch('FETCH_COMMENTS', payload);
    },
  },
};
</script>
<style scoped>
/* Comment Outer Full Area  */
.comment-area{
  margin:0 auto;
  width:100%
}
.comment-area h3{
  font-size: 18px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 10px;
  color: var(--text-color);
}

@media (max-width: 767px) {
  .comment__child {
    margin-left: 20px;
  }
}

@media (max-width: 450px) {
  .comment-area{
    width: 100%;
  }
  .comment-area h3{ padding:10px 0px;}
}
</style>
