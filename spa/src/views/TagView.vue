<template>
  <b-container fluid="true" class="pt-3 w-75 m-auto">
    <Tags :cTag="tag" @clicked="viewPoll"/>
    <ContentLoading v-if="! items" type="items"/>

    <Items v-if="hasPolls" :items="items"/>

  </b-container>
</template>

<script>
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import Tags from '@/components/atoms/Tags.vue';
import Items from '@/components/atoms/Items.vue';

export default {
  name: 'home',
  components: {
    ContentLoading,
    Tags,
    Items,
  },
  props: {
    tag: String,
  },
  watch: {
    $route: 'fetchData',
  },
  computed: {
    items() {
      let stream = [];
      if (this.tag) {
        stream = this.$store.getters.ITEMS_BY_TAG;
      }
      return stream;
    },
    hasPolls() {
      return this.items !== null && this.items.length > 0;
    },
  },
  created() {
    if (this.tag) {
      this.$store.dispatch('GET_ITEMS_BY_TAG', this.tag);
    }
  },
  methods: {
    fetchData() {
      if (this.tag) {
        this.$store.dispatch('GET_ITEMS_BY_TAG', this.tag);
      }
    },
    viewPoll(emitTag) {
      this.$router.push(`/stitky/${emitTag}`);
    },
  },
};
</script>
