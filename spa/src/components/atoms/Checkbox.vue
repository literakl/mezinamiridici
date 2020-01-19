<template>
  <span class="atoms__checkbox">
        <input
            type="checkbox"
            :id="identifier"
            :name="name"
            :value="identifier"
            ref="checkbox"
            class="atoms__checkbox-input"
            @input="updateCheckbox()"
            :checked="checked"
        >
        <label :for="identifier" class="atoms__checkbox-label">
            <span>
                {{text}}
            </span>
        </label>
    </span>
</template>

<script>
export default {
  props: ['value', 'name', 'identifier', 'text', 'checked'],

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
