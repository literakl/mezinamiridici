<template>
  <b-container fluid="true" class="pt-3 w-75 m-auto">
    <b-row>
      <b-col>
        <h1>{{ $t('sign-in.reset-password-heading') }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p>{{ $t('sign-in.reset-password-description') }}</p>
      </b-col>
    </b-row>

    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <b-form @submit.prevent="passes(resetPassword)">
        <TextInput
          v-model="email"
          :label="$t('profile.email')"
          name="email"
          type="email"/>

        <TextInput
          v-model="newPassword"
          rules="required|min:6"
          :label="$t('sign-in.new-password')"
          name="new-password"
          type="password"
        />

        <div v-if="error">
          <strong class="text-danger">
            {{ error }}
          </strong>
        </div>
        <b-row>
          <b-col md="4" sm="12">
            <Button
              class="w-100"
              :disabled="invalid"
              :value="$t('sign-in.change-password-button')"
              @clicked="resetPassword"/>
          </b-col>
        </b-row>
      </b-form>
    </ValidationObserver>
  </b-container>
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
        // eslint-disable-next-line no-console
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
