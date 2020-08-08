<template>
  <b-button
    :size="size"
    type="submit"
    v-on:click="clicked"
    :disabled="disabled"
    variant="warning">
    <b-spinner v-if="waiting"></b-spinner>
    <span v-if="waiting===false">{{value}}</span>
  </b-button>
</template>

<script>
export default {
  name: 'Button',
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
