<template>
  <ValidationProvider
    tag="span"
    v-model="value"
    :vid="vid"
    :rules="rules"
    :name="name || label"
    v-slot="{ errors }">
    <b-form-checkbox
      :class="{ 'border-gray-700': !errors[0], 'border-red-600': errors[0] }"
      :id="identifier"
      v-model="checked"
      ref="input"
      @click.native="selectfunction($event)"
    >
      <label v-if="label" :for="identifier" class="atoms__checkbox-label">
        <span>{{ label }}</span>
      </label>
      <slot></slot>
    </b-form-checkbox>
  </ValidationProvider>
</template>

<script>
import { BFormCheckbox } from 'bootstrap-vue';

export default {
  components: {
    BFormCheckbox,
  },
  data: () => ({
    checked: null,
  }),
  created() {
    this.checked = this.value;
  },
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
      default: undefined,
    },
    rules: {
      type: [Object, String],
      default: '',
    },
    value: {
      type: null,
      default: null,
    },
  },
  methods: {
    selectfunction(event) {
      if (event.target.checked) {
        this.checked = !this.checked;
      }
      this.$emit('input', event.target.checked);
    },
  },
};
</script>
