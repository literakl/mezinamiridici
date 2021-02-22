<template>
  <div class="pt-3 mt-5 centerbox">
    <vue-word-cloud
      style="font-family:fantasy;width:100%;min-height:250px;border: 5px dashed #e6eaef!important;border-bottom-width: 10px!important;"
      :words="tags"
      :color="([, weight]) => weight > 5 ? '#ffc107' : weight > 3 ? 'RoyalBlue' : 'Indigo'"
      font-family="fantasy"
      :spacing="0.1"
      class="tags"
      >
      <template slot-scope="{text, weight, word}"><div style="">
        <div :title="weight" style="cursor: pointer;" @click="onTagClick(word)">
          <div>{{ text }}</div>
        </div></div>
      </template>
    </vue-word-cloud>
    <div class="items-with-tags mt-4">
      <ContentLoading v-if="! items" type="items"/>
    </div>
    <ItemList v-if="tag" :tag="tag"/>
  </div>
</template>

<script>
import VueWordCloud from 'vuewordcloud';
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import ItemList from '@/components/organisms/ItemList.vue';

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
<style scoped>
.centerbox{
  max-width: 1235px;
  margin: 0 auto;
  width: 100%;
}
@media (max-width: 1235px) {
 .centerbox{
   width:91%;
 }
}
</style>
