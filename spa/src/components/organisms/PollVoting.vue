<template>
  <div>
    <div class="poll-voting__wrapper">
      <div class="poll-voting__content">
        <Heading :poll="poll"/>

        <div v-if="mutableVote || votedAlready === true">
          <div class="poll-voting__chart-wrapper">
            <h2 class="poll-voting__chart-wrapper-vote">
              {{ $t('poll.your-vote') }}
              <span class="vote-text">{{mutableVote}}</span>
            </h2>
            <div class="poll-voting__chart-wrapper-bar-chart" v-if="voting === false || votedAlready === true">
              <BarChart v-bind:voted="mutableVote" :percentages="pollVotesPercentages" />
            </div>

            <content-loader
              :height="200"
              :width="400"
              :speed="22"
              primaryColor="#f3f3f3"
              secondaryColor="#ecebeb"
              class="poll-voting__chart-wrapper-bar-chart"
              v-if="voting"
            >
              <rect x="50" y="9.61" rx="3" ry="3" width="40" height="200" /> 
              <rect x="130" y="9.61" rx="3" ry="3" width="40" height="200" /> 
              <rect x=210 y="7.61" rx="3" ry="3" width="40" height="200" /> 
              <rect x="290" y="7.61" rx="3" ry="3" width="40" height="200" />
            </content-loader>

            <div class="poll-voting__chart-wrapper-analyze-votes-button">
              <Button :value="$t('poll.analyze-votes')" @clicked="redirectToAnalyzeVotes" />
            </div>
          </div>
        </div>

        <div v-if="mutableVote === false || votedAlready === false">
          <OpinionButtons @voted="voted" />
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

import users from '@/static-data/users.json';

export default {
  name: 'PollVoting',
  props: {
    id: String,
    vote: String,
  },
  data() {
    return {
      mutableVote: this.vote,
      voting: null,
      votedAlready: null
    };
  },
  computed: {
    poll() {
      const votes = this.$store.getters.POLL_VOTES;
      const numberOfComments = this.$store.getters.POLL_COMMENTS ? this.$store.getters.POLL_COMMENTS.length : 0;
      let numberOfVotes = 0;

      if(this.mutableVote) {
        numberOfVotes = votes ? votes.length + 1 : 1;
      } else {
        numberOfVotes = votes ? votes.length : 0;
      }

      return {
        poll: this.$store.getters.POLL,
        pollVotes: numberOfVotes,
        pollComments: numberOfComments
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

    const voteTypes = {
        "1": "No problem",
        "0":" Trivial trouble",
        "-1": "I don\'t like it",
        "-2": "I hate it"
    };

    const hasVoted = await this.$store.dispatch('GET_USERS_VOTES', { 
      userId: this.$store.getters.USER_ID,
      pollId: this.id 
    });

    await this.$store.dispatch('GET_POLL_VOTES', { id: this.id });
    await this.$store.dispatch('GET_POLL_COMMENTS', { id: this.id });
    await this.$store.dispatch('GET_POLL', { id: this.id });

    if(hasVoted) {
      this.mutableVote = voteTypes[this.$store.getters.POLL_VOTES.find(poll => poll.pollId === hasVoted.pollId).vote.toString()];
      this.votedAlready = true;
    } else {
        this.votedAlready = false;
        if(this.mutableVote){
            const voted = await this.$store.dispatch('VOTE', {
                id: this.id,
                vote: this.vote
            });
        }
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

      this.mutableVote = vote;
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
    Textarea,
    ContentLoader,
  },
};
</script>

<style>
.poll-voting__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    padding: 1em 0;
    grid-gap: 20px;
}

.poll-voting__chart-wrapper {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  display: grid;
  padding: 1em 0;
  grid-gap: 20px;
}

.poll-voting__discussion-break-out {
  background: #f6f6f6;
}

.poll-voting__discussion-wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
}

.poll-voting__chart-wrapper-vote {
  grid-column: 1 / span 4
}

.poll-voting__chart-wrapper-bar-chart {
  grid-column: 1 / span 4;
  margin: 0 auto;
  max-width: 80%;
}

.poll-voting__chart-wrapper-analyze-votes-button {
  grid-column: 1 / span 4;
  margin: 0 auto;
}

.poll-voting__content {
  order: 2;
}

.poll-voting__ads {
  height: 100%;
  background: grey;
  order: 1;
}

.vote-text {
  color: red;
}

.poll-voting__other-polls {
  grid-template-columns: 1fr;
  display: grid;
  text-align:center;
}

.poll-voting__other-polls-button {
  width: 30%;
}

.poll-voting__double-line {
  margin-top: -20px;
}

@media all and (min-width: 850px) {
  .poll-voting__content {
    order: 1;
  }

  .poll-voting__ads {
    order: 2;
  }

  .poll-voting__other-polls {
    width: 50%;
  }
}
</style>
