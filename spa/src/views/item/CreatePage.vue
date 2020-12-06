<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('cms.edit.new-cms-heading') }}</h1>

    <ContentForm :isCreate="true"/>
  </div>
</template>

<script>
import ContentForm from '@/components/organisms/PageForm.vue';

export default {
  name: 'CreatePage',
  components: {
    ContentForm,
  },
};
</script>
