<template>
  <div class="pt-3 w-75 m-auto">
    <CompletePoll v-if="poll" />
    <ContentLoading v-if="! poll" type="poll" />

    <ul>
      <li v-for="item in stream" :key="item._id">
        <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">{{item.info.caption}}</router-link>
        {{ $t('poll.votes') }}: {{item.votes_count}}
      </li>
    </ul>
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
