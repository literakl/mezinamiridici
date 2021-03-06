<template>
  <div class="pt-3 m-auto pb-5">
    <HomePoll v-if="poll" :poll="poll"/>
    <ItemList :exceptItem="poll"/>
  </div>
</template>

<script>
import HomePoll from '@/components/molecules/HomePoll.vue';
import ItemList from '@/components/organisms/ItemList.vue';

export default {
  name: 'home',
  components: {
    HomePoll,
    ItemList,
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
  },
  created() {
    this.$store.dispatch('GET_LATEST_POLL');
    this.$root.$once('sign-out', this.logoutEventHandler);
  },
  methods: {
    logoutEventHandler() {
      this.$store.dispatch('GET_LATEST_POLL');
    },
  },
};
</script>
