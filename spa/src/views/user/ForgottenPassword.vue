<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <h1>{{ $t('sign-in.forgot-password-heading') }}</h1>

    <p v-if="passwordReset !== true">{{ $t('sign-in.email-reset-description') }}</p>

    <div v-if="!passwordReset">
      <ValidationObserver ref="form" v-slot="{ passes, invalid }">
        <form @submit.prevent="passes(signIn)">
        <fieldset :disabled='wholeDisable'>
          <div v-if="passwordReset === false">
            <p class="text-danger">{{ $t('sign-in.forget-error') }}</p>
          </div>

          <TextInput
            v-model="email"
            type="email"
            identifier="resetEmail"
            :label="$t('profile.email')"
            :placeholder="$t('sign-in.forgot-email-placeholder')"/>
          <b-row>
            <b-col md="4" sm="12">
              <Button
                class="w-100"
                :waiting="sending"
                :value="$t('sign-in.reset-password-button')"
                @clicked="forgotPassword"/>
            </b-col>
          </b-row>
        </fieldset>
        </form>
      </ValidationObserver>
    </div>

    <div v-if="passwordReset === true">
      <p class="text-success">{{ $t('sign-in.forget-success') }}</p>
    </div>
  </div>
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
  name: 'ForgottenPassword',
  components: {
    Button,
    TextInput,
  },
  data: () => ({
    email: null,
    passwordReset: null,
    error: null,
    sending: false,
    wholeDisable: false,
  }),
  methods: {
    async forgotPassword() {
      this.passwordReset = null;
      try {
        this.sending = true;
        this.wholeDisable = true;
        const response = await this.$store.dispatch('FORGOT_PASSWORD', {
          email: this.email,
        });

        this.passwordReset = response.status === 200;
      } catch (e) {
        this.$log.error(e);
        this.sending = false;
        this.wholeDisable = false;
        this.passwordReset = false;
      }
    },
  },
};
</script>
