<template>
  <div class="mt-5 border centerbox">
    <div class="head-area">
      <h2>{{ $t('page-title.create-page') }}</h2>
    </div>
    <PageForm />
  </div>
</template>

<script>
import PageForm from '@/components/organisms/PageForm.vue';

export default {
  name: 'CreatePage',
  components: {
    PageForm,
  },
};
</script>

<style scoped>
.centerbox {
  max-width: 1235px;
  padding: 25px 35px;
  border-radius: 4px;
  margin: 0 auto 30px auto;
}

.head-area {
  padding-bottom: 0;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.head-area h2 {
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  width: 100%;
  padding: 0 0 15px 0;
}

@media (max-width: 700px) {
  .centerbox {
    margin-right: 35px;
    margin-left: 35px;
    padding: 25px 20px;
  }
}
</style>
