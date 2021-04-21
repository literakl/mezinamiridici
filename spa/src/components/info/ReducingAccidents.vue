<template>
  <div class="container">
    <p>{{ $t('infoBox.reducingAccidents.para') }} <router-link to="#">{{ $t('infoBox.readMore') }}</router-link></p>
  </div>
</template>

<script>
export default {
  name: 'InfoBoxContent',
};
</script>

<style scoped>
.container {
  display: flex;
  align-content: center;
  justify-items: center;
  height: 100px;
  width: 100%;
  background-color: brown;
  position: relative;
}
p {
  width: 100%;
  padding-top: 2rem;
  font-size: 1.2rem;
  color: white;
}
a {
  color: yellow !important;
}
</style>
