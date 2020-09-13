<template>
  <div class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! cms" type="cms" />
    <div v-if="cms">
      <h1>{{cms.info.caption}}</h1>
      <div v-html="cms.data.content"></div>
    </div>
  </div>
</template>

<script>
import ContentLoading from '@/components/atoms/ContentLoading.vue';

export default {
  name: 'cms',
  components: {
    ContentLoading,
  },
  props: {
    slug: String,
    type: String,
  },
  computed: {
    cms() {
      const cms = this.$store.getters.CMS;
      if (cms) this.changeTitle(cms.info.caption);
      return cms;
    },
    role() {
      return (this.$store.getters.USER_ROLE) ? this.$store.getters.USER_ROLE[1] === 'admin:cms' : false;
    },
  },
  created() {
    this.$store.dispatch('FETCH_CMS', { slug: this.slug, type: this.type });
  },
  methods: {
    changeTitle(title) {
      setTimeout(() => { document.title += `\xa0\xa0-\xa0\xa0${title}`; }, 10);
    },
  },
};
</script>
