<template>
<div v-if="summary" class="container mb-3" >
  <div class="row py-2">
    <div class="col col-md-3 m-auto">
      <Date :date="summary.date" format="dynamicDate" />
    </div>
    <div class="col col-md-6 m-auto">
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
    </div>
    <div class="col col-md-3 m-auto">
      <div class="float-right">
        <router-link :to="{ name: 'accidents-details', params: { day: isoDate }}">Více statistik <BIconArrowRight scale="1" variant="dark"></BIconArrowRight></router-link>
      </div>
    </div>
  </div>
</div>
</template>

<script>

import Date from '@/components/atoms/Date';
import { show } from '@/utils/dateUtils';
import { BIconChatTextFill, BIconCollection, BIconArrowRight} from 'bootstrap-vue';

export default {
  name: 'AccidentsSummary',
  components: {
    BIconChatTextFill,
    BIconCollection,
    BIconArrowRight,
    Date,
  },
  data() {
    return {
      summary: null,
    };
  },
  computed: {
    isoDate() {
      return show(this.summary.date, 'ISO');
    },
  },
  async created() {
    this.summary = await this.$store.dispatch('GET_ACCIDENTS_SUMMARY');
  }
};
</script>

<style scoped>
.container {
  max-width: 1280px;
   background-color:rgba(196,196,196,.2);
}
.font-num {
  font-size: 1.7em;
}
</style>
