<template>
  <div class="pt-3 w-75 mt-5 pb-5 border centerbox">
    <div class="head-area">
    <h2>{{ $t('sign-in.forgot-password-heading') }}</h2>
    </div>
    <p v-if="passwordReset !== true">{{ $t('sign-in.email-reset-description') }}</p>
    <div v-if="!passwordReset">
      <ValidationObserver ref="form" v-slot="{ passes, invalid }">
        <form @submit.prevent="passes(signIn)">
        <fieldset :disabled='wholeDisable'>
          <div v-if="passwordReset === false">
            <p class="text-danger">{{ $t('sign-in.forget-error') }}</p>
          </div>
          <div class="field-area">
          <TextInput
            v-model="email"
            class="title"
            type="email"
            identifier="resetEmail"
            :label="$t('profile.email')"
            :placeholder="$t('sign-in.forgot-email-placeholder')"/>
          </div>

              <Button
                class="mt-1"
                :waiting="sending"
                :value="$t('sign-in.reset-password-button')"
                @clicked="forgotPassword"/>

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
// import {} from 'bootstrap-vue';
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
<style scoped>
.centerbox{
  max-width:500px;
  margin: 0 auto 20px;
  box-shadow: var(--big-shadow);
  padding: 25px 20px;
  border-radius: 4px 4px 0 0;
}

.head-area{ padding-bottom:10px; margin-bottom:10px;border-bottom: 1px solid #ddd; display: flex;     justify-content: space-between;     align-items: center;}
.centerbox button{

  padding: 10px;
  border: 0;
  width: 100px;
  font-size: 14px;
  width: 100%;
}
.head-area h2{
  font-size: 20px;
  margin-bottom: 0;
  padding-bottom: 0px;
}

.field-area{
  margin-bottom: 10px;
}
.field-area .title{ font-size: 14px;}
.field-area .w-50{ width: 100%!important;}

.field-area .w-50 input{ width: 100%; font-size: 14px;}

.align-center{ display: flex; height: 100%; width: 100%; align-items: center; justify-content: center;}
</style>
