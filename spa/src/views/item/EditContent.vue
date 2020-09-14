<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('cms.edit.edit-cms') }}</h1>

    <ContentForm v-if="cms" :cms="cms" :isCreate="false"/>
  </div>
</template>

<script>
import ContentForm from '@/components/organisms/ContentForm.vue';

export default {
  name: 'EditContent',
  components: {
    ContentForm,
  },
  props: {
    slug: String,
  },
  computed: {
    cms() {
      return this.$store.getters.CONTENT;
    },
  },
  created() {
    this.$store.dispatch('FETCH_CONTENT', { slug: this.slug });
  },
};
</script>
