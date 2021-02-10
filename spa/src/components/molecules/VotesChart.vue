<template>
  <div class="inside">
    <bar-chart v-if="horizontal" :data="chartData" :colors="[colors]" suffix="%" height="100px"></bar-chart>
    <column-chart v-if="!horizontal" :data="chartData" :colors="[colors]" suffix="%" height="200px"></column-chart>
  </div>
</template>

<script>
import normalizeVotes from '@/utils/chartUtils';

export default {
  name: 'VotesChart',
  props: {
    voted: String,
    votes: Object,
    horizontal: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    colors: ['#28a745ff', '#007bffff', '#ffc107ff', '#dc3545ff'],
  }),
  computed: {
    poll() {
      return normalizeVotes(this.votes);
    },
    chartData() {
      return [
        [this.label('neutral', this.voted), this.poll.neutral],
        [this.label('trivial', this.voted), this.poll.trivial],
        [this.label('dislike', this.voted), this.poll.dislike],
        [this.label('hate', this.voted), this.poll.hate],
      ];
    },
  },
  methods: {
    label(vote, voted) {
      if (voted === vote) {
        return `${this.$t('poll.your-vote')} ${this.$t(`poll.choices.${vote}`)}`;
      } else {
        return this.$t(`poll.choices.${vote}`);
      }
    },
  },
};
</script>
<style>
.inside{
  max-width: 100%; margin: 0 auto;
}

</style>
