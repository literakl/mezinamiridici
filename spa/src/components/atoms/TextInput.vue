<template>
  <ValidationProvider
    class="relative appearance-none w-full TextInput"
    tag="div"
    :vid="vid"
    :rules="rules"
    :name="name || label"
    v-slot="{ errors, required, ariaInput, ariaMsg }"
  >
    <input
      class="w-full py-2 px-3 leading-normal bg-transparent border-b"
      :class="{ 'border-gray-700': !errors[0], 'border-red-600': errors[0], 'has-value': hasValue }"
      :id="name"
      :type="type"
      :placeholder="placeholder"
      ref="input"
      v-model="innerValue"
      v-bind="ariaInput"
    >
    <label
      class="absolute block inset-0 w-full px-2 py-2 leading-normal"
      @click="$refs.input.focus()"
      :for="name"
      :class="{ 'text-gray-700': !errors[0], 'text-red-600': errors[0] }"
    >
      <span>{{ label || name }}</span>
      <span>{{ required ? ' *' : '' }}</span>
    </label>
    <span
      class="block text-red-600 text-xs absolute bottom-0 left-0"
      v-bind="ariaMsg"
      v-if="errors[0]"
    >{{ errors[0] }}</span>
  </ValidationProvider>
</template>

<script>
import { ValidationProvider } from 'vee-validate';

export default {
  name: 'TextInput',
  components: {
    ValidationProvider,
  },
  props: {
    vid: {
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

<style lang="scss" scoped>
  .TextInput {
    padding-bottom: 18px;
    input {
      position: relative;
      z-index: 99999;
      padding-top: 1.4rem;

      &.has-value,
      &:focus {
        outline: none;
      }
    }

    label {
      margin-top: 1rem;
      user-select: none;
    }

    input.has-value ~ label,
    input:focus ~ label {
      font-size: 0.6rem;
      margin-top: 0;
      transition: all 0.2s ease-in-out;
    }
  }
</style>
