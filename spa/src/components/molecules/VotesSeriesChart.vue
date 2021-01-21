<template>
  <div class="mb-2 chart-area">
    <column-chart :data="chartData" :colors="['#007bffff', '#28a745ff']" :suffix="suffix" height="300px"></column-chart>
  </div>
</template>

<script>
import normalizeVotes from '@/utils/chartUtils';

export default {
  name: 'SeriesBarChart',
  props: {
    series: Array,
    captions: Array,
    absoluteValues: Boolean,
  },
  computed: {
    chartData() {
      const groups = [];
      for (let i = 0; i < this.series.length; i += 1) {
        const votes = (this.absoluteValues) ? this.series[i] : normalizeVotes(this.series[i]);
        const group = {};
        group[this.$t('poll.choices.neutral')] = votes.neutral;
        group[this.$t('poll.choices.trivial')] = votes.trivial;
        group[this.$t('poll.choices.dislike')] = votes.dislike;
        group[this.$t('poll.choices.hate')] = votes.hate;
        const data = { name: this.captions[i], data: group };
        groups.push(data);
      }
      return groups;
    },
    suffix() {
      return (this.absoluteValues) ? '' : '%';
    },
  },
};
</script>
