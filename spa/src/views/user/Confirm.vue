<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <h1>{{ $t('confirm.heading') }}</h1>

    <p>{{ $t('sign-up.body') }}</p>

    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <b-form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
        <TextInput
          v-model="email"
          rules="required|email"
          :disabled=true
          :label="$t('profile.email')"
          name="email"
          type="email"
        />

        <TextInput
          v-model="nickname"
          rules="required|min:3"
          :label="$t('profile.nickname')"
          :placeholder="$t('sign-up.nickname-hint')"
          name="nickname"
        />

        <Checkbox
          v-model="personalData"
          :label="$t('sign-up.personal-data')"
          name="personal-data"
          identifier="personalData"
        />

        <ProfileForm :formData="profileForm" @update="updateProfileForm" v-if="personalData"/>

        <h2>{{ $t('sign-up.consents') }}</h2>

        <div>
          <Checkbox
            v-model="termsAndConditions"
            :rules="{ required: { allowFalse: false} }"
            :label="$t('profile.terms')"
            name="terms"
            identifier="termsAndConditions"
          />
        </div>

        <div>
          <Checkbox
            v-model="personalDataProcessing"
            :rules="{ required: { allowFalse: false} }"
            :label="$t('profile.processing')"
            name="processing"
            identifier="personalDataProcessing"
          />
        </div>

        <div>
          <Checkbox
            v-model="emailNotifications"
            :label="$t('sign-up.notifications-label')"
            name="email-notifications"
            identifier="emailNotifications"
          />
        </div>

        <div v-if="error" class="text-danger">
          <strong>{{ error }}</strong>
        </div>

        <div class="col-sm-12 col-md-4">
          <Button
            class="w-100"
            :disabled="invalid"
            :value="$t('confirm.finished-button-label')"
            @clicked="submitForm()"
          />
        </div>
      </b-form>
    </ValidationObserver>

    <div v-if="success === true">
      {{ $t('sign-up.success-message') }}
    </div>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import jwtDecode from 'jwt-decode';
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import ProfileForm from '@/components/molecules/ProfileForm.vue';
import i18n from '@/i18n';
import { BForm } from 'bootstrap-vue';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

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
  name: 'confirm',
  components: {
    Checkbox,
    TextInput,
    Button,
    BForm,
    ProfileForm,
  },
  data: () => ({
    email: null,
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
  }),
  created() {
    this.getProfile(this.$store.getters.USER_ID);
  },
  methods: {
    async getProfile(id) {
      this.$log.debug('[getProfile] ', id);
      if (this.$store.getters.USER_EMAIL !== undefined && this.$store.getters.USER_EMAIL !== null) {
        this.email = this.$store.getters.USER_EMAIL;
        this.nickname = this.$store.getters.USER_NICKNAME;
      } else {
        // when the user try to access this page intentionally
        const profile = await this.$store.dispatch('GET_USER_PROFILE_BY_ID', { id });
        this.nickname = profile.data.data.bio.nickname;
      }
    },
    async submitForm() {
      try {
        this.error = undefined;
        const { data } = await this.$store.dispatch('ACTIVATE_USER_PROFILE', {
          jwt: this.$store.getters.USER_TOKEN,
          userId: this.$store.getters.USER_ID,
          nickname: this.nickname,
          termsAndConditions: this.termsAndConditions,
          dataProcessing: this.personalDataProcessing,
          emails: this.emailNotifications,
        });
        if (data.success) {
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
          this.$router.push('/');
          // return true;
        } else {
          this.success = false;
          this.error = this.$t(data.errors[0].messageKey);
          return false;
        }
      } catch (error) {
        this.$log.error(error);
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
