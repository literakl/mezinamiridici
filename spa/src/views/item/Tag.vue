<template>
  <b-container fluid="true" class="pt-3 w-75 m-auto">
    <vue-word-cloud
      style="width: 100%; height: 240px;"
      :words="tags"
      :color="([, weight]) => weight > 5 ? 'DeepPink' : weight > 3 ? 'RoyalBlue' : 'Indigo'"
      font-family="fantasy"
      :spacing="0.1"
      >
      <template slot-scope="{text, weight, word}">
        <div :title="weight" style="cursor: pointer;" @click="onTagClick(word)">
          {{ text }}
        </div>
      </template>
    </vue-word-cloud>

    <ContentLoading v-if="! items" type="items"/>
    <ItemList :tag="tag" v-if="tag"/>
  </b-container>
</template>

<script>
import VueWordCloud from 'vuewordcloud';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import ItemList from '@/components/molecules/ItemList.vue';

export default {
  name: 'Tag',
  components: {
    ContentLoading,
    ItemList,
    [VueWordCloud.name]: VueWordCloud,
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
      return this.$store.getters.TAGS;
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
    onTagClick(tag) {
      this.$router.push({ name: 'tag', params: { tag: tag[0] } });
    },
  },
};
</script>
