<template>
  <div class="pt-3 m-auto pb-5">
    <div v-if="!poll" class="poll-content">
      <ContentLoading v-if="!poll" type="generic"/>
    </div>
    <div v-if="poll">
      <HomePoll :poll="poll"/>
      <ItemList :excluded-item="poll" :pinned-items="pinnedItems"/>
    </div>
  </div>
</template>

<script>
import HomePoll from '@/components/molecules/HomePoll.vue';
import ItemList from '@/components/organisms/ItemList.vue';
import ContentLoading from '@/components/atoms/ContentLoading.vue';

export default {
  name: 'home',
  components: {
    HomePoll,
    ItemList,
    ContentLoading,
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
    pinnedItems() {
      return this.$store.getters.PINNED_ITEMS;
    },
  },
  created() {
    this.$store.dispatch('GET_LATEST_POLL');
    this.$store.dispatch('FETCH_PINNED_ITEMS');
    this.$root.$once('sign-out', this.logoutEventHandler);
  },
  mounted() {
  },
  methods: {
    logoutEventHandler() {
      this.$store.dispatch('GET_LATEST_POLL');
    },
  },
};
</script>
