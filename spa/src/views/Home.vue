<template>
  <div id="home__wrapper">
    <div id="home__ads"></div>
    <div id="home__content">
      <CompletePoll v-if="poll" />
      <ContentLoading v-if="! poll" type="poll" />

      <ul>
        <li v-for="item in stream" :key="item._id">
          <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">{{item.info.caption}}</router-link>
          {{ $t('poll.votes') }}: {{item.votes_count}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import CompletePoll from '@/components/organisms/CompletePoll.vue';

export default {
  name: 'home',
  components: {
    ContentLoading,
    CompletePoll,
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
    stream() {
      return this.$store.getters.STREAM;
    },
  },
  created() {
    this.$store.dispatch('INIT_STREAM');
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
