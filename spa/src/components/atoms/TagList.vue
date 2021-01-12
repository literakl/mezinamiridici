<template>
  <span>
    <router-link v-for="tag in tags" :key="tag" :to="{ name: 'tag', params: { tag: tag } }">
      #{{tag}}
    </router-link>
  </span>
</template>

<script>

export default {
  name: 'TagList',
  props: {
    tags: Array,
  },
};
</script>
<style scoped>
.post-tags{
  padding-top: 20px;
      display: flex;
    align-items: center;
    justify-content: flex-start;
}
.post-tags a{
  font-weight: 400;
    padding: 3px 10px;
    background: #f9f9f9;
    margin: 0 2px 0 0;
}
@media (max-width: 600px) {
.post-tags{
      display: flex;
      flex-wrap: wrap;
}
.post-tags svg{ margin-right: 15px;}
}
</style>
