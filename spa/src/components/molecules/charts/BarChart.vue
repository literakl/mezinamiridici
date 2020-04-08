<template>
    <div>
      <column-chart :data="chartData" width="800px" :colors="['#0b6e00', '#006ca2', '#ff3333', '#d60001']"></column-chart>
    </div>
</template>

<script>
export default {
  name: 'BarChart',
  props: {
    voted: String,
    votes: Object,
  },
  computed: {
    poll() {
      const items = [this.votes.neutral, this.votes.trivial, this.votes.dislike, this.votes.hate];
      const result = [];
      let sum = 0, biggestRound = 0, roundPointer;

      items.forEach((count, index) => {
        const value = 100 * count / this.votes.total;
        const rounded = Math.round(value);
        const diff = value - rounded;
        if (diff > biggestRound) {
          biggestRound = diff;
          roundPointer = index;
        }
        sum += rounded;
        result.push(rounded);
      });

      if (sum === 99) {
        result[roundPointer] += 1;
      } else if (sum === 101) {
        result[roundPointer] -= 1;
      }

      return {
        neutral: result[0],
        trivial: result[1],
        dislike: result[2],
        hate: result[3],
      };
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
