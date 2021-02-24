<template>
  <div class="mt-5 pt-3 pb-5 border centerbox">
    <b-row>
      <b-col>
        <h1>{{ $t('generic.not-found-caption') }}</h1>
        <p>{{ $t('generic.not-found-message') }}</p>
        <img src="/images/opravit.jpg" :alt="$t('generic.we-must-fix')" width="800">
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { BRow, BCol } from 'bootstrap-vue';

export default {
  name: 'not-found',
  components: {
    BRow,
    BCol,
  },
};
</script>
<style>

.centerbox{
  max-width: 700px;
  margin: 0 auto;
  padding: 25px 35px;
  width: 100%;
}
.centerbox h1 {
  font-size: 21px;
}
.centerbox img{
  width: 100%;
}
</style>
