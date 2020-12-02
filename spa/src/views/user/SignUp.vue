<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <h1>{{ $t('sign-up.heading') }}</h1>

    <p>{{ $t('sign-up.body') }}</p>

    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <b-form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
        <fieldset :disabled='wholeDisable'>
        <TextInput
          v-model="email"
          rules="required|email|conflict:email"
          :label="$t('profile.email')"
          :placeholder="$t('sign-up.email-hint')"
          name="email"
          :disabled="emailBoxDisabled"
          type="email"/>

        <TextInput
          v-model="password"
          rules="required|min:6"
          :label="$t('profile.password')"
          :placeholder="$t('sign-up.password-hint')"
          name="password"
          type="password"/>

        <TextInput
          v-model="nickname"
          rules="required|min:3|conflict:nick"
          :label="$t('profile.nickname')"
          :placeholder="$t('sign-up.nickname-hint')"
          name="nickname"/>

        <Checkbox
          v-model="personalData"
          :label="$t('sign-up.personal-data')"
          name="personal-data"
          identifier="personalData"/>

        <ProfileForm :formData="profileForm" @update="updateProfileForm" v-if="personalData"/>

        <h2>{{ $t('sign-up.consents') }}</h2>

        <div>
          <Checkbox
            v-model="termsAndConditions"
            :rules="{ required: { allowFalse: false} }"
            :label="$t('profile.terms')"
            name="terms"
            identifier="termsAndConditions"/>
        </div>

        <div>
          <Checkbox
            v-model="personalDataProcessing"
            :rules="{ required: { allowFalse: false} }"
            :label="$t('profile.processing')"
            name="processing"
            identifier="personalDataProcessing"/>
        </div>

        <div>
          <Checkbox
            v-model="emailNotifications"
            :label="$t('sign-up.notifications-label')"
            name="email-notifications"
            identifier="emailNotifications"/>
        </div>

        <div v-if="error" class="text-danger">
          <strong>
            {{ error }}
          </strong>
        </div>

        <div class="col-sm-12 col-md-4">
          <Button
            class="w-100"
            :waiting="sending"
            :disabled="invalid"
            :value="$t('sign-up.finished-button-label')"
            @clicked="submitForm()"
          />
        </div>
        </fieldset>
      </b-form>
    </ValidationObserver>

    <div v-if="success === true">
      {{ $t('sign-up.success-message') }}
    </div>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode';
import { configure, extend } from 'vee-validate';
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import ProfileForm from '@/components/molecules/ProfileForm.vue';
import i18n from '@/i18n';
import { BForm } from 'bootstrap-vue';
import Vue from 'vue';
import store from '../../store';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

extend('conflict', {
  validate: (value, type) => checkConflict(value, type[0]),
  message: (field) => {
    let msg = i18n.t('sign-up.verify-email');
    if (field === 'nickname') {
      msg = i18n.t('sign-up.verify-nickname');
    }
    return msg;
  },
});

async function checkConflict(value, type) {
  try {
    let result = {};
    if (type === 'email') {
      result = await store.dispatch('VERIFY_MAIL', { email: value });
    } else if (type === 'nick') {
      result = await store.dispatch('VERIFY_NICKNAME', { nickname: value });
    }
    return !result.data.data.conflict;
  } catch (error) {
    Vue.$log.error(error);
    return false;
  }
}

function setVehicles(vehicles) {
  if (this.profileForm.bike) vehicles.push('bike');
  if (this.profileForm.car) vehicles.push('car');
  if (this.profileForm.bus) vehicles.push('bus');
  if (this.profileForm.van) vehicles.push('van');
  if (this.profileForm.truck) vehicles.push('truck');
  if (this.profileForm.tramway) vehicles.push('tramway');
}

function convertErrors(jsonErrors) {
  const veeErrors = {};
  jsonErrors.errors.forEach((error) => {
    if (error.field) {
      veeErrors[error.field] = [];
      veeErrors[error.field].push(this.$t(error.messageKey));
    } else {
      this.error = this.$t(error.messageKey);
    }
  });
  return veeErrors;
}

