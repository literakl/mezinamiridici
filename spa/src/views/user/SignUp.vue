<template>
  <div class="mt-5 border centerbox">
    <div class="head-area">
      <h2>{{ $t('sign-up.heading') }}</h2>
      <p v-if="! succeeded">{{ $t('sign-up.body') }}</p>
    </div>
    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <b-form @submit.prevent="passes(submitForm)" v-if="! succeeded">
        <fieldset :disabled='wholeDisable'>
          <div class="field-area">
        <TextInput
          v-model="email"
          rules="required|email|conflict:email"
          :label="$t('profile.email')"
          :placeholder="$t('sign-up.email-hint')"
          name="email"
          :disabled="socialId !== undefined"
          type="email"/>
        </div>
        <div class="field-area">
        <TextInput
          v-if="! socialId"
          v-model="password"
          rules="required|min:6"
          :label="$t('profile.password')"
          :placeholder="$t('sign-up.password-hint')"
          name="password"
          type="password"/>
        </div>
        <div class="field-area">
        <TextInput
          v-model="nickname"
          rules="required|min:3|conflict:nick"
          :label="$t('profile.nickname')"
          :placeholder="$t('sign-up.nickname-hint')"
          name="nickname"/>
       </div>
        <div class="field-area">
        <Checkbox
          v-model="personalData"
          :label="$t('sign-up.personal-data')"
          name="personal-data"
          identifier="personalData"/>
        </div>
        <div class="prof-form-wrap">
          <ProfileForm :formData="profileForm" @update="updateProfileForm" v-if="personalData"/>
        </div>
        <div class="field-area">
        <h5>{{ $t('sign-up.consents') }}</h5>
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
        </div>
        <div v-if="error" class="text-danger">
          <strong>
            {{ error }}
          </strong>
        </div>
        <div class="col-sm-12 col-md-4 m-auto">
          <Button
            class="w-100 green"
            :waiting="sending"
            :disabled="invalid"
            :value="$t('sign-up.finished-button-label')"
            @clicked="submitForm()"
          />
        </div>
        </fieldset>
      </b-form>
    </ValidationObserver>
    <div class="success-msg" v-if="success === true">
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
    presetEmail: String,
    presetPassword: String,
    presetNickname: String,
    socialId: String,
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
  }),
  computed: {
    succeeded() {
      return !(this.success === false || this.success === null);
    },
  },
  mounted() {
    if (this.presetEmail) this.email = this.presetEmail;
    if (this.presetPassword) this.password = this.presetPassword;
    if (this.presetNickname) this.nickname = this.presetNickname;
  },
  methods: {
    async submitForm() {
      this.error = '';
      let response;
      try {
        this.sending = true;
        this.wholeDisable = true;
        const payload = {
          email: this.email,
          nickname: this.nickname,
          termsAndConditions: this.termsAndConditions,
          dataProcessing: this.personalDataProcessing,
          emails: this.emailNotifications,
        };
        if (this.password) {
          payload.password = this.password;
        }
        if (this.socialId) {
          payload.socialId = this.socialId;
        }
        response = await this.$store.dispatch('CREATE_USER_PROFILE', payload);
        this.sending = false;
        this.wholeDisable = false;

        const { data } = response;
        const token = data.data;
        if (token === undefined) {
          this.error = this.$t('sign-up.something-went-wrong');
          return false;
        }

        if (this.socialId) {
          await this.$store.dispatch('AFTER_USER_IN', { jwt: token });
        }

        if (!this.personalData) {
          if (this.socialId) {
            await this.$router.push('/');
          } else {
            this.success = true;
          }
          return true;
        }

        const jwtData = jwtDecode(token);
        const vehicles = [];
        setVehicles.call(this, vehicles);
        await this.$store.dispatch('UPDATE_USER_PROFILE', {
          jwt: token,
          userId: jwtData.userId,
          drivingSince: (this.profileForm.drivingSince) ? new Date(this.profileForm.drivingSince).getFullYear() : null,
          vehicles,
          sex: this.profileForm.sex,
          born: (this.profileForm.bornInYear) ? new Date(this.profileForm.bornInYear).getFullYear() : null,
          region: this.profileForm.region,
          education: this.profileForm.education,
          publicProfile: this.profileForm.share,
          urls: this.profileForm.urls,
        });

        if (this.socialId) {
          await this.$router.push('/');
        }

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
<style scoped>
.centerbox{
  max-width:700px;
  margin: 0 auto 20px;
  padding: 25px 35px;
  border-radius: 4px;
}
.head-area{
  padding-bottom:0px;
  margin-bottom:10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  }
.head-area h2 {
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  width:100%;
  padding: 0 0 15px 0;
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
.success-msg{
  font-size: 15px;
}
.prof-form-wrap .centerbox{
  box-shadow: none;
  padding: 0;
}
@media (max-width: 700px) {
  .centerbox, .hero-head{
    margin-right:35px;
    margin-left:35px;
    padding:25px 20px;
  }
  .prof-form-wrap .centerbox{
    margin: 0;
  }
}


</style>
