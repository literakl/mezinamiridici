<template>
  <div>
    <content-loader
      :height="160"
      :width="400"
      v-if="type === 'poll' || type === 'generic' || type === 'items'"
    >
      <rect x="0" y="0" width="400" height="40"/>
      <rect x="0" y="60" width="200" height="20"/>
      <rect x="0" y="100" width="50" height="40"/>
      <rect x="80" y="100" width="50" height="40"/>
      <rect x="160" y="100" width="50" height="40"/>
      <rect x="240" y="100" width="50" height="40"/>
    </content-loader>

    <content-loader
      :height="100"
      :width="400"
      v-if="type === 'profile'"
    >
      <rect x="9" y="12" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="12" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="31" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="31" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="51" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="51" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="71" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="71" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="91" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="91" rx="3" ry="3" width="100" height="5"/>
    </content-loader>

    <content-loader
      :height="200"
      :width="400"
      v-if="type === 'voting'"
    >
      <rect x="50" y="9.61" rx="3" ry="3" width="40" height="200"/>
      <rect x="130" y="9.61" rx="3" ry="3" width="40" height="200"/>
      <rect x=210 y="7.61" rx="3" ry="3" width="40" height="200"/>
      <rect x="290" y="7.61" rx="3" ry="3" width="40" height="200"/>
    </content-loader>
  </div>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';

export default {
  name: 'ContentLoading',
  components: {
    ContentLoader,
  },
  props: {
    type: {
      type: String,
      default: 'generic',
    },
  },
};
</script>
