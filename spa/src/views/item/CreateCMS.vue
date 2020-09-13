<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('cms.edit.new-cms-heading') }}</h1>

    <CMSForm :isCreate="true"/>
  </div>
</template>

<script>

import CMSForm from '@/components/organisms/CMSForm.vue';

export default {
  components: {
    CMSForm,
  },
};
</script>
