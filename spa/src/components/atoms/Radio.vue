<template>
  <div class="atoms__radio">
        <input
            type="radio"
            :id="identifier"
            :name="name"
            :value="identifier"
            ref="radio"
            class="atoms__radio-input"
            @input="updateRadio()"
        >
        <label :for="identifier" class="atoms__radio-label">
            <span>
                {{text}}
            </span>
        </label>
    </div>
</template>

<script>
export default {
  props: ['value', 'name', 'identifier', 'text'],

  methods: {
    updateRadio() {
      this.$emit('input', this.$refs.radio.value);
    },
  },
};
</script>

<style>
.atoms__radio {
    width: 80px;
    float: left;
}

.atoms__radio-label {
    position: relative;
    min-height: 34px;
    display: block;
    padding-left: 40px;
    cursor: pointer;
}

.atoms__radio-label:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    margin: 4px;
    width: 16px;
    height: 15px;
    border: 2px solid #9e9e9e;
    border-radius: 20px;
}

.atoms__radio-label span {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
}

.atoms__radio-label:after {
  content: '';
    display: block;
    width: 14px;
    height: 13px;
    position: absolute;
    top: 7px;
    left: 7px;
    border-radius: 20px;
}

.atoms__radio-input[type="radio"] {
    opacity: 0.00000001;
    position: absolute;
}

.atoms__radio-input[type="radio"]:checked ~ label::before {
    color: #ffd302;
    border-left: 2px solid black;
    border-top: 2px solid black;
    border-right: 2px solid black;
    border-bottom: 2px solid black;
}

.atoms__radio-input[type="radio"]:checked ~ label::after {
    background: #ffd302;
}
</style>
