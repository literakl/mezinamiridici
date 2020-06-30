<template>
  <router-link :to="{ name: 'user-profile', params: { id: profile.userId }}">
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
