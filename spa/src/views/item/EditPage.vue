<template>
  <div class="mt-5 border centerbox">
    <div class="head-area">
      <h2>{{ $t('cms.edit.edit-cms') }}</h2>
    </div>
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
<style scoped>
.centerbox{
  max-width: 700px;
  padding: 25px 35px;
  border-radius: 4px;
  margin: 0 auto 30px auto;
}
.head-area{
  padding-bottom:0px;
  margin-bottom:10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.head-area h2{
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  width:100%;
  padding: 0 0 15px 0;
}
@media (max-width: 700px) {
  .centerbox{
    margin-right: 35px;
    margin-left: 35px;
    padding: 25px 20px;
  }
}
</style>
