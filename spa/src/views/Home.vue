<template>
  <b-container fluid="true" class="pt-3 w-75 m-auto">
    <CompletePoll v-if="poll"/>
    <ContentLoading v-if="! poll" type="poll"/>

    <b-row>
      <b-col>
        <ul>
          <li v-for="item in stream" :key="item._id">
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
              {{item.info.caption}}
            </router-link>
            {{ $t('poll.votes') }}: {{item.votes_count}}
          </li>
        </ul>
      </b-col>
    </b-row>
  </b-container>
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
    this.$root.$once('sign-out', this.logoutEventHandler);
  },
  methods: {
    logoutEventHandler() {
      this.$store.dispatch('INIT_STREAM');
    },
  },
};
</script>
