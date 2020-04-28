<template>
  <b-container fluid class="w-75 m-auto pt-5 pb-5">
      <h1>{{ $t('sign-up.heading') }}</h1>
      <p>{{ $t('sign-up.body') }}</p>
      <ValidationObserver ref="form" v-slot="{ passes, invalid }">
        <b-form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">

          <TextInput
            v-model="email"
            rules="required|email"
            :label="$t('profile.email')"
            :placeholder="$t('sign-up.email-hint')"
            name="email"
            type="email"/>

          <TextInput
            v-model="password"
            rules="required|min:6"
            :label="$t('profile.password')"
            :placeholder="$t('sign-up.password-hint')"
            name="password"
            type="password" />

          <TextInput
            v-model="nickname"
            rules="required|min:3"
            :label="$t('profile.nickname')"
            :placeholder="$t('sign-up.nickname-hint')"
            name="nickname" />

          <Checkbox
            v-model="personalData"
            :label="$t('sign-up.personal-data')"
            name="personal-data"
            identifier="personalData" />

          <div v-if="personalData">
            <div>
              <label for="share-profile">{{ $t('profile.share-profile') }}</label>
            </div>
            <b-row>
              <Radio
                class="pl-3"
                v-model="share"
                identifier="public"
                :label="$t('profile.public')"
                name="share-profile"/>
              <Radio
                class="pl-3"
                v-model="share"
                identifier="private"
                :label="$t('profile.private')"
                name="share-profile"/>
            </b-row><br>

            <TextInput
              v-model="drivingSince"
              rules="min_value:1935"
              :label="$t('profile.driving-since')"
              name="driving-since"
              type="number" />

            <div>
              <label for="vehicle">{{ $t('profile.vehicle') }}</label>
            </div>
            <b-row>
              <Checkbox
                class="pl-3"
                v-model="bike"
                :label="$t('profile.vehicles.bike')"
                name="vehicle"
                identifier="bike" />
              <Checkbox
                class="pl-3"
                v-model="car"
                :label="$t('profile.vehicles.car')"
                name="vehicle"
                identifier="car" />
              <Checkbox
                class="pl-3"
                v-model="bus"
                :label="$t('profile.vehicles.bus')"
                name="vehicle"
                identifier="bus" />
              <Checkbox
                class="pl-3"
                v-model="van"
                :label="$t('profile.vehicles.van')"
                name="vehicle"
                identifier="van" />
              <Checkbox
                class="pl-3"
                v-model="truck"
                :label="$t('profile.vehicles.truck')"
                name="vehicle"
                identifier="truck" />
              <Checkbox
                class="pl-3"
                v-model="tramway"
                :label="$t('profile.vehicles.tramway')"
                name="vehicle"
                identifier="tramway" />
            </b-row>

            <div>
              <label for="sex">{{ $t('profile.sex') }}</label>
            </div>
            <b-row>
              <Radio
                class="pl-3"
                v-model="sex"
                :label="$t('profile.sexes.man')"
                name="sex"
                identifier="man" />
              <Radio
                class="pl-3"
                v-model="sex"
                :label="$t('profile.sexes.woman')"
                name="sex"
                identifier="woman" />
            </b-row><br>

            <TextInput
              v-model="bornInYear"
              rules="min_value:1915"
              :label="$t('profile.born')"
              name="born"
              type="number" />

            <div>
              <label for="region">{{ $t('profile.region') }}</label>
            </div>
            <div>
              <select id="region" v-model="region">
                <option value="">{{ $t('sign-up.region-options') }}</option>
                <option value="PRG">{{ $t('profile.regions.PRG') }}</option>
                <option value="SC">{{ $t('profile.regions.SC') }}</option>
                <option value="JC">{{ $t('profile.regions.JC') }}</option>
                <option value="PLS">{{ $t('profile.regions.PLS') }}</option>
                <option value="KV">{{ $t('profile.regions.KV') }}</option>
                <option value="UST">{{ $t('profile.regions.UST') }}</option>
                <option value="LBR">{{ $t('profile.regions.LBR') }}</option>
                <option value="KH">{{ $t('profile.regions.KH') }}</option>
                <option value="PRD">{{ $t('profile.regions.PRD') }}</option>
                <option value="VSC">{{ $t('profile.regions.VSC') }}</option>
                <option value="JM">{{ $t('profile.regions.JM') }}</option>
                <option value="OLM">{{ $t('profile.regions.OLM') }}</option>
                <option value="ZLN">{{ $t('profile.regions.ZLN') }}</option>
                <option value="MS">{{ $t('profile.regions.MS') }}</option>
              </select>
            </div>

            <div>
              <label for="education">{{ $t('profile.education') }}</label>
            </div>
            <b-row>
              <Radio
                class="pl-3"
                v-model="education"
                :label="$t('profile.educations.primary')"
                name="education"
                identifier="primary" />
              <Radio
                class="pl-3"
                v-model="education"
                :label="$t('profile.educations.secondary')"
                name="education"
                identifier="secondary" />
              <Radio
                class="pl-3"
                v-model="education"
                :label="$t('profile.educations.university')"
                name="education"
                identifier="university" />
            </b-row>
          </div>

          <h2>{{ $t('sign-up.consents') }}</h2>

          <div>
            <Checkbox
              v-model="termsAndConditions"
              :rules="{ required: { allowFalse: false} }"
              :label="$t('profile.terms')"
              name="terms"
              identifier="termsAndConditions" />
          </div>

          <div>
            <Checkbox
              v-model="personalDataProcessing"
              :rules="{ required: { allowFalse: false} }"
              :label="$t('profile.processing')"
              name="processing"
              identifier="personalDataProcessing" />
          </div>

          <div>
            <Checkbox
              v-model="emailNotifications"
              :label="$t('sign-up.notifications-label')"
              name="email-notifications"
              identifier="emailNotifications" />
          </div>

          <div v-if="error" class="text-danger">
            <strong>
              {{ error }}
            </strong>
          </div>

          <b-row>
            <b-col md="4" sm="12">
              <Button
                class="w-100"
                :disabled="invalid"
                :value="$t('sign-up.finished-button-label')"
                @clicked="submitForm()"
                />
            </b-col>
          </b-row>
        </b-form>
      </ValidationObserver>

      <div v-if="success === true">
        <p>{{ $t('sign-up.success-message') }}</p>
      </div>
  </b-container>
