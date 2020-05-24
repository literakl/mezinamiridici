<template>
  <div>
    <column-chart :data="chartData" width="800px" suffix="%"
                  :colors="[['#28a745', '#007bff', '#ffc107', '#dc3545']]">
    </column-chart>
  </div>
</template>

<script>
import normalizeVotes from '@/components/utils/chartUtils';

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
        [this.$t('poll.choices.neutral'), this.poll.neutral],
        [this.$t('poll.choices.trivial'), this.poll.trivial],
        [this.$t('poll.choices.dislike'), this.poll.dislike],
        [this.$t('poll.choices.hate'), this.poll.hate],
      ];
    },
  },
};
</script>
