<template>
  <div>
    <p>{{ $t('infoBox.whyThisForum.para') }} <router-link to="#">{{ $t('infoBox.readMore') }}</router-link></p>
  </div>
</template>

<script>
export default {
  name: 'InfoBoxContent',
};
</script>

<style scoped>
a {
  color: var(--link-blue);
}
</style>
