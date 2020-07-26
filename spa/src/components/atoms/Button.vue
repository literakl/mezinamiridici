<template>
  <b-button
    :size="size"
    type="submit"
    v-on:click="clicked"
    :disabled="disabled"
    variant="warning">
    {{value}}
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
  },
  methods: {
    clicked(e) {
      this.$emit('clicked');
      e.preventDefault();
    },
  },
};
</script>