</template>

<script>
import jwtDecode from 'jwt-decode';
import { extend, ValidationObserver, configure } from 'vee-validate';
import {
// eslint-disable-next-line camelcase
  required, email, min, min_value,
} from 'vee-validate/dist/rules';
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import i18n from '@/i18n';

extend('email', email);
extend('required', required);
extend('min', min);
extend('min_value', min_value);
configure({
  defaultMessage: (field, values) => {
    /* eslint no-underscore-dangle: 0 */
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

function setVehicles(vehicles) {
  if (this.bike) vehicles.push('bike');
  if (this.car) vehicles.push('car');
  if (this.bus) vehicles.push('bus');
  if (this.van) vehicles.push('van');
  if (this.truck) vehicles.push('truck');
  if (this.tramway) vehicles.push('tramway');
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
  name: 'sign-up',
  components: {
    ValidationObserver,
    Checkbox,
    TextInput,
    Button,
    Radio,
  },
  data: () => ({
    email: null,
    password: null,
    termsAndConditions: false,
    personalDataProcessing: false,
    emailNotifications: false,
    nickname: null,
    drivingSince: null,
    bike: null,
    car: null,
    bus: null,
    van: null,
    truck: null,
    tramway: null,
    sex: null,
    bornInYear: null,
    region: '',
    education: '',
    share: 'public',
    personalData: false,
    error: null,
    success: null,
  }),
  methods: {
    async submitForm() {
      try {
        const { data } = await this.$store.dispatch('CREATE_USER_PROFILE', {
          email: this.email,
          password: this.password,
          nickname: this.nickname,
          termsAndConditions: this.termsAndConditions,
          dataProcessing: this.personalDataProcessing,
          emails: this.emailNotifications,
        });

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
          drivingSince: this.drivingSince,
          vehicle: vehicles,
          sex: this.sex,
          bornInYear: this.bornInYear,
          region: this.region,
          education: this.education,
          publicProfile: this.share,
        });
        this.success = true;
      } catch (error) {
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
  },
};
</script>
