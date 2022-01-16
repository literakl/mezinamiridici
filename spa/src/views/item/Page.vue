<template>
  <div class="pages-wrap">
    <div class="pt-3 ml-auto mr-auto mt-auto mb-5">
      <ContentLoading v-if="!content" type="cms"/>
      <div v-if="content" class="page-content-wrap">
        <div v-html="content.data.content" class="post-content"></div>
        <ShareLink :item="content"/>
      </div>
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
      const item = this.$store.getters.CONTENT;
      if (item) this.changeTitle(item.info.caption);
      return item;
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
    this.$store.dispatch('FETCH_CONTENT', { slug: this.slug, component: this });
  },
  methods: {
    changeTitle(title) {
      setTimeout(() => {
        document.title = title;
      }, 10);
    },
  },
};
</script>

<style scoped>
.pages-wrap {
  max-width: 1235px;
  margin: 0 auto;
}

@media (max-width: 1235px) {
  .pages-wrap {
    margin: 0 35px;
  }
}

</style>
