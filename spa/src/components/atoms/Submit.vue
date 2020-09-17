<template>
  <b-form-input class="bg-warning" type="submit" v-bind:value="value"></b-form-input>
</template>

<script>
import { BFormInput } from 'bootstrap-vue';

export default {
  name: 'Submit',
  components: {
    BFormInput,
  },
  props: {
    value: String,
  },
};
</script>
