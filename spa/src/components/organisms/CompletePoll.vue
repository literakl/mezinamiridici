<template>
  <div>
    <PollHeading :item="item"/>

    <div v-if="voted" class="pt-2 pb-2">
      <BarChart :votes="item.votes" v-bind:voted="voted"/>
      <PredefinedComparisons :slug="item.info.slug"></PredefinedComparisons>
      <div>
        {{ $t('poll.your-vote') }}
        {{ $t('poll.choices.'+voted) }}
      </div>
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
import BarChart from '@/components/molecules/BarChart.vue';
import PredefinedComparisons from '@/components/molecules/PredefinedComparisons.vue';

export default {
  name: 'CompletePoll',
  components: {
    ContentLoading,
    BarChart,
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

<style scoped lang="scss">
  .btn.btn-primary:active:hover, .btn.btn-primary:hover {
    border-color: var(--primary);
    background-color: var(--primary);
  }

  .btn.btn-success:active:hover, .btn.btn-success:hover {
    border-color: var(--success);
    background-color: var(--success);
  }

  .btn.btn-warning:active:hover, .btn.btn-warning:hover {
    border-color: var(--warning);
    background-color: var(--warning);
  }

  .btn.btn-danger:active:hover, .btn.btn-danger:hover {
    border-color: var(--danger);
    background-color: var(--danger);
  }
</style>
