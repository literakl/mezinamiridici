<template>
  <div class="pt-3 w-75 m-auto pb-5">
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
  </div>
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
      return this.$store.getters.TAG_CLOUD;
    },
  },
  created() {
    this.$store.dispatch('FETCH_TAG_CLOUD');
    if (this.tag) {
      this.$store.dispatch('FETCH_ITEMS_BY_TAG', this.tag);
      setTimeout(() => { document.title += `\xa0\xa0-\xa0\xa0${this.tag}`; }, 10);
    }
  },
  methods: {
    fetchData() {
      if (this.tag) {
        this.$store.dispatch('FETCH_ITEMS_BY_TAG', this.tag);
      }
    },
    onTagClick(tag) {
      this.$router.push({ name: 'tag', params: { tag: tag[0] } });
    },
  },
};
</script>
