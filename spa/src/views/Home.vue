<template>
  <div id="home__wrapper">
    <div id="home__ads">
      Ads
    </div>
    <div id="home__content">
      <Poll
        v-if="$store.getters.LATEST_POLL"
        :item="$store.getters.LATEST_POLL" />
      <content-loader
        :height="200"
        :width="400"
        :speed="22"
        primaryColor="#f3f3f3"
        secondaryColor="#ecebeb"
        class="poll-voting__chart-wrapper-bar-chart"
        v-if="! $store.getters.LATEST_POLL"
      >
        <rect x="50" y="9.61" rx="3" ry="3" width="40" height="200" />
        <rect x="130" y="9.61" rx="3" ry="3" width="40" height="200" />
        <rect x=210 y="7.61" rx="3" ry="3" width="40" height="200" />
        <rect x="290" y="7.61" rx="3" ry="3" width="40" height="200" />
      </content-loader>
    </div>
  </div>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';
import Poll from '@/components/organisms/CompletePoll.vue';

export default {
  name: 'home',
  components: {
    ContentLoader,
    Poll,
  },
  created() {
    this.$store.dispatch('GET_LATEST_POLL');
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
