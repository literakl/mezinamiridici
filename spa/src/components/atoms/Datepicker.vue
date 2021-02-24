<template>
  <ValidationProvider
    mode="eager"
    class=""
    tag="div"
    :vid="vid"
    :rules="rules"
    :name="name || label"
    v-slot="{ errors, required, ariaMsg }">
    <div class="">
      <label
        @click="$refs.input.focus()"
        :for="name">
        <div v-if="label">
          <span class="d-label">{{ label }}</span>
          <span>{{ required ? ' *' : '' }}</span>
        </div>
      </label>

      <datepicker
      :class="{ 'is-invalid':errors[0], 'has-value': hasValue }"
      :id="name"
      v-model="innerValue"
      :format="format"
      :minimum-view="minimumView"
      :bootstrap-styling="true"
      :disabled-dates="disabledDates"
      :required="required"
      :type="type"
      :typeable="true"
      ref="input"
      :name="name"/>

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
import Datepicker from 'vuejs-datepicker';

export default {
  name: 'DatePicker',
  components: {
    Datepicker,
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
    format: {
      type: String,
      default: 'dd MMM yyyy',
    },
    minimumView: {
      type: String,
      default: 'day',
    },
    disabledDates: {
      type: Object,
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
<style scoped>
.d-label{
  font-weight: 300;
  color: #000;
}
</style>
