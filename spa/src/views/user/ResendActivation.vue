<template>
  <div class="mt-5 border centerbox">
    <div class="head-area">
      <h2>{{ $t('sign-up.resend-heading') }}</h2>
      <p>{{ $t('sign-up.resend-description') }}</p>
    </div>

    <div v-if="!finished">
      <ValidationObserver ref="form" v-slot="{ passes }">
        <form @submit.prevent="passes(sendActivationEmail)">
          <fieldset :disabled='disableForm'>
            <div v-if="error" class="text-danger">
              <strong>
                {{ error }}
              </strong>
            </div>

            <div class="field-area">
              <TextInput
                v-model="email"
                rules="required|email"
                name="email"
                type="email"
                :label="$t('profile.email')"
                :placeholder="$t('generic.email-placeholder')"/>
            </div>

            <Button
              class="reset-btn"
              :waiting="sending"
              :value="$t('sign-up.resend-button')"
              @clicked="sendActivationEmail"/>

          </fieldset>
        </form>
      </ValidationObserver>
    </div>

    <div v-if="finished === true">
      <p class="text-success">{{ $t('sign-up.resend-success') }}</p>
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
  name: 'ResendActivation',
  components: {
    Button,
    TextInput,
  },
  data: () => ({
    email: null,
    finished: null,
    error: null,
    sending: false,
    disableForm: false,
  }),
  methods: {
    async sendActivationEmail() {
      this.finished = null;
      try {
        this.sending = true;
        this.disableForm = true;
        const response = await this.$store.dispatch('RESEND_ACTIVATION', {
          email: this.email,
        });

        this.finished = response.status === 200;
      } catch (error) {
        this.$log.error(error);
        this.disableForm = false;
        this.finished = false;

        if (error.response && error.response.data && error.response.data.errors) {
          const key = error.response.data.errors[0].messageKey;
          this.error = this.$t(key);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      } finally {
        this.sending = false;
      }
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

.centerbox button {
  padding: 10px;
  border: 0;
  font-size: 14px;
  width: 100%;
}

.field-area {
  margin-bottom: 10px;
}

.field-area .title {
  font-size: 14px;
}

.field-area .w-50 {
  width: 100% !important;
}

.field-area .w-50 input {
  width: 100%;
  font-size: 14px;
}

.align-center {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.reset-btn {
  display: flex;
  max-width: 220px;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin: 20px auto 0;
}

@media (max-width: 700px) {
  .centerbox, .hero-head {
    margin-right: 35px;
    margin-left: 35px;
    padding: 25px 20px;
  }
}
</style>
