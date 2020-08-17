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
