<template>
  <span>
    <b-form-radio
      type="radio"
      :id="identifier"
      :value="identifier"
      :name="name"
      ref="radio"
      @click.native="updateRadio()"
      :checked="value === identifier">
        {{label}}
    </b-form-radio>
  </span>
</template>

<script>
export default {
  props: ['value', 'name', 'identifier', 'label', 'checked'],

  methods: {
    updateRadio() {
      this.$emit('input', this.$refs.radio.value);
    },
  },
};
</script>
