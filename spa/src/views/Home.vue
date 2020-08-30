<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <PollHeading v-if="poll" :item="poll"/>
    <ContentLoading v-if="! poll" type="poll"/>
    <ItemList :exceptItem="poll"/>
  </div>
</template>

<script>
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import PollHeading from '@/components/molecules/PollHeading.vue';
import ItemList from '@/components/molecules/ItemList.vue';

export default {
  name: 'home',
  components: {
    ContentLoading,
    PollHeading,
    ItemList,
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
