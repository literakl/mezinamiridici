<template>
  <content-loader
    :height="160"
    :width="400"
    :speed="60"
    primaryColor="#f3f3f3"
    secondaryColor="#ecebeb"
    class="poll-voting__chart-wrapper-bar-chart"
  >
    <rect x="0" y="0" width="400" height="40"/>
    <rect x="0" y="60" width="200" height="20"/>
    <rect x="0" y="100" width="50" height="40"/>
    <rect x="80" y="100" width="50" height="40"/>
    <rect x="160" y="100" width="50" height="40"/>
    <rect x="240" y="100" width="50" height="40"/>
  </content-loader>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';

export default {
  name: 'ContentLoading',
  components: {
    ContentLoader,
  },
  props: {
    type: String,
  },
};
</script>
