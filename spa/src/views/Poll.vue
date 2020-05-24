<template>
  <b-container fluid="true" class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <CompletePoll v-if="poll"/>
    <ContentLoading v-if="! poll" type="poll"/>
  </b-container>
</template>

<script>
import CompletePoll from '@/components/organisms/CompletePoll.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';

export default {
  name: 'poll',
  components: {
    CompletePoll,
    ContentLoading,
  },
  props: {
    slug: String,
  },
  created() {
    this.$store.dispatch('GET_POLL', { slug: this.slug });
  },
  beforeRouteUpdate(to, from, next) {
    if (from.params.slug !== to.params.slug) {
      this.$store.dispatch('GET_POLL', { slug: to.params.slug });
    }
    next();
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
  },
};
</script>
