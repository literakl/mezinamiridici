<template>
  <div v-if="user.honors.rank !== 'expert'" class="border mb-3">
    <div v-if="user.honors.rank === 'novice'">
      <div>
        {{ $t('profile.honors.next-rank-label') }}: {{ $t('profile.rank.student') }}
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.poll-votes-label') }}:</span>
        <b-progress v-if="pollVotesCount < 1" :value="pollVotesCount" max="1" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="pollVotesCount >= 1" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.comments-label') }}:</span>
        <b-progress v-if="commentsCount < 1" :value="commentsCount" max="1" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="commentsCount >= 1" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.comment-votes-label') }}:</span>
        <b-progress v-if="commentVotesCount < 1" :value="commentVotesCount" max="1" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="commentVotesCount >= 1" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.shares-label') }}:</span>
        <b-progress v-if="user.honors.count.shares < 1" :value="user.honors.count.shares" max="1" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="user.honors.count.shares >= 1" font-scale="1" class="my-auto"/>
      </div>
    </div>
    <div v-if="user.honors.rank === 'student'">
      {{ $t('profile.honors.next-rank-label') }}: {{ $t('profile.rank.graduate') }}
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.poll-votes-label') }}:</span>
        <b-progress v-if="pollVotesCount < 3" :value="pollVotesCount" max="3" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="pollVotesCount >= 3" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.blogs-label') }}:</span>
        <b-progress v-if="blogsCount < 1" :value="blogsCount" max="1" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="blogsCount >= 1" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.comment-ratio-label') }}:</span>
        <b-progress v-if="commentVoteRatio < 66" :value="commentVoteRatio" max="66" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="commentVoteRatio >= 66" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.shares-label') }}:</span>
        <b-progress v-if="sharesCount < 10" :value="sharesCount" max="10" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="sharesCount >= 10" font-scale="1" class="my-auto"/>
      </div>
    </div>
    <div v-if="user.honors.rank === 'graduate'">
      {{ $t('profile.honors.next-rank-label') }}: {{ $t('profile.rank.expert') }}
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.poll-votes-label') }}:</span>
        <b-progress v-if="pollVotesCount < 10" :value="pollVotesCount" max="10" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="pollVotesCount >= 10" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.blogs-label') }}:</span>
        <b-progress v-if="blogsCount < 10" :value="blogsCount" max="10" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="blogsCount >= 10" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.comments-label') }}:</span>
        <b-progress v-if="commentsCount < 100" :value="commentsCount" max="100" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="commentsCount >= 100" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.comment-ratio-label') }}:</span>
        <b-progress v-if="commentVoteRatio < 80" :value="commentVoteRatio" max="80" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="commentVoteRatio >= 80" font-scale="1" class="my-auto" />
      </div>
      <div class="d-flex">
        <span class="mr-2">{{ $t('profile.honors.sharing-weeks-label') }}:</span>
        <b-progress v-if="sharingWeeksCount < 10" :value="sharingWeeksCount" max="10" class="w-25 my-auto" show-value></b-progress>
        <BIconCheck2Circle v-if="sharingWeeksCount >= 10" font-scale="1" class="my-auto" />
      </div>
    </div>
  </div>
</template>

<script>
import { BIconCheck2Circle, BProgress } from 'bootstrap-vue';

export default {
  name: 'HonorsProgress',
  props: {
    user: Object,
  },
  components: {
    BIconCheck2Circle, BProgress,
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
