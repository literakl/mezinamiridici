<template>
  <div class="mt-5 center-box">
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
.center-box{
  background-color: #fff;
  padding: 20px 20px;
  font-size: 0.8em;
  color: #777A7C;
  font-weight: 600;
  box-shadow: var(--drop-shadow-two);
     max-width: 700px;
  margin: 0 auto 30px auto;
}
.head-area{
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ddd;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}
.center-box h2{
  margin: 0;
  font-size: 22px;
  color: var(--text-color);
}
</style>
