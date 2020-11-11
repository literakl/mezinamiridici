<template>
  <div>
    <bar-chart v-if="horizontal && stacked" :data="chartData" suffix="%" height="100px" :stacked="true"
               :colors="['#28a745', '#007bff', '#ffc107', '#dc3545']">
    </bar-chart>
    <bar-chart v-if="horizontal && !stacked" :data="chartData" suffix="%" height="100px"
              :colors="[['#28a745', '#007bff', '#ffc107', '#dc3545']]">
    </bar-chart>
    <column-chart v-if="!horizontal" :data="chartData" suffix="%" height="200px"
              :colors="[['#28a745', '#007bff', '#ffc107', '#dc3545']]">
    </column-chart>
  </div>
</template>

<script>
import normalizeVotes from '@/utils/chartUtils';
import Vue from 'vue';

export default {
  name: 'VotesChart',
  props: {
    voted: String,
    votes: Object,
    horizontal: {
      type: Boolean,
      default: false,
    },
    stacked: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    poll() {
      Vue.$log.debug(`BarChart ${this.votes}`);
      return normalizeVotes(this.votes);
    },
    chartData() {
      if (!this.stacked) {
        return [
          [this.label('neutral', this.voted), this.poll.neutral],
          [this.label('trivial', this.voted), this.poll.trivial],
          [this.label('dislike', this.voted), this.poll.dislike],
          [this.label('hate', this.voted), this.poll.hate],
        ];
      } else {
        return [
          {
            name: this.label('neutral', this.voted),
            data: [[this.$t('poll.results'), this.poll.neutral]],
          },
          {
            name: this.label('trivial', this.voted),
            data: [[this.$t('poll.results'), this.poll.trivial]],
          },
          {
            name: this.label('dislike', this.voted),
            data: [[this.$t('poll.results'), this.poll.dislike]],
          },
          {
            name: this.label('hate', this.voted),
            data: [[this.$t('poll.results'), this.poll.hate]],
          },
        ];
      }
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
