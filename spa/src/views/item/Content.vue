<template>
  <div class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! content" type="cms" />
    <div v-if="content">
      <div v-html="content.data.content"></div>
      <ShareLink :item="content" />
      <Comments v-if="content.type==='content'" :itemId="content._id" />
    </div>
  </div>
</template>

<script>
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import Comments from '@/components/organisms/Comments.vue';
import ShareLink from '@/components/molecules/ShareLink.vue';

export default {
  name: 'Content',
  components: {
    ContentLoading,
    Comments,
    ShareLink,
  },
  props: {
    slug: String,
  },
  computed: {
    content() {
      const cms = this.$store.getters.CONTENT;
      if (cms) this.changeTitle(cms.info.caption);
      return cms;
    },
    title() {
      let txt = '';
      if (this.content !== null) {
        txt = this.content.info.caption;
      }
      return txt;
    },
  },
  created() {
    this.$store.dispatch('FETCH_CONTENT', { slug: this.slug });
  },
  methods: {
    changeTitle(title) {
      setTimeout(() => { document.title = title; }, 10);
    },
  },
};
</script>
