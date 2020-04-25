<template>
  <div>
    <column-chart :data="chartData" width="800px" :colors="colors"></column-chart>
  </div>
</template>

<script>
export default {
  name: 'SeriesBarChart',
  props: {
    series: Array,
    colors: Array,
  },
  computed: {
    chartData() {
      const groups = [];
      for (let i = 0; i < this.series.length; i += 1) {
        const votes = this.series[i];
        const group = {};
        group[this.$t('poll.choices.neutral')] = votes.neutral;
        group[this.$t('poll.choices.trivial')] = votes.trivial;
        group[this.$t('poll.choices.dislike')] = votes.dislike;
        group[this.$t('poll.choices.hate')] = votes.hate;
        const data = { name: `${i + 1}. ${this.$t('poll.analysis.group')}`, data: group };
        groups.push(data);
      }
      return groups;
    },
  },
};
</script>
