<template>
  <ValidationProvider
    tag="span"
    v-model="value"
    :vid="vid"
    :rules="rules"
    :name="name || label"
    v-slot="{ errors, required }">
    <b-form-checkbox
      :class="{ 'border-gray-700': !errors[0], 'border-red-600': errors[0] }"
      :id="identifier"
      value="false"
      ref="input"
      @click.native="selectfunction($event)"
    >
      {{label}}
    </b-form-checkbox>
  </ValidationProvider>
</template>

<script>
import { ValidationProvider } from 'vee-validate';

export default {
  props: {
    vid: {
      type: String,
      default: undefined,
    },
    identifier: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    rules: {
      type: [Object, String],
      default: '',
    },
    value: {
      type: null,
      default: '',
    },
  },
  components: {
    ValidationProvider,
  },
  methods: {
    selectfunction(event) {
      this.$emit('input', event.target.checked);
    },
  },
};
</script>
