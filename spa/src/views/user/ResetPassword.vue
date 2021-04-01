<template>
  <div class="mt-5 border centerbox">
    <b-row>
      <b-col>
        <div class="head-area">
          <h2>{{ $t('sign-in.reset-password-heading') }}</h2>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p>{{ $t('sign-in.reset-password-description') }}</p>
      </b-col>
    </b-row>

    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <b-form @submit.prevent="passes(resetPassword)" action="placeholder">
        <input type="email" id="email" name="email" v-model="email" v-show="false">
        <div class="field-area">
          <TextInput
            v-model="newPassword"
            rules="required|min:6"
            :label="$t('sign-in.new-password')"
            name="new-password"
            type="password"/>
        </div>
        <div class="field-area">
          <TextInput
            v-model="confirmPassword"
            :rules="{ required: true, is: newPassword }"
            :label="$t('sign-in.confirm-password')"
            name="confirm-password"
            type="password"
            @keyup.enter="resetPassword"
          />
        </div>

        <div v-if="error" class="errormsg">
          <strong class="text-danger">
            {{ error }}
          </strong>
        </div>
        <div class="m-auto">
          <Button
            type="submit"
            class="w-100 green"
            :disabled="invalid"
            :value="$t('sign-in.change-password-button')"
            @clicked="resetPassword"/>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import { BForm, BRow, BCol } from 'bootstrap-vue';
import i18n from '../../i18n';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`sign-in.${field}`);
    if (values._rule_ === 'is') {
      return i18n.t('sign-in.password-mismatch');
    }
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

export default {
  name: 'reset',
  components: {
    Button,
    TextInput,
    BForm,
    BRow,
    BCol,
  },
  data: () => ({
    email: null,
    newPassword: null,
    confirmPassword: null,
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
        }).then((response) => {
          this.email = response.data.data.email;
          if (window.PasswordCredential) {
            // eslint-disable-next-line no-undef
            const passwordCredential = new PasswordCredential({ id: response.data.data.email, password: this.newPassword });
            navigator.credentials.store(passwordCredential);
          }
        });

        await this.$router.push({
          name: 'sign-in',
          params: {
            message: this.$t('sign-in.reset-success'),
          },
        });
      } catch (error) {
        this.$log.error(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('sign-in.auth-error');
        }
      }
      return false;
    },
  },
};
</script>

<style scoped>
.centerbox {
  max-width: 700px;
  margin: 0 auto 20px;
  padding: 25px 35px;
  border-radius: 4px;
}

.head-area {
  padding-bottom: 0;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.head-area h2 {
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  width: 100%;
  padding: 0 0 15px 0;
}

.field-area {
  margin-bottom: 10px;
}

.field-area label span {
  font-size: 14px;
}

.field-area input, .field-area select {
  width: 98% !important;
}

.centerbox .w-50 {
  width: 100% !important;
}

.green {
  background: var(--color-green);
  border: 0;
  color: #fff;
  font-weight: 400;
  font-size: 14px;
}

.errormsg {
  font-size: 14px;
}

@media (max-width: 700px) {
  .centerbox, .hero-head {
    margin-right: 35px;
    margin-left: 35px;
    padding: 25px 20px;
  }
}
</style>