export default {
  name: 'SignUp',
  components: {
    Checkbox,
    TextInput,
    Button,
    BForm,
    ProfileForm,
  },
  props: {
    token: String,
    presetEmail: String,
    presetPassword: String,
  },
  data: () => ({
    email: null,
    password: null,
    termsAndConditions: false,
    personalDataProcessing: false,
    emailNotifications: false,
    nickname: null,
    personalData: false,
    profileForm: {
      drivingSince: null,
      bike: false,
      car: false,
      bus: false,
      van: false,
      truck: false,
      tramway: false,
      sex: null,
      bornInYear: null,
      region: '',
      education: '',
      share: 'public',
      urls: ['', '', ''],
    },
    error: null,
    success: null,
    sending: false,
    wholeDisable: false,
    emailBoxDisabled: false,
    tokenUser: null,
  }),
  mounted() {
    if (this.presetEmail) this.email = this.presetEmail;
    if (this.presetPassword) this.password = this.presetPassword;

    if (this.token) {
      this.tokenUser = this.$store.dispatch('SIGN_SOCIAL_USER', `${this.token}`);
      if (this.tokenUser === true) {
        this.$router.push('/');
      }
      this.email = this.tokenUser.email;
      this.nickname = this.tokenUser.nickname;
      this.emailBoxDisabled = true;
    }
  },
  methods: {
    async submitForm() {
      this.error = '';
      let response;
      try {
        this.sending = true;
        this.wholeDisable = true;
        if (this.tokenUser) {
          response = await this.$store.dispatch('UPDATE_SOCIAL_USER', {
            jwt: this.token,
            userId: this.tokenUser.userId,
            email: this.email,
            nickname: this.nickname,
            password: this.password,
            termsAndConditions: this.termsAndConditions,
            dataProcessing: this.personalDataProcessing,
            emails: this.emailNotifications,
          });
          if (response) {
            this.$router.push('/');
          }
        } else {
          response = await this.$store.dispatch('CREATE_USER_PROFILE', {
            email: this.email,
            password: this.password,
            nickname: this.nickname,
            termsAndConditions: this.termsAndConditions,
            dataProcessing: this.personalDataProcessing,
            emails: this.emailNotifications,
          });
        }
        this.sending = false;
        this.wholeDisable = false;

        const { data } = response;

        if (!this.personalData) {
          this.success = true;
          return true;
        }

        const token = data.data;
        if (token === undefined) {
          this.error = this.$t('sign-up.something-went-wrong');
          return false;
        }

        const jwtData = jwtDecode(token);
        const vehicles = [];
        setVehicles.call(this, vehicles);
        await this.$store.dispatch('UPDATE_USER_PROFILE', {
          jwt: token,
          userId: jwtData.userId,
          drivingSince: (this.profileForm.drivingSince) ? new Date(this.profileForm.drivingSince).getFullYear() : null,
          vehicle: vehicles,
          sex: this.profileForm.sex,
          bornInYear: (this.profileForm.bornInYear) ? new Date(this.profileForm.bornInYear).getFullYear() : null,
          region: this.profileForm.region,
          education: this.profileForm.education,
          publicProfile: this.profileForm.share,
          urls: this.profileForm.urls,
        });
        this.success = true;
      } catch (error) {
        this.$log.error(error);
        this.sending = false;
        this.wholeDisable = false;
        this.success = false;
        if (error.response) {
          const veeErrors = convertErrors.call(this, error.response.data);
          this.$refs.form.setErrors(veeErrors);
        } else {
          this.error = this.$t('sign-up.something-went-wrong');
        }
      }
      return this.success;
    },
    updateProfileForm(obj) {
      // eslint-disable-next-line
      for (const property in this.profileForm) {
      // eslint-disable-next-line
        if (obj.hasOwnProperty(property)) {
          this.profileForm[property] = obj[property];
        }
      }
    },
  },
};
</script>
