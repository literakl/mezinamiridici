<template>
  <router-link :to="{ name: 'user-profile', params: { id: profile.id }}">
    {{profile.nickname}}
  </router-link>
</template>

<script>
export default {
  name: 'ProfileLink',
  props: {
    profile: Object,
  },
};
</script>
