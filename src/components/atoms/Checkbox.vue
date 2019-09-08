<template>
  <div class="checkbox">
        <input
            type="checkbox"
            :id="identifier"
            :name="name"
            :value="identifier"
            ref="checkbox"
            class="sign-up-form__input-checkbox"
            @input="updateCheckbox()"
        >
        <label :for="identifier"><span>{{text}}</span></label>
    </div>
</template>

<script>
export default {
  props: ['value', 'name', 'identifier', 'text'],

  methods: {
    updateCheckbox() {
      this.$emit('input', this.$refs.checkbox.checked)
    }
  }
};
</script>

<style>
.checkbox {
    width: 80px;
    float: left;
}

.sign-up-form__input-checkbox[type="checkbox"] {
    opacity: 0.00000001;
    position: absolute;
}

.checkbox label {
    position: relative;
    min-height: 34px;
    display: block;
    padding-left: 40px;
    cursor: pointer;
}

.checkbox label:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    margin: 4px;
    width: 16px;
    height: 15px;
    border: 2px solid #9e9e9e;
}

.checkbox label:after {
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

.checkbox input[type="checkbox"]:checked ~ label::before {
    color: #ffd302;
    border-left: 2px solid black;
    border-top: 2px solid black;
    border-right: 2px solid black;
    border-bottom: 2px solid black;
}

.checkbox input[type="checkbox"]:checked ~ label::after {
    -webkit-transform: rotate(-45deg) scale(1);
    -moz-transform: rotate(-45deg) scale(1);
    -ms-transform: rotate(-45deg) scale(1);
    transform: rotate(-45deg) scale(1);
}

.checkbox label span {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
}
</style>