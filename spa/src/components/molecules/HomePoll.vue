<template>
  <div>
    <h4 class="text-center">
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }}">
        {{ poll.info.caption }}
      </router-link>
    </h4>

    <div v-if="voted" class="pt-2 pb-2">
      <VotesChart :votes="poll.votes" v-bind:voted="voted" :horizontal="true" :stacked="true"/>
    </div>

    <div v-if="!voted" class="m-auto pt-3 pb-3">
      <PollButtons v-on:do-vote="onVote"/>
    </div>

    <div class="mb-3">
      <Date :date="poll.info.date" format="dynamicDate" />  &bull;
      <ProfileLink :profile="poll.info.author"/> &bull;
      {{ $t('poll.votes') }}: {{ poll.votes.total }} &bull;
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }, hash: '#comments'}">
        {{ $t('comment.comments') }}: {{ poll.comments.count }}
      </router-link>
    </div>
  </div>
</template>

<script>
import VotesChart from '@/components/molecules/VotesChart.vue';
import PollButtons from '@/components/molecules/PollButtons.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';

export default {
  name: 'home',
  components: {
    VotesChart,
    PollButtons,
    ProfileLink,
    Date,
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
      return this.$store.getters.POLL.my_vote;
    },
  },
  methods: {
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
