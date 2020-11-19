<template>
  <div class="item-div item-hover mb-3">
    <h4 class="text-center">
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }}">
        {{ poll.info.caption }}
      </router-link>
    </h4>

    <div v-if="voted" class="pt-2 pb-2 d-flex justify-content-center">
      <b-button variant="success" :class="myVoteClass('neutral')" class="m-3">
        <img src="/images/icons/happy.png" class="pr-2" alt="">
        {{ $t('poll.choices.neutral') }}
        <span class="badge badge-pill badge-light">{{ this.votes.neutral }}%</span>
      </b-button>
      <b-button variant="primary" :class="myVoteClass('trivial')" class="m-3">
        <img src="/images/icons/ok.png" class="pr-2" alt="">
        {{ $t('poll.choices.trivial') }}
        <span class="badge badge-pill badge-light">{{ this.votes.trivial }}%</span>
      </b-button>
      <b-button variant="warning" :class="myVoteClass('dislike')" class="m-3">
        <img src="/images/icons/dislike.png" class="pr-2" alt="">
        {{ $t('poll.choices.dislike') }}
        <span class="badge badge-pill badge-light">{{ this.votes.dislike }}%</span>
      </b-button>
      <b-button variant="danger" :class="myVoteClass('hate')" class="m-3">
        <img src="/images/icons/angry.png" class="pr-2" alt="">
        {{ $t('poll.choices.hate') }}
        <span class="badge badge-pill badge-light">{{ this.votes.hate }}%</span>
      </b-button>
    </div>

    <div v-if="!voted" class="pt-2 pb-2 d-flex justify-content-center">
      <PollButtons v-on:do-vote="onVote"/>
    </div>

    <div class="mt-3 p-1 pl-3 item-footer">
      <Date :date="poll.info.date" format="dynamicDate" /> &bull;
      <ProfileLink :profile="poll.info.author"/> &bull;
      {{ $t('poll.votes') }}: {{ poll.votes.total }} &bull;
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }, hash: '#comments'}">
        {{ $t('comment.comments') }}: {{ poll.comments.count }}
      </router-link>
    </div>
  </div>
</template>

<script>
import normalizeVotes from '@/utils/chartUtils';
import PollButtons from '@/components/molecules/PollButtons.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';
import { BButton } from 'bootstrap-vue';

export default {
  name: 'HomePoll',
  components: {
    PollButtons,
    ProfileLink,
    Date,
    BButton,
  },
  props: {
    poll: Object,
  },
  data() {
    return {
      voting: false,
    };
  },
  computed: {
    voted() {
      return this.poll.my_vote;
    },
    votes() {
      return normalizeVotes(this.poll.votes);
    },
  },
  methods: {
    myVoteClass(value) {
      return this.poll.my_vote === value ? 'button_my_vote' : '';
    },
    async onVote(vote) {
      this.voting = true;
      await this.$store.dispatch('POLL_VOTE', {
        id: this.poll._id,
        vote,
      });
      this.voting = false;
    },
  },
};
</script>

<style scoped>
.item-div {
  border-width: 10px;
  border-color: #f1f1f1;
  border-style: solid;
  box-shadow: #c1c1c1 1px 1px 10px;
}
.item-footer {
  background-color: #f1f1f1;
  font-size: 0.8em;
  color: #201f27;
  font-weight: 600;
}
</style>
