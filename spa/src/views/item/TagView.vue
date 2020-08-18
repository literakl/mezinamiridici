<template>
  <b-container fluid="true" class="pt-3 w-75 m-auto">
    <b-button-group size="sm">
      <b-button
        v-for="t in tags" :key="t"
        :to="{ name: 'tag', params: { tag: t } }"
        :pressed="t === tag"
        variant="primary"
      >
        #{{t}}
      </b-button>
    </b-button-group>

    <ContentLoading v-if="! items" type="items"/>
    <Items v-if="hasItems" :items="items"/>
  </b-container>
</template>

<script>
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import Items from '@/components/atoms/Items.vue';

export default {
  name: 'Tag',
  components: {
    ContentLoading,
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
    hasItems() {
      return this.items !== null && this.items.length > 0;
    },
    hasTags() {
      return this.tags !== null && this.tags.length > 0;
    },
    tags() {
      const x = this.$store.getters.TAGS;
      if (x) {
        x.sort((a, b) => a.localeCompare(b));
      }
      console.log(x);
      return x;
    },
  },
  created() {
    this.$store.dispatch('GET_TAGS');
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
  },
};
</script>
