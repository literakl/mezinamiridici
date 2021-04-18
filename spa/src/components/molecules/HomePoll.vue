<template>
  <div class="mb-3">
    <h4 class="poll-heading">
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }}">
        {{ poll.info.caption }}
      </router-link>
    </h4>

    <div v-if="voted" class="poll-success">
      <ul>
        <li>
          <div class="np-status">
            <span class="status-img"><img src="/images/icons/happy.svg" alt=""></span>
            <span class="title-status">{{ $t('poll.choices.neutral') }}</span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span :class="(this.votes.neutral > 0) ? 'progress-bar-fill-green' : 'progress-bar-fill-yellow'" v-bind:style="{ 'width' :  this.votes.neutral + '%'  }">
                  <i>{{ this.votes.neutral }}%</i>
                </span>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="traval-trouble-status">
            <span class="status-img"><img src="/images/icons/ok.svg" alt=""></span>
            <span class="title-status">{{ $t('poll.choices.trivial') }}</span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span :class="(this.votes.trivial > 0) ? 'progress-bar-fill-blue' : 'progress-bar-fill-yellow'" :style="{'width' : this.votes.trivial + '%'}">
                  <i>{{ this.votes.trivial }}%</i>
                </span>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="dislike-status">
            <span class="status-img"><img src="/images/icons/dislike.svg" alt=""></span>
            <span class="title-status">{{ $t('poll.choices.dislike') }}</span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span class="progress-bar-fill-yellow" :style="{'width': this.votes.dislike + '%'}">
                  <i>{{ this.votes.dislike }}%</i>
                </span>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="angry-status">
            <span class="status-img"><img src="/images/icons/angry.svg" alt=""></span>
            <span class="title-status">{{ $t('poll.choices.hate') }}</span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span :class="(this.votes.hate > 0) ? 'progress-bar-fill-red' : 'progress-bar-fill-yellow'" :style="{'width': this.votes.hate + '%'}">
                  <i>{{ this.votes.hate }}%</i>
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="!voted" class="d-flex justify-content-center">
      <PollButtons v-on:do-vote="onVote"/>
    </div>
  </div>
</template>

<script>

import normalizeVotes from '@/utils/chartUtils';
import PollButtons from '@/components/molecules/PollButtons.vue';

export default {
  name: 'HomePoll',
  components: {
    PollButtons,
  },
  props: {
    poll: Object,
  },
  data() {
    return {
      voting: false,
      percentage: 0,
    };
  },
  computed: {
    voted() {
      return this.poll.my_vote;
    },
    votes() {
      return normalizeVotes(this.poll.votes);
    },
  },
  methods: {
    myVoteClass(value) {
      return this.poll.my_vote === value ? 'button_my_vote' : '';
    },
    async onVote(vote) {
      this.voting = true;
      await this.$store.dispatch('POLL_VOTE', {
        id: this.poll._id,
        vote,
      });
      this.voting = false;
    },
  },
};
</script>

<style scoped>
/* Poll Buttons Horizantal Align Center  */
.np-status, .traval-trouble-status, .dislike-status, .angry-status {
  display: flex;
  align-items: center;
}

.np-status span, .traval-trouble-status span, .dislike-status span, .angry-status span {
  margin-right: 15px;
}

.np-status span.status-img {
  margin-right: 11px;
}

.title-status {
  max-width: 125px;
  width: 100%;
}

/* Voted Poll Success Progress Bars Css Start */
.poll-success {
  max-width: 915px;
  margin: 0 auto;
  padding: 10px 0 0 10px
}

.poll-success ul {
  padding: 0;
  margin: 0;
}

.poll-success ul li {
  list-style-type: none;
  font-size: 14px;
  font-weight: 400;
}

.poll-success ul li img {
  width: 38px;
  height: 38px;
  margin-left: 0px;
}

.poll-success ul li:first-child {
  flex: 1 1 100%;
}

.poll-success ul li:first-child img {
  width: 45px;
  height: 35px;
  margin-left: -3px;
}

.progress-bar-outer {
  width: 100%;
}

.progress-bar {
  width: 100%;
  background-color: #f7f7f7;
  padding: 3px;
  border-radius: 0px;
  transition: width 500ms ease-in-out;
  text-align: right;
}

.progress-bar i {
  padding-right: 15px;
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
}

.progress-bar-fill-green {
  display: block;
  background-color: var(--no-problem-status);
}

.progress-bar-fill-blue {
  display: block;
  background-color: var(--traval-trouble-status);
}

.progress-bar-fill-yellow {
  display: block;
  background-color: var(--dislike-status);
}

.progress-bar-fill-yellow i {
  color: #212529;
}

.progress-bar-fill-red {
  display: block;
  background-color: var(--angry-status);
}

/* Voted Poll Success Progress Bars Css End */

.poll-heading {
  max-width: 1076px;
  padding: 0 15px;
  margin: 0 auto;
}

.poll-heading a {
  font-size: 24px;
  text-decoration: none;
  margin: 10px 0 0px;
  display: block;
  color: var(--text-color);
  text-align: center;
}

.poll-heading a:hover {
  color: var(--link-blue);
}

@media (max-width: 1065px) {
  .poll-success {
    padding: 0 15px;
  }
}

@media (max-width: 767px) {
  .poll-heading a {
    margin: 0px 0 15px;
  }

  .progress-bar i {
    padding-right: 5px;
  }
}

@media (max-width: 550px) {
  .np-status, .traval-trouble-status, .dislike-status, .angry-status {
    flex-basis: 100px;
    flex-wrap: wrap;
  }

  .poll-success {
    margin-bottom: 20px;
  }
}
</style>
