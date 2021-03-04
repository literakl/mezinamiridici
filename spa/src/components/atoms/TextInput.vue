<template>
  <ValidationProvider
    mode="eager"
    class="w-50"
    tag="div"
    :vid="vid"
    :rules="rules"
    :name="name || label"
    v-slot="{ errors, required, ariaInput, ariaMsg }">
    <div>
      <label
        @click="$refs.input.focus()"
        :for="name">
        <div v-if="label">
          <span>{{ label }}</span>
          <span v-if="required" class="text-danger"> *</span>
        </div>
      </label>
      <b-form-input
        :class="{ 'is-invalid':errors[0], 'has-value': hasValue }"
        :id="name"
        :type="type"
        :disabled="disabled"
        :placeholder="placeholder"
        ref="input"
        v-model="innerValue"
        v-bind="ariaInput">
      </b-form-input>
      <div
        class="p-1 text-danger"
        v-bind="ariaMsg"
        v-if="errors[0]">
        {{ errors[0] }}
      </div>
    </div>
  </ValidationProvider>
</template>

<script>
import { BFormInput } from 'bootstrap-vue';

export default {
  name: 'TextInput',
  components: {
    BFormInput,
  },
  props: {
    vid: {
      type: String,
      default: undefined,
    },
    mode: {
      type: String,
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
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
      validator(value) {
        return [
          'url',
          'text',
          'password',
          'tel',
          'search',
          'number',
          'email',
        ].includes(value);
      },
    },
    value: {
      type: null,
      default: '',
    },
  },
  data: () => ({
    innerValue: '',
  }),
  computed: {
    hasValue() {
      return !!this.innerValue;
    },
  },
  watch: {
    innerValue(value) {
      this.$emit('input', value);
    },
    value(val) {
      if (val !== this.innerValue) {
        this.innerValue = val;
      }
    },
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  },
};
</script>
