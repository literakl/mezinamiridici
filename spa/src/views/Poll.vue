<template>
  <div>
    <div v-if="!poll">
      Loading...
    </div>
    <div class="poll__wrapper" v-if="poll">
      <div class="poll__ads">
        Ads
      </div>

      <div class="poll_content">
        <Heading :title="poll.text"/>
        <div v-if="mutableVote">
          <div class="poll__chart-wrapper">
            <h2 class="poll__chart-wrapper-vote">
              {{ $t('poll.your-vote') }}
              <span class="vote-text">{{mutableVote}}</span>
            </h2>

            <div class="poll__chart-wrapper-bar-chart">
              <BarChart v-bind:voted="mutableVote" />
            </div>

            <div class="poll__chart-wrapper-analyze-votes-button">
              <Button :value="$t('poll.analyze-votes')" @clicked="redirectToAnalyzeVotes" />
            </div>
          </div>
        </div>

        <div v-if="!mutableVote">
          <OpinionButtons @voted="voted" />
        </div>
      </div>
    </div>

    <div class="poll__discussion-break-out">
      <div class="poll__discussion-wrapper">
        <h2>{{ $t('poll.discussion') }} ({{comments.length}})</h2>
        <h3>{{ $t('poll.your-say') }}</h3>

        <Textarea />
        
        <Comments :comments="comments" :depth="parseInt(0)" />

        <div class="poll__other-polls">
          <h2>
            <Button :value="$t('poll.other-polls-button')" class="poll__other-polls-button" @clicked="redirectToOtherPolls" />
            <hr class="poll__double-line" />
            <hr class="poll__double-line" />
          </h2>
        </div>
      </div>
      </div>
  </div>
</template>

<script>
import axios from 'axios';

import Heading from '@/components/molecules/Heading.vue'
import OpinionButtons from '@/components/molecules/OpinionButtons.vue'
import BarChart from '@/components/molecules/charts/BarChart.vue'
import Button from '@/components/atoms/Button.vue'
import Textarea from '@/components/atoms/Textarea.vue'
import Comments from '@/components/organisms/Comments.vue'

import comments from '@/static-data/comments.json';
import users from '@/static-data/users.json';

export default {
  name: 'poll',
  props: {
    id: String,
    vote: String
  },
  data: function() {
    return {
        mutableVote: this.vote,
        comments: comments.comments
    };
  },
  computed: {
      poll(){
          return this.$store.getters.POLL
      }
  },
  created() {
    this.$store.dispatch('GET_POLL', { id: this.id })
  },
  methods: {
    voted: function(vote){
      this.mutableVote = vote;
    },
    redirectToOtherPolls: function(){
      this.$router.push({ name: 'polls' })
    },
    redirectToAnalyzeVotes: function(){
      this.$router.push({ name: 'analyze-votes', params: { id: this.id }});
    }
  },
  components: {
    Heading,
    Button,
    BarChart,
    OpinionButtons,
    Comment,
    Comments,
    Textarea
  },
};
</script>

<style>
.poll__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

.poll__chart-wrapper {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  display: grid;
  padding: 1em 0;
  grid-gap: 20px;
}

.poll__discussion-break-out {
  background: #f6f6f6;
}

.poll__discussion-wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
}

.poll__chart-wrapper-vote {
  grid-column: 1 / span 4
}

.poll__chart-wrapper-bar-chart {
  grid-column: 1 / span 4;
  margin: 0 auto;
  max-width: 80%;
}

.poll__chart-wrapper-analyze-votes-button {
  grid-column: 1 / span 4;
  margin: 0 auto;
}

.poll_content {
  order: 2;
}

.poll__ads {
  height: 100%;
  background: grey;
  order: 1;
}

.vote-text {
  color: red;
}

.poll__other-polls {
  grid-template-columns: 1fr;
  display: grid;
  text-align:center;
}

.poll__other-polls-button {
  width: 30%;
}

.poll__double-line {
  margin-top: -20px;
}

@media all and (min-width: 850px) {
  .poll__wrapper {
    grid-template-columns: 1fr 0.2fr;
  }

  .poll_content {
    order: 1;
  }

  .poll__ads {
    order: 2;
  }

  .poll__other-polls {
    width: 50%;
  }
}
</style>
