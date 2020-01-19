<template>
  <div id="home__wrapper">
    <div id="home__ads">
      Ads
    </div>
    <div id="home__content">
      <PollVoting v-if="this.$store.getters.LATEST_POLL" :id="this.$store.getters.LATEST_POLL" />
      <TopPolls />
    </div>
  </div>
</template>

<script>
import TopPolls from '@/components/molecules/TopPolls.vue';
import PollVoting from '@/components/organisms/PollVoting.vue';

// const pollId = "30cc4cab-4fe7-4a9b-a5c2-eaa93811ef59"

export default {
  name: 'home',
  components: {
    TopPolls,
    PollVoting,
  },
  // data() {
  //   return {
  //     pollId
  //   }
  // },
  async created() {
    await this.$store.dispatch('GET_USER_ID');
    await this.$store.dispatch('GET_USER_NICKNAME');
    // TODO:Warning
    // await this.$store.dispatch('GET_POLLS');
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
