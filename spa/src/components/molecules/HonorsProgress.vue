<template>
  <div v-if="user.honors.rank !== 'expert'" class="mb-3">
    <ul v-if="user.honors.rank === 'novice'" class="ranks-list">
      <li>
        <BIconAward font-scale="2"></BIconAward>
        {{ $t('profile.honors.next-rank-label') }}: {{ $t('profile.rank.student') }}
      </li>
      <li>
          <span class="mr-2">{{ $t('profile.honors.poll-votes-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="pollVotesCount >= 1" font-scale="1" class="my-auto" />
          <b-progress v-if="pollVotesCount < 1" :value="pollVotesCount" max="1" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.comments-label') }}:</span>
        <div>
          <b-progress v-if="commentsCount < 1" :value="commentsCount" max="1" class="w-25 my-auto" show-value></b-progress>
          <BIconCheck2Circle v-if="commentsCount >= 1" font-scale="1" class="my-auto" />
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.comment-votes-label') }}:</span>
        <div>
          <b-progress v-if="commentVotesCount < 1" :value="commentVotesCount" max="1" class="w-25 my-auto" show-value></b-progress>
          <BIconCheck2Circle v-if="commentsCount >= 1" font-scale="1" class="my-auto" />
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.shares-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="user.honors.count.shares >= 1" font-scale="1" class="my-auto"/>
          <b-progress v-if="user.honors.count.shares < 1" :value="user.honors.count.shares" max="1" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
    </ul>
    <ul v-if="user.honors.rank === 'student'" class="ranks-list">
      <li>
        <BIconAward font-scale="2"></BIconAward>
        {{ $t('profile.honors.next-rank-label') }}: {{ $t('profile.rank.graduate') }}
      </li>
      <li>
        {{ $t('profile.honors.requirements-label') }}
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.poll-votes-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="pollVotesCount >= 3" font-scale="1" class="my-auto" />
          <b-progress v-if="pollVotesCount < 3" :value="pollVotesCount" max="3" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.blogs-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="blogsCount >= 1" font-scale="1" class="my-auto" />
          <b-progress v-if="blogsCount < 1" :value="blogsCount" max="1" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.comment-ratio-label') }}:</span>
        <div>
        <BIconCheck2Circle v-if="commentVoteRatio >= 66" font-scale="1" class="my-auto" />
        <b-progress v-if="commentVoteRatio < 66" :value="commentVoteRatio" max="66" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.shares-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="sharesCount >= 10" font-scale="1" class="my-auto"/>
          <b-progress v-if="sharesCount < 10" :value="sharesCount" max="10" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
    </ul>
    <ul v-if="user.honors.rank === 'graduate'" class="ranks-list">
      <li>
        <BIconAward font-scale="2"></BIconAward>
        {{ $t('profile.honors.next-rank-label') }}: {{ $t('profile.rank.expert') }}
      </li>
      <li>
        {{ $t('profile.honors.requirements-label') }}
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.poll-votes-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="pollVotesCount >= 10" font-scale="1" class="my-auto" />
          <b-progress v-if="pollVotesCount < 10" :value="pollVotesCount" max="10" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.blogs-label') }}:</span>
        <div>
        <BIconCheck2Circle v-if="blogsCount >= 10" font-scale="1" class="my-auto" />
        <b-progress v-if="blogsCount < 10" :value="blogsCount" max="10" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.comments-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="commentsCount >= 100" font-scale="1" class="my-auto" />
          <b-progress v-if="commentsCount < 100" :value="commentsCount" max="100" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.comment-ratio-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="commentVoteRatio >= 80" font-scale="1" class="my-auto" />
          <b-progress v-if="commentVoteRatio < 80" :value="commentVoteRatio" max="80" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
      <li>
        <span class="mr-2">{{ $t('profile.honors.sharing-weeks-label') }}:</span>
        <div>
          <BIconCheck2Circle v-if="sharingWeeksCount >= 10" font-scale="1" class="my-auto" />
          <b-progress v-if="sharingWeeksCount < 10" :value="sharingWeeksCount" max="10" class="w-25 my-auto" show-value></b-progress>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { BIconCheck2Circle, BProgress, BIconAward } from 'bootstrap-vue';

export default {
  name: 'HonorsProgress',
  props: {
    user: Object,
  },
  components: {
    BIconCheck2Circle, BProgress, BIconAward,
  },
  computed: {
    sharesCount() {
      return this.user.honors.count.shares;
    },
    sharingWeeksCount() {
      return this.user.honors.count.sharingWeeks || 0;
    },
    blogsCount() {
      return this.user.honors.count.blogs;
    },
    pollVotesCount() {
      return this.user.honors.count.pollVotes;
    },
    commentsCount() {
      return this.user.honors.count.comments;
    },
    commentVotesCount() {
      return this.user.honors.count.commentVotes;
    },
    commentVoteRatio() {
      return this.user.honors.count.commentVoteRatio || 0;
    },
  },
};
</script>
<style scoped>
.ranks-list{
  margin: 0;
  padding: 0;
}
.ranks-list li{
  list-style-type: none;
  margin-bottom: 10px;
  min-height: 50px;
  border: 1px solid #f1f1f1;
  background: #fff;
  -webkit-box-shadow: #c1c1c1 1px 1px 10px;
  box-shadow: #c1c1c1 1px 1px 10px;
  text-align: left;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content:  flex-start;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--dark-color);
  font-size: 15px;
  font-weight: 400;
  margin: 0;
      padding: 0 20px;
}
.ranks-list li:first-child{
  min-height: auto;
  font-weight: 400;
  padding: 0px 0 10px;
  box-shadow: none;
  border: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.ranks-list li svg{
  font-size: 20px;
  margin-right: 10px;
  color: #AEB3B7;
}
.ranks-list li span{ width:35%}
.ranks-list li div{ width:100%!important}

  @media (max-width: 600px) {
  .ranks-list li:first-child{ flex-direction: row;}
  .ranks-list li{
        padding:20px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
.ranks-list li span{ width:100%}


  }


</style>
