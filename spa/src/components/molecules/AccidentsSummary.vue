<template>
<div v-if="summary">
  <b-container class="container mb-3" >
  <b-row class="py-2">
    <b-col class="m-auto" md="3">
      <div class="font-12">27.1</div>
    </b-col>
    <b-col class="m-auto" md="6">
      <div class="d-flex justify-content-around">
        <div>
        <img src="/images/icons/crash.png" width="48" height="48" alt="Počet nehod">
        <span class="text-warning font-num"><span class="mx-2">+</span>{{ summary.total.count }}</span>
        </div>
        <div>
        <img src="/images/icons/tombstone.png" width="48" height="48" alt="Počet úmrtí">
        <span class="text-warning font-num" > <span class="mx-2" > +</span>{{ summary.total.impact.deaths }}</span>
        </div>
        <div>
        <img src="/images/icons/ambulance.png" width="48" height="48" alt="Počet zranění">
        <span class="text-warning font-num"><span class="mx-2">+</span>{{ summary.total.impact.severely + summary.total.impact.slightly }}</span>
        </div>
      </div>
    </b-col>
    <b-col class="m-auto font-12" md="3">
      <div class="float-right">Vice statistik <BIconArrowRight scale="1" variant="dark"></BIconArrowRight></div>
      </b-col>
  </b-row>
</b-container>
</div>
</template>

<script>

import Date from '@/components/atoms/Date';
import { BIconChatTextFill, BIconCollection,BContainer, BRow, BCol, BIconArrowRight} from 'bootstrap-vue';

export default {
  name: 'AccidentsSummary',
  components: {
    BIconChatTextFill,
    BIconCollection,
    BIconArrowRight,
    Date,
    'b-container': BContainer,
    BRow, BCol
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
.container {
  max-width: 1280px;
   background-color:rgba(196,196,196,.2);
}
.font-12 {
  font-size: 12px;
}
.font-num {
  font-size: 1.7em;
}
</style>
