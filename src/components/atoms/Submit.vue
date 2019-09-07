<template>
    <input
        type="submit"
        v-bind:value="value"
        id="atom__submit-button"
    >
</template>

<script>
export default {
  name: 'Submit',
  props: {
    value: String,
  },
};
</script>

<style scoped lang="scss">
#atom__submit-button {
    background-color: #ffd200;
    height: 53px;
    width: 182px;
    border-radius: 5px;
    font-size: 20px;
    font-weight: 700;
    border: 0px;
    box-shadow: 0px 4px #f5a522;
}

#atom__submit-button:hover {
    box-shadow: none;
    cursor: pointer;
}
</style>
