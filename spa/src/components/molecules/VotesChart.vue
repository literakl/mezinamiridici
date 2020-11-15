<template>
  <div>
    <bar-chart v-if="horizontal && stacked" :data="chartData" :colors="colors"
               suffix="%" height="100px" :stacked="true" :library="tooltips">
    </bar-chart>
    <bar-chart v-if="horizontal && !stacked" :data="chartData" :colors="[colors]" suffix="%" height="100px"></bar-chart>
    <column-chart v-if="!horizontal" :data="chartData" :colors="[colors]" suffix="%" height="200px"></column-chart>
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
  data: () => ({
    colors: ['#28a745ff', '#007bffff', '#ffc107ff', '#dc3545ff'],
    tooltips: {
      tooltips: {
        // Disable the on-canvas tooltip
        enabled: false,

        custom(tooltipModel) {
          // Tooltip Element
          let tooltipEl = document.getElementById('chartjs-tooltip');

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          // Set caret Position
          tooltipEl.classList.remove('above', 'below', 'no-transform');
          if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          function getBody(bodyItem) {
            return bodyItem.lines;
          }

          // Set Text
          if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map(getBody);

            let innerHtml = '<thead>';

            titleLines.forEach((title) => {
              innerHtml += `<tr><th>${title}</th></tr>`;
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach((body, i) => {
              const colors = tooltipModel.labelColors[i];
              let style = `background:${colors.backgroundColor}`;
              style += `; border-color:${colors.borderColor}`;
              style += '; border-width: 2px';
              const span = `<span style="${style}"></span>`;
              innerHtml += `<tr><td>${span}${body}</td></tr>`;
            });
            innerHtml += '</tbody>';

            const tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
          }

          // `this` will be the overall tooltip
          const position = this._chart.canvas.getBoundingClientRect();

          // Display, position, and set styles for font
          tooltipEl.style.opacity = 1;
          tooltipEl.style.backgroundColor = 'white';
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.left = `${position.left + window.pageXOffset + tooltipModel.caretX}px`;
          tooltipEl.style.top = `${position.top + window.pageYOffset + tooltipModel.caretY}px`;
          tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
          tooltipEl.style.fontSize = `${tooltipModel.bodyFontSize}px`;
          tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
          tooltipEl.style.padding = `${tooltipModel.yPadding}px ${tooltipModel.xPadding}px`;
          tooltipEl.style.pointerEvents = 'none';
        },
      },
    },
  }),
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
