<template>
  <div>
    <column-chart :data="chartData" suffix="%"
                  height="200px"
                  :colors="[['#28a745', '#007bff', '#ffc107', '#dc3545']]">
    </column-chart>
  </div>
</template>

<script>
import normalizeVotes from '@/utils/chartUtils';

export default {
  name: 'BarChart',
  props: {
    voted: String,
    votes: Object,
  },
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
