<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('generic.not-found-caption') }}</h1>
    <p>{{ $t('generic.not-found-message') }}</p>
    <img src="/img/opravit.jpg" :alt="$t('generic.we-must-fix')" width="800">
  </div>
</template>

<script>

export default {
  name: 'not-found',
};
</script>
