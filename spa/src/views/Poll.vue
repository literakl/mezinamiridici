<template>
  <div>
    <div class="poll__wrapper">
      <div class="poll__ads">
        Ads
      </div>

      <div class="poll_content">
        <Heading :poll="poll"/>
        <div v-if="mutableVote || votedAlready === true">
          <div class="poll__chart-wrapper">
            <h2 class="poll__chart-wrapper-vote">
              {{ $t('poll.your-vote') }}
              <span class="vote-text">{{mutableVote}}</span>
            </h2>
            <div class="poll__chart-wrapper-bar-chart" v-if="voting === false || votedAlready === true">
              <BarChart v-bind:voted="mutableVote" :percentages="pollVotesPercentages" />
            </div>

            <content-loader
              :height="200"
              :width="400"
              :speed="22"
              primaryColor="#f3f3f3"
              secondaryColor="#ecebeb"
              class="poll__chart-wrapper-bar-chart"
              v-if="voting"
            >
              <rect x="50" y="9.61" rx="3" ry="3" width="40" height="200" /> 
              <rect x="130" y="9.61" rx="3" ry="3" width="40" height="200" /> 
              <rect x=210 y="7.61" rx="3" ry="3" width="40" height="200" /> 
              <rect x="290" y="7.61" rx="3" ry="3" width="40" height="200" />
            </content-loader>

            <div class="poll__chart-wrapper-analyze-votes-button">
              <Button :value="$t('poll.analyze-votes')" @clicked="redirectToAnalyzeVotes" />
            </div>
          </div>
        </div>

        <div v-if="mutableVote === false || votedAlready === false">
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

import Heading from '@/components/molecules/Heading.vue';
import OpinionButtons from '@/components/molecules/OpinionButtons.vue';
import BarChart from '@/components/molecules/charts/BarChart.vue';
import Button from '@/components/atoms/Button.vue';
import Textarea from '@/components/atoms/Textarea.vue';
import Comments from '@/components/organisms/Comments.vue';
import { ContentLoader } from "vue-content-loader"

import comments from '@/static-data/comments.json';
import users from '@/static-data/users.json';

export default {
  name: 'poll',
  props: {
    id: String,
    vote: String,
  },
  data() {
    return {
      mutableVote: this.vote,
      comments: comments.comments,
      voting: true,
      votedAlready: false
    };
  },
  computed: {
    poll() {
      const votes = this.$store.getters.POLL_VOTES;
      let numberOfVotes = 0;

      if(this.mutableVote) {
        numberOfVotes = votes ? votes.length + 1 : 1
      } else {
        numberOfVotes = votes ? votes.length : 0
      }

      return {
        poll: this.$store.getters.POLL,
        pollVotes: numberOfVotes
      }
    },
    pollVotesPercentages() {
      const votes = this.$store.getters.POLL_VOTES;

      if(!votes) return {
        noProblem: 0,
        trivialTrouble: 0,
        iDontLikeIt: 0,
        iHateIt: 0
      };

      const noProblem = votes.filter(vote => vote.vote === 1);
      const trivialTrouble = votes.filter(vote => vote.vote === 0);
      const iDontLikeIt = votes.filter(vote => vote.vote === -1);
      const iHateIt = votes.filter(vote => vote.vote === -2);

      return {
        noProblem: Math.round(((noProblem.length / votes.length)*100)),
        trivialTrouble: Math.round(((trivialTrouble.length / votes.length)*100)),
        iDontLikeIt: Math.round(((iDontLikeIt.length / votes.length)*100)),
        iHateIt:  Math.round(((iHateIt.length / votes.length)*100)),
        totalVotes: votes.length
      };
    },
  },
  async created() {
    this.$store.dispatch('GET_USER_ID');

    const hasVoted = await this.$store.dispatch('GET_USERS_VOTES', { 
      userId: this.$store.getters.USER_ID,
      pollId: this.id 
    });

    if(hasVoted) {
      this.votedAlready = true;
    }

    this.$store.dispatch('GET_POLL_VOTES', { id: this.id });
    this.$store.dispatch('GET_POLL', { id: this.id });

    if(this.mutableVote){
      const voted = await this.$store.dispatch('VOTE', {
        id: this.id,
        vote: this.vote
      });
    }

    this.voting = false;
  },
  methods: {
    async voted(vote) {
      const voted = await this.$store.dispatch('VOTE', {
        id: this.id,
        vote: vote
      });

      await this.$store.dispatch('GET_POLL_VOTES', { id: this.id });

      this.votedAlready = true;
    },
    redirectToOtherPolls() {
      this.$router.push({ name: 'polls' });
    },
    redirectToAnalyzeVotes() {
      this.$router.push({ name: 'analyze-votes', params: { id: this.id } });
    },
  },
  components: {
    Heading,
    Button,
    BarChart,
    OpinionButtons,
    Comment,
    Comments,
    Textarea,
    ContentLoader,
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
