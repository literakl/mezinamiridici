<template>
  <div class="complete">
      <PollHeading :item="item"/>
    <div v-if="voted" class="pt-2 pb-2 chart-wrap">
      <div class="vote-chart"><VotesChart :votes="item.votes" v-bind:voted="voted"/></div>
      <div class="comparision-wrap"><PredefinedComparisons :slug="item.info.slug"></PredefinedComparisons></div>
    </div>

    <div v-if="!voted" class="m-auto pt-3 pb-3">
      <PollButtons v-on:do-vote="onVote"/>
    </div>

    <ContentLoading v-if="voting" type="voting"/>
  </div>
</template>

<script>
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import PollHeading from '@/components/molecules/PollHeading.vue';
import PollButtons from '@/components/molecules/PollButtons.vue';
import VotesChart from '@/components/molecules/VotesChart.vue';
import PredefinedComparisons from '@/components/molecules/PredefinedComparisons.vue';

export default {
  name: 'CompletePoll',
  components: {
    ContentLoading,
    VotesChart,
    PollButtons,
    PollHeading,
    PredefinedComparisons,
  },
  data() {
    return {
      voting: false,
    };
  },
  computed: {
    item() {
      return this.$store.getters.POLL;
    },
    voted() {
      return this.$store.getters.POLL.my_vote;
    },
  },
  methods: {
    async onVote(vote) {
      this.voting = true;
      await this.$store.dispatch('POLL_VOTE', {
        id: this.item._id,
        vote,
      });
      this.voting = false;
    },
  },
};
</script>
