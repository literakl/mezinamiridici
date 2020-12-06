<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('cms.edit.edit-cms') }}</h1>

    <ContentForm v-if="page" page="page" :isCreate="false"/>
  </div>
</template>

<script>
import ContentForm from '@/components/organisms/PageForm.vue';

export default {
  name: 'EditPage',
  components: {
    ContentForm,
  },
  props: {
    slug: String,
  },
  computed: {
    page() {
      return this.$store.getters.CONTENT;
    },
  },
  created() {
    this.$store.dispatch('FETCH_PAGE', { slug: this.slug });
  },
};
</script>
