<template>
  <span>
    {{ $t('poll.comparison') }}
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'muzi_zeny' }}">{{ $t('poll.men_women') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'auto_kamion' }}">{{ $t('poll.car_truck') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'auto_motorka' }}">{{ $t('poll.car_bike') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'zajic_zkuseny' }}">{{ $t('poll.unseasoned_veteran') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'praha_brno' }}">{{ $t('poll.praha_brno') }}</router-link>,
    <router-link :to="{ name: 'analyse-poll', params: { slug: slug, type: 'vlastni' }}">{{ $t('poll.custom') }}</router-link>
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
