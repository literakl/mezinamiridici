<template>
  <div>
    <div class="poll__wrapper">
      <div class="poll__ads">
        Ads
      </div>

      <PollVoting class="poll__voting" :id="id" :vote="vote" />
    </div>

    <div class="poll__discussion-break-out" v-if="comments">
      <div class="poll__discussion-wrapper">
        <h2>{{ $t('poll.discussion') }} ({{comments.length}})</h2>

        <div v-if="signedIn">
          <h3>{{ $t('poll.your-say') }}</h3>
          <Textarea />
        </div>

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
import PollVoting from '@/components/organisms/PollVoting.vue';
import BarChart from '@/components/molecules/charts/BarChart.vue';
import Button from '@/components/atoms/Button.vue';
import Textarea from '@/components/atoms/Textarea.vue';
import Comments from '@/components/organisms/Comments.vue';
import { ContentLoader } from "vue-content-loader"

import users from '@/static-data/users.json';

export default {
  name: 'poll',
  props: {
    id: String,
    vote: String,
  },
  async created() {
    this.$store.dispatch('GET_USER_ID');
    await this.$store.dispatch('GET_POLL_COMMENTS', {
      id: this.id
    });
  },
  methods: {
    redirectToOtherPolls() {
      this.$router.push({ name: 'polls' });
    },
    redirectToAnalyzeVotes() {
      this.$router.push({ name: 'analyze-votes', params: { id: this.id } });
    },
  },
  computed: {
    signedIn() {
      return this.$store.getters.SIGNED_IN;
    },
    comments() {
      return this.$store.getters.POLL_COMMENTS
    },
  },
  components: {
    Heading,
    Button,
    Comment,
    Comments,
    Textarea,
    PollVoting
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

.poll__ads {
  height: 100%;
  background: grey;
  order: 1;
}

.poll__voting  {
  order: 2;
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
  .poll__voting  {
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
