<template>
  <b-button
    :size="size"
    type="submit"
    v-on:click="clicked"
    :disabled="disabled"
    variant="outline-dark">
      <BIconArrowDown class="mx-1"/>
    <b-spinner v-if="waiting"></b-spinner>
    <span v-if="waiting===false">{{ value }}</span>
  </b-button>
</template>

<script>
import { BButton, BSpinner, BIconArrowDown } from 'bootstrap-vue';

export default {
  name: 'Button',
  components: {
    BButton,
    BSpinner,
    BIconArrowDown,
  },
  props: {
    value: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'lg',
    },
    waiting: Boolean,
  },
  methods: {
    clicked(e) {
      this.$emit('clicked');
      e.preventDefault();
    },
  },
};
</script>
