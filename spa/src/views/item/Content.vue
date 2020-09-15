<template>
  <div class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! cms" type="cms" />
    <div v-if="cms">
      <div v-html="cms.data.content"></div>
    </div>
  </div>
</template>

<script>
import ContentLoading from '@/components/atoms/ContentLoading.vue';

export default {
  name: 'Content',
  components: {
    ContentLoading,
  },
  props: {
    slug: String,
  },
  computed: {
    cms() {
      const cms = this.$store.getters.CONTENT;
      if (cms) this.changeTitle(cms.info.caption);
      return cms;
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
