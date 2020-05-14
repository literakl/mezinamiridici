<template>
  <b-container fluid>
    <b-row>
      <b-col offset="1">
        <h1>{{ $t('generic.not-found-caption') }}</h1>
        <p>{{ $t('generic.not-found-message') }}</p>
        <img src="/img/opravit.jpg" :alt="$t('generic.we-must-fix')" width="800">
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  name: 'not-found',
};
</script>
