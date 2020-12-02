<template>
  <div>
    <b-form-radio
      type="radio"
      :id="identifier"
      :value="identifier"
      :name="name"
      ref="radio"
      @click.native="updateRadio()"
      v-model="selected">
        {{label}}
    </b-form-radio>
  </div>
</template>

<script>
import { BFormRadio } from 'bootstrap-vue';

export default {
  components: {
    BFormRadio,
  },
  data: () => ({
    selected: null,
  }),
  created() {
    if (this.value) {
      this.selected = this.value;
    }
  },
  props: ['value', 'name', 'identifier', 'label', 'checked'],

  methods: {
    updateRadio() {
      this.$emit('input', this.$refs.radio.value);
    },
  },
};
</script>
