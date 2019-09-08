<template>
  <div class="sign-up-form__input">
        <input
            :id="identifier"
            :type="type"
            :name="identifier"
            ref="input"
            class="sign-up-form__input-text"
            @input="updateInput()"
        >
    </div>
</template>

<script>
export default {
  props: ['value', 'identifier', 'type'],

  methods: {
    updateInput() {
      this.$emit('input', this.$refs.input.value);
    },
  },
};
</script>

<style>
.sign-up-form__input {
    margin-bottom: 20px;
}

.sign-up-form__input-text {
    width: 40%;
    height:  20px;
    border-radius: 3px;
    border: 1px solid #cccccc
}

</style>
