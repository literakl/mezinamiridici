<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('cms.edit.edit-cms') }}</h1>

    <CMSForm v-if="cms" :cms="cms" :isCreate="false"/>
  </div>
</template>

<script>

import CMSForm from '@/components/organisms/CMSForm.vue';

export default {
  components: {
    CMSForm,
  },
  props: {
    slug: String,
    type: String,
  },
  computed: {
    cms() {
      return this.$store.getters.CMS;
    },
    role() {
      return this.$store.getters.USER_ROLE[1] === 'admin:cms';
    },
  },
  created() {
    this.$store.dispatch('FETCH_CMS', { slug: this.slug, type: this.type });
  },
  mounted() {
    if (!this.role) this.$router.push('/');
  },
};
</script>
