<template>
  <div id="home__wrapper">
    <div id="home__ads">
      Ads
    </div>
    <div id="home__content">
      <Heading />

      <OpinionButtons @voted="voted" />

      <TopPolls />
    </div>
  </div>
</template>

<script>
import TopPolls from '@/components/molecules/TopPolls.vue';
import Heading from '@/components/molecules/Heading.vue';
import OpinionButtons from '@/components/molecules/OpinionButtons.vue';

export default {
  name: 'home',
  components: {
    TopPolls,
    Heading,
    OpinionButtons,
  },
  methods: {
    voted(category) {
      this.$router.push({ 
        name: 'poll', 
        params: { 
          id: "1", 
          vote: category
        } 
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
