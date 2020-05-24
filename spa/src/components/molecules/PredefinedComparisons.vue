<template>
  <div id="scroll">
    {{ $t('poll.analysis.comparison') }}
    <router-link :to="{ name: 'analyse-poll', params: { slug, type: 'muzi_zeny' }, hash: '#scroll' }">
      {{ $t('poll.analysis.men_women') }}
    </router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug, type: 'auto_kamion' }, hash: '#scroll' }">
      {{ $t('poll.analysis.car_truck') }}
    </router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug, type: 'auto_motorka' }, hash: '#scroll' }">
      {{ $t('poll.analysis.car_bike') }}
    </router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug, type: 'zajic_zkuseny' }, hash: '#scroll' }">
      {{ $t('poll.analysis.unseasoned_veteran') }}
    </router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug, type: 'praha_brno' }, hash: '#scroll' }">
      {{ $t('poll.analysis.praha_brno') }}
    </router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug, type: 'vlastni' }, hash: '#scroll' }">
      {{ $t('poll.analysis.custom') }}
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'PredefinedComparisons',
  props: {
    slug: String,
  },
};
</script>
