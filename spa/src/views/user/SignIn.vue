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
