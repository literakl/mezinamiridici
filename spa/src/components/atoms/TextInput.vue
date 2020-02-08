<template>
  <ValidationProvider
    mode="eager"
    class="relative appearance-none w-full TextInput"
    tag="div"
    :vid="vid"
    :rules="rules"
    :name="name || label"
    v-slot="{ errors, required, ariaInput, ariaMsg }"
  >
    <div class="form-group">
      <label
        class="absolute block inset-0 w-full px-2 py-2 leading-normal"
        @click="$refs.input.focus()"
        :for="name"
        :class="{ 'text-gray-700': !errors[0], 'text-red-600': errors[0] }"
      >
        <div v-if="label">
          <span>{{ label }}</span>
          <span>{{ required ? ' *' : '' }}</span>
        </div>
      </label>
      <input
        class="form-control"
        :class="{ 'is-invalid':errors[0] , 'has-value': hasValue }"
        :id="name"
        :type="type"
        :placeholder="placeholder"
        ref="input"
        v-model="innerValue"
        v-bind="ariaInput"
      >
      <div
        class="display-error"
        v-bind="ariaMsg"
        v-if="errors[0]"
      >{{ errors[0] }}</div>
    </div>
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
    .form-group {
      font-size: 25px;
      margin-bottom: 1rem;
      clear: both;
      input {
        position: relative;
        /*z-index: 99999;*/
        padding: 0.4rem;
        width: 60%;
        font-size: 20px;
        border-radius: 4px;
        &.has-value,
        &:focus {
          outline: none;
        }
      }

      label {
        margin-top: 1rem;
        user-select: none;
      }
      .is-invalid{
        border-color: #dc3545;
      }
      input.has-value ~ label,
      input:focus ~ label {
        font-size: 0.6rem;
        margin-top: 0;
        transition: all 0.2s ease-in-out;
      }
      .display-error{
        padding: 10px;
        color: firebrick;
      }
    }
  }
</style>
