<template>
  <div>
      <Modal :show="forottenPassword">
          <h1>{{ $t('sign-in.forgot-password-heading') }}</h1>

          <div v-if="!passwordReset">
            <p>{{ $t('sign-in.email-reset-description') }}</p>
            <div v-if="passwordReset === false">
              <p class="signin__forgot-password-error">{{ $t('sign-in.reset-error') }}</p>
            </div>

            <TextInput
              @input="forgotPasswordEmailInput"
              type="email"
              identifier="resetEmail"
              :placeholder="$t('sign-in.email-placeholder')"
              class="signin__reset-text-input"/>

            <Button
              :value="$t('sign-in.reset-password-button')"
              class="signin__forgotten-password-submit-button"
              @clicked="forgotPassword" />
          </div>

          <div v-if="passwordReset === true">
            <p class="signin__forgot-password-success">{{ $t('sign-in.reset-success') }}</p>
          </div>

          <Button
            :value="$t('sign-in.modal-close-button')"
            class="signin__forgotten-password-close-button"
            @clicked="closeForgottenPassword"/>
      </Modal>

    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <form @submit.prevent="passes(signIn)">
          <div class="signin">
              <div class="signin__wrapper">
                <div>
                    <h1>{{ $t('sign-in.sign-in-heading') }}</h1>
                </div>
                <div>
                    <h1>{{ $t('sign-in.sign-up-create-account-heading') }}</h1>
                </div>
                <div>
                    <p v-if="loginError" class="signin__login-error">{{ $t('sign-in.reset-success') }}auth-error</p>

                    <TextInput
                      @input="emailInput"
                      rules="required|email"
                      :placeholder="$t('sign-in.email-placeholder')"
                      class="signin__text-input"
                      name="email"
                      type="email"
                      />

                    <TextInput
                      @input="passwordInput"
                      rules="required"
                      :placeholder="$t('sign-in.password-placeholder')"
                      class="signin__text-input"
                      name="password"
                      type="password"
                      />

                    <div class="signin__forgot-password" v-on:click="openForgottenPassword">{{ $t('sign-in.forgot-password-link')}}</div>

                    <Button
                      :disabled="invalid"
                      class="signin__sign-in-button"
                      :value="$t('sign-in.sign-in-button')"
                      @clicked="signIn"/>
                </div>
                <div>
                    {{ $t('sign-in.sign-up-create-account-message') }}

                    <Button
                      :value="$t('sign-in.sign-up-button')"
                      id="signin__sign-up-button"
                      @clicked="redirectToSignUp" />
                  <!--
                                      <div class="signin__or">{{ $t('sign-in.or') }}</div>
                                      <p>Facebook login button will go here</p>
                                      <p>Google login button will go here</p>
                  -->
                </div>
              </div>
          </div>
      </form>
    </ValidationObserver>
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
import Modal from '@/components/molecules/Modal.vue';
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
  name: 'signin',
  components: {
    ValidationObserver,
    Button,
    TextInput,
    Modal,
  },
  data: () => ({
    page: 0,
    forottenPassword: false,
    loginError: false,
    email: null,
    password: null,
    signingIn: false,
    forgotPasswordEmail: null,
    passwordReset: null,
  }),
  methods: {
    openForgottenPassword() {
      this.forottenPassword = true;
    },
    closeForgottenPassword() {
      this.forottenPassword = false;
      this.passwordReset = null;
    },
    redirectToSignUp() {
      this.$router.push({ name: 'sign-up' });
    },
    forgotPasswordEmailInput(data) {
      this.forgotPasswordEmail = data;
    },
    passwordInput(data) {
      this.password = data;
    },
    emailInput(data) {
      this.email = data;
    },
    signInFailed() {
      this.email = '';
      this.password = '';
      this.loginError = true;
      this.signingIn = false;
    },
    async forgotPassword() {
      try {
        const response = await this.$store.dispatch('FORGOT_PASSWORD', {
          email: this.forgotPasswordEmail,
        });

        if (response.status === 200) {
          this.passwordReset = true;
        } else {
          this.passwordReset = false;
          this.forgotPasswordEmail = '';
        }
      } catch (e) {
        this.passwordReset = false;
        this.forgotPasswordEmail = '';
      }
    },
    async signIn() {
      this.signingIn = true;

      try {
        const response = await this.$store.dispatch('SIGN_USER_IN', {
          email: this.email,
          password: this.password,
        });

        if (response.status === 200) {
          localStorage.setItem('jwt', response.data.token);
          await this.$router.push('/');
        } else {
          this.signInFailed();
        }
      } catch (e) {
        this.signInFailed();
      }
    },
  },
};
</script>

<style scoped>
.signin {
    background: #f6f6f6;
    padding: 30px 0 30px 0;
}

.signin__or {
    text-align: center;
    padding-top: 20px;
    font-weight: bolder;
}

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

.signin__login-error {
    text-align: center;
    color: #d13131;
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

#signin__sign-up-button {
    background: #9b9b9b;
    box-shadow: 0 4px #868686;
    color: #FFF;
    font-size: 14px;
    width: 100%;
    margin-top: 20px;
}

.signin__facebook-button {
    background: #9b9b9b;
    box-shadow: 0 4px #868686;
    color: #FFF;
    font-size: 14px;
    width: 100%;
}

.signin__forgot-password {
    margin-bottom: 10px;
}

.signin__forgot-password:hover {
    text-decoration: underline;
    cursor: pointer;
}

.signin__forgotten-password-close-button {
    width: 100%;
    margin-top: 20px;
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
    .signin__wrapper {
        grid-template-columns: 0.4fr 0.4fr;
        align-items: end;
    }
}
</style>
