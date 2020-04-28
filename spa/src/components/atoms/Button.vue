<template>
    <b-button
        size="lg"
        type="submit"
        :class="disabled ? 'atom__button--disabled' : 'atom__button'"
        v-on:click="clicked"
        :disabled="disabled"
        variant="warning">{{value}}
    </b-button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: String,
    disabled: Boolean,
  },
  methods: {
    clicked(e) {
      this.$emit('clicked');
      e.preventDefault();
    },
  },
};
</script>
