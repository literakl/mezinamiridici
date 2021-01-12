<template>
  <div class="test pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! content" type="cms" />
    <div v-if="content">
      <div v-html="content.data.content" class="post-content"></div>
      <ShareLink :item="content" />
    </div>
  </div>
</template>

<script>
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import ShareLink from '@/components/molecules/ShareLink.vue';

export default {
  name: 'Page',
  components: {
    ContentLoading,
    ShareLink,
  },
  props: {
    slug: String,
  },
  computed: {
    content() {
      const cms = this.$store.getters.PAGE;
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
    this.$store.dispatch('FETCH_PAGE', { slug: this.slug });
  },
  methods: {
    changeTitle(title) {
      setTimeout(() => { document.title = title; }, 10);
    },
  },
};
</script>
