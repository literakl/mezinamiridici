<template>
  <div class="signin__wrapper">

    <div class="sign-up__heading">
      <h1>{{ $t('sign-in.reset-password-heading') }}</h1>
      <p>{{ $t('sign-in.reset-password-description') }}</p>
    </div>

    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <form @submit.prevent="passes(resetPassword)">
        <TextInput
          v-model="email"
          :label="$t('profile.email')"
          name="email"
          type="email"/>

        <TextInput
          v-model="newPassword"
          rules="required|min:6"
          :label="$t('sign-in.new-password')"
          class="signin__text-input"
          name="new-password"
          type="password"
        />

        <div v-if="error">
          <strong class="sign-up-form__errors-heading">
            {{ error }}
          </strong>
        </div>

        <Button
          :disabled="invalid"
          class="signin__sign-in-button"
          :value="$t('sign-in.change-password-button')"
          @clicked="resetPassword"/>
      </form>
    </ValidationObserver>
  </div>
</template>

<script>
import { extend, ValidationObserver, configure } from 'vee-validate';
import { required, min } from 'vee-validate/dist/rules';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import i18n from '../i18n';

extend('required', required);
extend('min', min);
configure({
  defaultMessage: (field, values) => {
    /* eslint no-underscore-dangle: 0 */
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`sign-in.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

export default {
  name: 'reset',
  components: {
    ValidationObserver,
    Button,
    TextInput,
  },
  data: () => ({
    email: null,
    newPassword: null,
    error: null,
  }),
  props: {
    resetPasswordToken: String,
  },
  methods: {
    async resetPassword() {
      try {
        await this.$store.dispatch('RESET_PASSWORD', {
          resetPasswordToken: this.resetPasswordToken,
          password: this.newPassword,
        });

        await this.$router.push({
          name: 'sign-in',
          params: {
            message: this.$t('sign-in.reset-success'),
          },
        });
      } catch (error) {
        console.log(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('sign-in.auth-error');
        }
      }
    },
  },
};
</script>

<style scoped>
  input {
    width: 100%;
    padding: 0;
  }

  h1 {
    padding: 0 0 20px 0;
    margin: 0;
  }

  h2 {
    padding: 0 0 20px 0;
    margin: 0;
    font-size: 14px;
    font-weight: normal;
    text-align: center;
  }

  .sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
    font-size: 150%;
    clear: both;
  }

  .signin__text-input {
    width: 100%;
  }

  .signin__wrapper {
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-column-gap: 50px;
  }

  .signin__sign-in-button {
    width: 100%;
  }

  @media all and (min-width: 850px) {
    .signin__wrapper {
      grid-template-columns: 1fr;
      align-items: end;
    }
  }
</style>
