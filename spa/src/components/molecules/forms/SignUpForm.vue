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
            <TextInput class="sign-up-form__input" v-model="email" identifier="email" type="email" />

            <div class="sign-up-form__label">
                <label for="password">Password</label>
            </div>
            <TextInput class="sign-up-form__input" v-model="password" identifier="password" type="password" />

            <div class="sign-up-form__label">
                <label for="terms-and-conditions">I agree with terms and conditions</label>
            </div>
            <div class="sign-up-form__input">
                <Checkbox v-model="termsAndConditions" name="terms-and-conditions" identifier="terms-and-conditions"/>
            </div>

            <div class="sign-up-form__label">
                <label for="personal-data-processing">I agree <a>processing of my personal data</a></label>
            </div>
            <div class="sign-up-form__input">
                <Checkbox v-model="personalDataProcessing" name="personal-data-processing" identifier="personal-data-processing"/>
            </div>

            <div class="sign-up-form__label">
                <label for="email-notifications">I want to recieve email notifications</a></label>
            </div>
            <div class="sign-up-form__input">
                <Checkbox v-model="emailNotifications" name="email-notifications" identifier="email-notifications"/>
            </div>
        </div>

        <Submit value="Finished" class="sign-up-form__button"/>
    </form>
</template>

<script>

import Submit from '@/components/atoms/Submit.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  name: 'SignUpForm',
  components: {
    Checkbox,
    TextInput,
    Submit,
  },
  data: () => ({
    errors: [],
    email: null,
    password: null,
    termsAndConditions: false,
    personalDataProcessing: false,
    emailNotifications: false,
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
      if (!this.termsAndConditions) {
        this.errors.push('You must agree to our terms and conditions');
      }
      if (!this.personalDataProcessing) {
        this.errors.push('You must agree to us processing your personal data');
      }

      e.preventDefault();

      if (this.errors.length === 0) {
        // This will eventually call the API to create the user as validation has passed.
        this.$router.push('/complete-profile');
      }

      return this.errors.length !== 0;
    },
  },
};
</script>


<style lang="scss">
#sign-up-form-wrapper {
    display: grid;
    margin-top: 40px;
}

.sign-up-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
}

.sign-up-form__input {
    width: 100%;
}

.sign-up-form__button {
    width: 100%;
}

@media all and (min-width: 850px) {

    .sign-up-form__button {
        width: 30%;
    }

    #sign-up-form-wrapper {
        grid-template-columns: 0.3fr 1fr;
    }

    .sign-up-form__input {
        width: 70%;
    }
}
</style>
