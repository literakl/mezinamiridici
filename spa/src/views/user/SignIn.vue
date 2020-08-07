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
              class="w-75 btn btn-block "
              :value="$t('sign-in.sign-up-button')"
              id="signin__sign-up-button"
              @clicked="redirectToSignUp"/>


            <b-button
              class="w-75 btn btn-block btn-facebook"
              href="http://127.0.0.1:3000/v1/auth/facebook">
              {{$t('sign-in.sign-in-facebook')}}
            </b-button>

            <b-button
              class="w-75 btn btn-block btn-twitter"
              href="http://127.0.0.1:3000/v1/auth/twitter">
              {{$t('sign-in.sign-in-twitter')}}
            </b-button>

            <b-button
              class="w-75 btn btn-block btn-google-plus"
              href="http://127.0.0.1:3000/v1/auth/google">
              {{$t('sign-in.sign-in-google')}}
            </b-button>
<!--
            <Button
            class="w-75 btn btn-block btn-facebook"
            :value="$t('sign-in.sign-in-facebook')"
            @clicked="auth('facebook')"/>
            <Button
            class="w-75 btn btn-block btn-twitter"
            :value="$t('sign-in.sign-in-twitter')"
            @clicked="auth('twitter')"/>
            <Button
            class="w-75 btn btn-block btn-google-plus"
            :value="$t('sign-in.sign-in-google')"
            @clicked="auth('google')"/> -->
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
        this.$log.error(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('sign-in.auth-error');
        }
        this.signingIn = false;
      }
    },
    async auth(provider) {
      await this.$store.dispatch('SIGN_SOCIAL_USER', `${provider}`);
      // if (this.$auth.isAuthenticated()) {
      //   this.$auth.logout();
      // }
      // this.response = null;
      // this.token = await this.$auth.authenticate(provider);
      // // TODO is the active flag really neccessary?
      // if (!this.token.data.active) {
      //   this.$store.dispatch('SET_SOCIAL', this.token.data);
      //   this.$log.debug('[test endpoint]');
      //   this.$router.push('/confirm');
      // } else {
      //   this.$router.push('/');
      //   this.$store.dispatch('SET_SOCIAL', this.token.data);
      // }
    },
  },
};
</script>
<style>
.btn {
  font-weight: bold;
  border-radius: 2px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, .26);
}
.btn-facebook {
  color: #fff;
  background-color: #3b5998;
  border: 1px solid #335190;
}
.btn-facebook:hover,
.btn-facebook:focus {
  color: #fff;
  background-color: #294786;
}

.btn-twitter {
  color: #fff;
  background-color: #00aced;
  border: 1px solid #009fdb;
}
.btn-twitter:hover,
.btn-twitter:focus {
  color: #fff;
  background-color: #0090c7;
}

.btn-google-plus {
  color: #fff;
  background-color: #dd4b39;
  border: 1px solid #d54331;
}
.btn-google-plus:hover,
.btn-google-plus:focus {
  color: #fff;
  background-color: #cb3927;
}

</style>
