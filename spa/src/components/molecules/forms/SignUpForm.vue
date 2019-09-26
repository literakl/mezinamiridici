<template>
    <form
        id="app"
        @submit="checkForm"
    >
        <div v-if="errors.length">
            <strong class="sign-up-form__errors-heading">
                {{ $t('sign-up.errors-heading') }}
            </strong>
            <ul>
                <li v-for="error in errors" v-bind:key="error">
                    {{ error }}
                </li>
            </ul>
        </div>

        <div id="sign-up-form-wrapper">
            <div class="sign-up-form__label">
                <label for="email">{{ $t('sign-up.email-label') }}</label>
            </div>
            <TextInput class="sign-up-form__input" v-model="email" identifier="email" type="email" />

            <div class="sign-up-form__label">
                <label for="password">{{ $t('sign-up.password-label') }}</label>
            </div>
            <TextInput class="sign-up-form__input" v-model="password" identifier="password" type="password" />

            <div class="sign-up-form__input">
                <Checkbox v-model="termsAndConditions" name="terms-and-conditions" identifier="terms-and-conditions"/>
            </div>
            <div class="sign-up-form__label">
                <label for="terms-and-conditions">{{ $t('sign-up.terms-label') }}</label>
            </div>

            <div class="sign-up-form__input">
                <Checkbox v-model="personalDataProcessing" name="personal-data-processing" identifier="personal-data-processing"/>
            </div>
            <div class="sign-up-form__label">
                <label for="personal-data-processing">{{ $t('sign-up.processing-label') }}</label>
            </div>

            <div class="sign-up-form__input">
                <Checkbox v-model="emailNotifications" name="email-notifications" identifier="email-notifications"/>
            </div>
            <div class="sign-up-form__label">
                <label for="email-notifications">{{ $t('sign-up.notifications-label') }}</label>
            </div>
        </div>

        <Submit :value="$t('sign-up.finished-button-label') " class="sign-up-form__button"/>
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
    nickname: null,
    drivingSince: null,
    bike: null,
    car: null,
    bus: null,
    van: null,
    truck: null,
    tramway: null,
    male: null,
    female: null,
    bornInYear: null,
    region: '',
    education: '',
    onlyNickname: null,
    everything: null
  }),
  methods: {
    checkForm(e) {
      this.errors = [];

      if (!this.email) {
        this.errors.push(this.$t('sign-up.email-required'));
      }
      if (!this.password) {
        this.errors.push(this.$t('sign-up.password-required'));
      }
      if (!this.termsAndConditions) {
        this.errors.push(this.$t('sign-up.terms-conditions-required'));
      }
      if (!this.personalDataProcessing) {
        this.errors.push(this.$t('sign-up.data-processing-required'));
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
