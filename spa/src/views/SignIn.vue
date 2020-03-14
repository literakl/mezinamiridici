<template>
  <div>
    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <form @submit.prevent="passes(signIn)">
          <div class="signin">
              <div class="signin__wrapper">
                <div>
                  <h1>{{ $t('sign-in.sign-in-heading') }}</h1>
                  <div>{{ message }}</div>
                </div>
                <div>
                    <h1>{{ $t('sign-in.sign-up-create-account-heading') }}</h1>
                </div>
                <div>
                    <TextInput
                      v-model="email"
                      rules="required|email"
                      :placeholder="$t('sign-in.email-placeholder')"
                      class="signin__text-input"
                      name="email"
                      type="email"
                      />

                    <TextInput
                      v-model="password"
                      rules="required"
                      :placeholder="$t('sign-in.password-placeholder')"
                      class="signin__text-input"
                      name="password"
                      type="password"
                      />

                    <div class="signin__forgot-password">
                      <router-link :to="{ name: 'forgotten' }">{{ $t('sign-in.forgot-password-link')}}</router-link>
                    </div>

                    <div v-if="error">
                      <strong class="sign-up-form__errors-heading">
                        {{ error }}
                      </strong>
                    </div>

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
  },
  props: {
    message: String,
  },
  data: () => ({
    page: 0,
    email: null,
    password: null,
    signingIn: false,
    error: null,
  }),
  methods: {
    redirectToSignUp() {
      this.$router.push({ name: 'sign-up' });
    },
    async signIn() {
      this.signingIn = true;

      try {
        await this.$store.dispatch('SIGN_USER_IN', {
          email: this.email,
          password: this.password,
        });

        await this.$router.push('/');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('sign-in.auth-error');
        }
        this.signingIn = false;
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

@media all and (min-width: 850px) {
    .signin__wrapper {
        grid-template-columns: 0.4fr 0.4fr;
        align-items: end;
    }
}
</style>
