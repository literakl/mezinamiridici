<template>
  <ValidationProvider
    class="relative"
    tag="div"
    :vid="vid"
    :rules="rules"
    :name="name || label"
    v-slot="{ errors, required }"
  >
    <input
      class=""
      :class="{ 'border-gray-700': !errors[0], 'border-red-600': errors[0] }"
      :id="identifier"
      type="checkbox"
      ref="input"
    >
    <label :for="identifier" class="atoms__checkbox-label">
      <span>{{label}}</span>
    </label>
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
    checked: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ValidationProvider,
  },
  methods: {
    updateCheckbox() {
      this.$emit('input', this.$refs.checkbox.checked);
    },
  },
};
</script>

<style>
.atoms__checkbox {
    width: 80px;
    float: left;
}

.atoms__checkbox-label {
    position: relative;
    min-height: 34px;
    display: block;
    padding-left: 40px;
    cursor: pointer;
}

.atoms__checkbox-label:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    margin: 4px;
    width: 16px;
    height: 15px;
    border: 2px solid #9e9e9e;
}

.atoms__checkbox-label span {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
}

.atoms__checkbox-label:after {
  content: '';
    display: block;
    width: 20px;
    height: 5px;
    border-bottom: 2px solid #ffd302;
    border-left: 2px solid #ffd302;
    -webkit-transform: rotate(-45deg) scale(0);
    -moz-transform: rotate(-45deg) scale(0);
    -ms-transform: rotate(-45deg) scale(0);
    transform: rotate(-45deg) scale(0);
    position: absolute;
    top: 7px;
    left: 8px;
}

.atoms__checkbox-input[type="checkbox"] {
    opacity: 0.00000001;
    position: absolute;
}

.atoms__checkbox-input[type="checkbox"]:checked ~ label::before {
    color: #ffd302;
    border-left: 2px solid black;
    border-top: 2px solid black;
    border-right: 2px solid black;
    border-bottom: 2px solid black;
}

.atoms__checkbox-input[type="checkbox"]:checked ~ label::after {
    -webkit-transform: rotate(-45deg) scale(1);
    -moz-transform: rotate(-45deg) scale(1);
    -ms-transform: rotate(-45deg) scale(1);
    transform: rotate(-45deg) scale(1);
}
</style>
