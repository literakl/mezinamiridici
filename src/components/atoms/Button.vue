<template>
    <button
        type="submit"
        id="atom__button"
        v-on:click="clicked()"
    >
        {{value}}
    </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: String,
  },
  methods: {
    clicked() {
      this.$emit('clicked');
    },
  },
};
</script>

<style scoped lang="scss">
#atom__button {
    background-color: #ffd200;
    height: 53px;
    width: 182px;
    border-radius: 5px;
    font-size: 20px;
    font-weight: 700;
    border: 0px;
    box-shadow: 0px 4px #f5a522;
}

#atom__button:hover {
    box-shadow: none;
    cursor: pointer;
}
</style>
