<template>
  <ValidationObserver ref="form" v-slot="{ passes, invalid }">
    <b-form @submit.prevent="passes(signIn)">
      <b-container fluid="true" class="pt-3 w-75 m-auto">
        <b-row class="w-75 m-auto pt-5">
          <b-col md="6">
            <h1>{{ $t('sign-in.sign-in-heading') }}</h1>
            <div>{{ message }}</div>
            <TextInput
              v-model="email"
              rules="required|email"
              :placeholder="$t('sign-in.email-placeholder')"
              name="email"
              type="email"
            />

            <TextInput
              v-model="password"
              rules="required"
              :placeholder="$t('sign-in.password-placeholder')"
              name="password"
              type="password"
            />

            <div>
              <router-link :to="{ name: 'forgotten' }">{{ $t('sign-in.forgot-password-link')}}
              </router-link>
            </div>

            <div v-if="error">
              <strong>
                {{ error }}
              </strong>
            </div>
          </b-col>
          <b-col md="6">
            <h1>{{ $t('sign-in.sign-up-create-account-heading') }}</h1>
            {{ $t('sign-in.sign-up-create-account-message') }}
          </b-col>
        </b-row>
        <b-row class="w-75 m-auto pb-5">
          <b-col md="6">
            <Button
              class="w-75"
              :disabled="invalid"
              :value="$t('sign-in.sign-in-button')"
              @clicked="signIn"/>
          </b-col>
          <b-col md="6">
            <Button
              class="w-75"
              :value="$t('sign-in.sign-up-button')"
              id="signin__sign-up-button"
              @clicked="redirectToSignUp"/>
          </b-col>
          <b-col md="6">
            <Button
              class="fa fa-facebook loginBtn loginBtn--facebook"
              :value="'Login with Facebook'"
              id="signin__sign-up-button"
              @clicked="auth"/>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
  </ValidationObserver>
</template>

<script>
import { configure } from 'vee-validate';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import i18n from '../../i18n';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

export default {
  name: 'signin',
  components: {
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
    token: null,
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
    async auth() {
      const provider = 'facebook';
      if (this.$auth.isAuthenticated()) {
        this.$auth.logout();
      }
      this.response = null;
      // const this_ = this;
      this.token = await this.$auth.authenticate(provider);
      // this_.isAuthenticated = this_.$auth.isAuthenticated();
      this.$store.dispatch('SET_SOCIAL', this.token.data);
      this.$router.push('/');
    },
  },

};
</script>
<style>

/* Shared */
.loginBtn {
  box-sizing: border-box;
  position: relative;
  /* width: 13em;  - apply for fixed size */
  margin: 0.2em;
  padding: 0 15px 0 46px;
  border: none;
  /* text-align: left; */
  line-height: 34px;
  white-space: nowrap;
  border-radius: 0.2em;
  font-size: 16px;
  color: #FFF;
}
.loginBtn:before {
  content: "";
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 100%;
}
.loginBtn:focus {
  outline: none;
}
.loginBtn:active {
  box-shadow: inset 0 0 0 32px rgba(0,0,0,0.1);
}


/* Facebook */
.loginBtn--facebook {
  background-color: #4C69BA;
  background-image: linear-gradient(#4C69BA, #3B55A0);
  /*font-family: "Helvetica neue", Helvetica Neue, Helvetica, Arial, sans-serif;*/
  text-shadow: 0 -1px 0 #354C8C;
}
.loginBtn--facebook:before {
  border-right: #364e92 1px solid;
  content: "\f09a";
  height: 22px;
  width: 22px;
}
.loginBtn--facebook:hover,
.loginBtn--facebook:focus {
  background-color: #5B7BD5;
  background-image: linear-gradient(#5B7BD5, #4864B1);
}

</style>
