<template>
  <div class="forgot">
    <h1>{{ $t('sign-in.forgot-password-heading') }}</h1>

    <p>{{ $t('sign-in.email-reset-description') }}</p>

    <div v-if="!passwordReset">
      <ValidationObserver ref="form" v-slot="{ passes, invalid }">
        <form @submit.prevent="passes(signIn)">
          <div v-if="passwordReset === false">
            <p class="signin__forgot-password-error">{{ $t('sign-in.reset-error') }}</p>
          </div>

          <TextInput
            v-model="email"
            type="email"
            identifier="resetEmail"
            :label="$t('profile.email')"
            :placeholder="$t('sign-in.forgot-email-placeholder')"
            class="signin__reset-text-input"/>

          <Button
            :value="$t('sign-in.reset-password-button')"
            class="signin__forgotten-password-submit-button"
            @clicked="forgotPassword" />
        </form>
      </ValidationObserver>
    </div>

    <div v-if="passwordReset === true">
      <p class="signin__forgot-password-success">{{ $t('sign-in.reset-success') }}</p>
    </div>
  </div>
</template>

<script>
import { extend, ValidationObserver, configure } from 'vee-validate';
import {
// eslint-disable-next-line camelcase
  required, email,
} from 'vee-validate/dist/rules';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import i18n from '../i18n';

extend('email', email);
extend('required', required);
configure({
  defaultMessage: (field, values) => {
    /* eslint no-underscore-dangle: 0 */
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

export default {
  name: 'ForgottenPassword',
  components: {
    ValidationObserver,
    Button,
    TextInput,
  },
  data: () => ({
    email: null,
    passwordReset: null,
    error: null,
  }),
  methods: {
    async forgotPassword() {
      try {
        const response = await this.$store.dispatch('FORGOT_PASSWORD', {
          email: this.email,
        });

        this.passwordReset = response.status === 200;
      } catch (e) {
        this.passwordReset = false;
      }
    },
  },
};
</script>

<style scoped>
  .forgot {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
  }

  .signin__forgotten-password-submit-button {
    width: 100%;
  }

  .signin__reset-text-input {
    display: block;
  }

  .signin__forgot-password-success {
    color: green;
  }

  .signin__forgot-password-error {
    color: red
  }

  @media all and (min-width: 850px) {
    .forgot {
      grid-template-columns: 1fr;
      max-width: 80%;
    }

    .signin__forgotten-password-submit-button {
      width: 30%;
    }

    .signin__reset-text-input {
      /*width: 70%;*/
    }
  }
</style>
