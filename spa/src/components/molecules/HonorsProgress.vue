<template>
  <div>{{ $t('profile.rank-label') }}: {{ $t(`profile.rank.${user.honors.rank}`) }}</div>
</template>

<script>
export default {
  name: 'HonorsProgress',
  props: {
    user: Object,
  },
};
</script>
