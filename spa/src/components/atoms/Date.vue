<template>
  <span>{{ this.formatted }}</span>
</template>

<script>
import { show } from '@/utils/dateUtils';

export default {
  name: 'Date',
  props: {
    date: String,
    format: String,
  },
  computed: {
    formatted() {
      return show(this.date, this.format);
    },
  },
};
</script>
