<template>
    <button
        type="submit"
        :class="disabled ? 'atom__button--disabled' : 'atom__button'"
        v-on:click="clicked"
        :disabled="disabled"
    >
        {{value}}
    </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: String,
    disabled: String,
  },
  methods: {
    clicked(e) {
      this.$emit('clicked');
      e.preventDefault();
    },
  },
};
</script>

<style scoped lang="scss">
.atom__button {
    background-color: #ffd200;
    height: 53px;
    border-radius: 5px;
    font-size: 20px;
    font-weight: 700;
    border: 0px;
    box-shadow: 0px 4px #f5a522;
}

.atom__button:hover {
    box-shadow: none;
    cursor: pointer;
}

.atom__button--disabled {
    background-color: #ffd200;
    height: 53px;
    border-radius: 5px;
    font-size: 20px;
    font-weight: 700;
    border: 0px;
}

.atom__button--disabled:hover {
    box-shadow: none;
    cursor: not-allowed;
}
</style>
