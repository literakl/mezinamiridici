<template>
  <div v-if="summary" class="mb-3">
    <Date :date="summary.date" format="dynamicDate"/>
    <img src="/images/icons/crash.png" width="48" height="48" alt="Počet nehod">
    {{ summary.total.count }}
    <img src="/images/icons/tombstone.png" width="48" height="48" alt="Počet úmrtí">
    {{ summary.total.impact.deaths }}
    <img src="/images/icons/ambulance.png" width="48" height="48" alt="Počet zranění">
    {{ summary.total.impact.severely + summary.total.impact.slightly }}

  </div>
</template>

<script>

import Date from '@/components/atoms/Date';
import { BIconChatTextFill, BIconCollection } from 'bootstrap-vue';

export default {
  name: 'AccidentsSummary',
  components: {
    BIconChatTextFill,
    BIconCollection,
    Date,
  },
  data() {
    return {
      summary: null,
    };
  },
  async created() {
    this.summary = await this.$store.dispatch('GET_ACCIDENTS_SUMMARY');
    console.log(this.summary);//todo remove
  }
};
</script>

<style scoped>
</style>
