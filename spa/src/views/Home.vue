<template>
  <div id="home__wrapper">
    <div id="home__ads">
      Ads
    </div>
    <div id="home__content">
      <PollVoting :id="pollId" />
      <TopPolls />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import TopPolls from '@/components/molecules/TopPolls.vue';
import Heading from '@/components/molecules/Heading.vue';
import OpinionButtons from '@/components/molecules/OpinionButtons.vue';
import PollVoting from '@/components/organisms/PollVoting.vue';

const pollId = "769a6250-a781-46c1-80e2-8ffd78f48869"

export default {
  name: 'home',
  components: {
    TopPolls,
    Heading,
    OpinionButtons,
    PollVoting
  },
  data() {
    return {
      votedAlready: false,
      pollId
    }
  },
  computed: {
    poll() {
      return {
        poll: this.$store.getters.POLLS ? this.$store.getters.POLLS.find(poll => poll.pollId === pollId) : null,
        pollVotes: this.$store.getters.POLL_VOTES ? this.$store.getters.POLL_VOTES.length : 0
      }
    }
  },
 async created() {
    this.$store.dispatch('GET_POLLS');
    this.$store.dispatch('GET_USER_NICKNAME');
    this.$store.dispatch('GET_USER_ID');
    this.$store.dispatch('GET_POLL_VOTES', {
      id: pollId
    });

    const hasVoted = await this.$store.dispatch('GET_USERS_VOTES', { 
      userId: this.$store.getters.USER_ID,
      pollId
    });

    if(hasVoted) {
      this.votedAlready = true;
    }
  },
  methods: {
    async voted(category) {
      const params = {
        id: this.poll.poll.pollId,
        vote: category,
      };

      this.$router.push({
        name: 'poll',
        params
      });
    },
  },
};
</script>

<style>
#home__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

#home__content {
  order: 2;
}

#home__ads {
  height: 100%;
  background: grey;
  order: 1;
}

@media all and (min-width: 850px) {
  #home__wrapper {
    grid-template-columns: 1fr 0.2fr;
  }

  #home__content {
    order: 1;
  }

  #home__ads {
    order: 2;
  }
}
</style>
