<template>
  <div class="pt-3 mt-5 border centerbox">
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
      <b-form @submit.prevent="passes(resetPassword)">
        <div class="field-area">
          <TextInput
            v-model="email"
            :label="$t('profile.email')"
            name="email"
            type="email"/>
        </div>
        <div class="field-area">
        <TextInput
          v-model="newPassword"
          rules="required|min:6"
          :label="$t('sign-in.new-password')"
          name="new-password"
          type="password"
        />
        </div>
        <div v-if="error" class="errormsg">
          <strong class="text-danger">
            {{ error }}
          </strong>
        </div>
             <div class="m-auto">
            <Button
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
        this.$log.error(error);
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
.centerbox{
  max-width:500px;
  margin: 0 auto 20px;
  box-shadow: var(--big-shadow);
  padding: 25px 20px;
  border-radius: 4px 4px 0 0;
}
.head-area{ padding-bottom:10px; margin-bottom:10px;border-bottom: 1px solid #ddd; display: flex;     justify-content: space-between;     align-items: center;}
.head-area h2{
    font-size: 20px;
    margin-bottom: 0;
    padding-bottom: 0px;
}
.field-area{
  margin-bottom: 10px;
}
.field-area label span{
  font-size: 14px;
}
.field-area input, .field-area select{
  width: 98%!important;
}
.centerbox .w-50{
  width: 100%!important;
}
.green{
    background: var(--color-green);
    border: 0;
    color: #fff;
    font-weight: 400;
    font-size: 14px;
}
.errormsg{
  font-size: 14px;
}
</style>
