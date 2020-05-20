<template>
  <div class="modal" v-bind:class="{'modal--visible': show}">
    <div class="modal__wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: Boolean,
  },
};
</script>


<style scoped lang="scss">
  .modal {
    position: fixed;
    opacity: 0;
    z-index: 1;
    padding-top: 180px;
    min-height: 500px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.6);
    -webkit-transition: all 0.25s ease-out;
    -moz-transition: all 0.25s ease-out;
    -ms-transition: all 0.25s ease-out;
    -o-transition: all 0.25s ease-out;
    transition: all 0.25s ease-out;
    pointer-events: none;
  }

  .modal.modal--visible {
    opacity: 1;
    pointer-events: auto;
  }

  .modal__wrapper {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 50%;
  }
</style>
