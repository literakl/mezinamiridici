<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('cms.edit.edit-cms') }}</h1>

    <PageForm v-if="page" :page="page" :isCreate="false"/>
  </div>
</template>

<script>
import PageForm from '@/components/organisms/PageForm.vue';

export default {
  name: 'EditPage',
  components: {
    PageForm,
  },
  props: {
    slug: String,
  },
  computed: {
    page() {
      return this.$store.getters.PAGE;
    },
  },
  created() {
    this.$store.dispatch('FETCH_PAGE', { slug: this.slug });
  },
};
</script>
