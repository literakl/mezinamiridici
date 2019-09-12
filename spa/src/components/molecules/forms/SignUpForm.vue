<template>
    <form
        id="app"
        @submit="checkForm"
    >
        <div v-if="errors.length">
            <strong class="sign-up-form__errors-heading">
                Please correct the following error(s):
            </strong>
            <ul>
                <li v-for="error in errors" v-bind:key="error">
                    {{ error }}
                </li>
            </ul>
        </div>

        <div id="sign-up-form-wrapper">
            <div class="sign-up-form__label">
                <label for="email">Email</label>
            </div>
            <TextInput v-model="email" identifier="email" type="email" />

            <div class="sign-up-form__label">
                <label for="password">Password</label>
            </div>
            <TextInput v-model="password" identifier="password" type="password" />

            <div class="sign-up-form__label">
                <label for="processing-data">Privacy</label>
            </div>
            <div class="sign-up-form__input">
                <Radio v-model="dataProcessing" name="processing-data" identifier="processing-data-yes" text="Yes" />
                <Radio v-model="dataProcessing" name="processing-data" identifier="processing-data-no" text="No" />
            </div>

            <div class="sign-up-form__label">
                <label for="marketing">Marketing</label>
            </div>
            <div class="sign-up-form__input">
                <Radio v-model="marketing" name="marketing" identifier="marketing-yes" text="Yes" />
                <Radio v-model="marketing" name="marketing" identifier="marketing-no" text="No" />
            </div>
        </div>

        <Submit value="Finished" class="sign-up-form__button"/>
    </form>
</template>

<script>

import Submit from '@/components/atoms/Submit.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  name: 'SignUpForm',
  components: {
    Radio,
    TextInput,
    Submit,
  },
  data: () => ({
    errors: [],
    email: null,
    password: null,
    dataProcessing: false,
    marketing: false,
  }),
  methods: {
    checkForm(e) {
      this.errors = [];

      if (!this.email) {
        this.errors.push('Email required.');
      }
      if (!this.password) {
        this.errors.push('Password required.');
      }

      e.preventDefault();

      if (this.errors.length === 0) {
        // This will eventually call the API to create the user as validation has passed.
        this.$router.push('/');
      }

      return this.errors.length !== 0;
    },
  },
};
</script>


<style lang="scss">
#sign-up-form-wrapper {
    display: grid;
    grid-template-columns: 0.3fr 1fr;
    margin-top: 40px;
}

.sign-up-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
}

.sign-up-form__button {
    width: 30%;
}
</style>
