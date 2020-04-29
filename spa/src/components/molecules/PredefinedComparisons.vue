<template>
  <span>
    {{ $t('poll.analysis.comparison') }}
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'muzi_zeny' }}">{{ $t('poll.analysis.men_women') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'auto_kamion' }}">{{ $t('poll.analysis.car_truck') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'auto_motorka' }}">{{ $t('poll.analysis.car_bike') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'zajic_zkuseny' }}">{{ $t('poll.analysis.unseasoned_veteran') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'praha_brno' }}">{{ $t('poll.analysis.praha_brno') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'vlastni' }}">{{ $t('poll.analysis.custom') }}</router-link>
  </span>
</template>

<script>
export default {
  name: 'PredefinedComparisons',
  props: {
    slug: String,
  },
};
</script>
