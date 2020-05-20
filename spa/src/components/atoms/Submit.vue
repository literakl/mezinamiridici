<template>
  <b-form-input class="bg-warning" type="submit" v-bind:value="value"></b-form-input>
</template>

<script>
export default {
  name: 'Submit',
  props: {
    value: String,
  },
};
</script>
