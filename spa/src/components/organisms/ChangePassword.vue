<template>
  <div>
    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <b-form @submit.prevent="passes(changePassword)">
        <h3>{{ $t('sign-in.change-password-heading') }}</h3>

        <div>
          <TextInput
            v-model="email"
            rules="email"
            :label="$t('profile.email')"
            name="email"
            type="email"/>

          <TextInput
            v-model="currentPassword"
            rules="required"
            :label="$t('sign-in.current-password')"
            name="current-password"
            type="password"
          />

          <TextInput
            v-model="newPassword"
            rules="required|min:6"
            :label="$t('sign-in.new-password')"
            name="new-password"
            type="password"
          />

          <div v-if="error">
            <strong class="text-error">
              {{ error }}
            </strong>
          </div>
          <div class="col-sm-12 col-md-4">
            <Button
              class="w-100"
              :disabled="invalid"
              :value="$t('sign-in.change-password-button')"
              @clicked="changePassword"/>
          </div>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import { BForm } from 'bootstrap-vue';
import i18n from '../../i18n';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`sign-in.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

export default {
  name: 'signin',
  components: {
    Button,
    TextInput,
    BForm,
  },
  data: () => ({
    email: null,
    currentPassword: null,
    newPassword: null,
    error: null,
  }),
  methods: {
    async changePassword() {
      try {
        await this.$store.dispatch('CHANGE_PASSWORD', {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
        });

        await this.$router.push({
          name: 'sign-in',
          params: {
            message: this.$t('sign-in.change-success'),
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
