<template>
  <div>
    <column-chart :data="chartData" width="800px" suffix="%" :colors="[['#0b6e00', '#006ca2', '#fd6a02', '#d60001']]"></column-chart>
  </div>
</template>

<script>
import normalizeVotes from '@/components/utils/chartUtils';

export default {
  name: 'SeriesBarChart',
  props: {
    series: Array,
  },
  computed: {
    chartData() {
      console.log(this.series[0]);
      const votes = normalizeVotes(this.series[0]);
      console.log(votes);
      return [
        [this.$t('poll.choices.neutral'), votes.neutral],
        [this.$t('poll.choices.trivial'), votes.trivial],
        [this.$t('poll.choices.dislike'), votes.dislike],
        [this.$t('poll.choices.hate'), votes.hate],
      ];
    },
  },
};
</script>
