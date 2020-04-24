<template>
  <div class="sign-up-wrapper">

    <div class="sign-up__heading">
      <h2>{{ $t('edit-profile.heading') }}</h2>
      <p>{{ $t('edit-profile.body') }}</p>
    </div>

    <content-loader
      :height="100"
      :width="400"
      :speed="2"
      primaryColor="#949494"
      secondaryColor="#606060"
      v-if="!userProfile && !error"
    >
      <rect x="9" y="12" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="12" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="31" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="31" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="51" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="51" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="71" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="71" rx="3" ry="3" width="100" height="5"/>

      <rect x="9" y="91" rx="3" ry="3" width="50" height="5"/>
      <rect x="70" y="91" rx="3" ry="3" width="100" height="5"/>
    </content-loader>

    <ValidationObserver ref="form" v-slot="{ passes, invalid }" v-if="userProfile">
      <form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
        <div class="sign-up-form__label">
          <label for="share-profile">{{ $t('profile.share-profile') }}</label>
        </div>
        <div class="sign-up-form__input">
          <Radio
            v-model="share"
            identifier="public"
            :label="$t('profile.public')"
            name="share-profile"/>
          <Radio
            v-model="share"
            identifier="private"
            :label="$t('profile.private')"
            name="share-profile"/>
        </div>

        <TextInput
          v-model="drivingSince"
          rules="min_value:1935"
          :label="$t('profile.driving-since')"
          name="driving-since"
          type="number" />

        <div class="sign-up-form__label">
          <label for="vehicle">{{ $t('profile.vehicle') }}</label>
        </div>
        <div class="sign-up-form__input">
          <Checkbox
            v-model="bike"
            :label="$t('profile.vehicles.bike')"
            name="vehicle"
            identifier="bike" />
          <Checkbox
            v-model="car"
            :label="$t('profile.vehicles.car')"
            name="vehicle"
            identifier="car" />
          <Checkbox
            v-model="bus"
            :label="$t('profile.vehicles.bus')"
            name="vehicle"
            identifier="bus" />
          <Checkbox
            v-model="van"
            :label="$t('profile.vehicles.van')"
            name="vehicle"
            identifier="van" />
          <Checkbox
            v-model="truck"
            :label="$t('profile.vehicles.truck')"
            name="vehicle"
            identifier="truck" />
          <Checkbox
            v-model="tramway"
            :label="$t('profile.vehicles.tramway')"
            name="vehicle"
            identifier="tramway" />
        </div>

        <div class="sign-up-form__label">
          <label for="sex">{{ $t('profile.sex') }}</label>
        </div>
        <div class="sign-up-form__input">
          <Radio
            v-model="sex"
            :label="$t('profile.sexes.man')"
            name="sex"
            identifier="man" />
          <Radio
            v-model="sex"
            :label="$t('profile.sexes.woman')"
            name="sex"
            identifier="woman" />
        </div>

        <TextInput
          v-model="bornInYear"
          rules="min_value:1915"
          :label="$t('profile.born')"
          name="born"
          type="number" />

        <div class="sign-up-form__label">
          <label for="region">{{ $t('profile.region') }}</label>
        </div>
        <div class="sign-up-form__input">
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

        <div class="sign-up-form__label">
          <label for="education">{{ $t('profile.education') }}</label>
        </div>
        <div class="sign-up-form__input">
          <Radio
            v-model="education"
            :label="$t('profile.educations.primary')"
            name="education"
            identifier="primary" />
          <Radio
            v-model="education"
            :label="$t('profile.educations.secondary')"
            name="education"
            identifier="secondary" />
          <Radio
            v-model="education"
            :label="$t('profile.educations.university')"
            name="education"
            identifier="university" />
        </div>

        <div v-if="error" class="sign-up-form__errors-heading">
          {{ error }}
        </div>

        <Button
          :disabled="invalid"
          :value="$t('sign-up.finished-button-label')"
          @clicked="submitForm()"
          class="sign-up-form__button"/>
      </form>
    </ValidationObserver>

    <div id="sign-up-form-success" v-if="success === true">
      <p>{{ $t('sign-up.success-message') }}</p>
    </div>
  </div>
</template>

<script>
import { extend, ValidationObserver, configure } from 'vee-validate';
import {
// eslint-disable-next-line camelcase
  required, min, min_value,
} from 'vee-validate/dist/rules';
import { ContentLoader } from 'vue-content-loader';
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import i18n from '@/i18n';

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
    ContentLoader,
    ValidationObserver,
    Checkbox,
    TextInput,
    Button,
    Radio,
  },
  data: () => ({
    userProfile: null,
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
    error: null,
    success: null,
  }),
  created() {
    this.getProfile(this.$store.getters.USER_ID);
  },
  methods: {
    async getProfile(id) {
      try {
        const response = await this.$store.dispatch('GET_USER_PROFILE_BY_ID', { id });
        this.userProfile = response.data.data;
        if (this.userProfile.driving) {
          this.drivingSince = this.userProfile.driving.since;
          if (this.userProfile.driving.vehicles) {
            this.bike = this.userProfile.driving.vehicles.includes('bike');
            this.car = this.userProfile.driving.vehicles.includes('car');
            this.bus = this.userProfile.driving.vehicles.includes('bus');
            this.van = this.userProfile.driving.vehicles.includes('van');
            this.truck = this.userProfile.driving.vehicles.includes('truck');
            this.tramway = this.userProfile.driving.vehicles.includes('tramway');
          }
        }
        this.sex = this.userProfile.bio.sex;
        this.bornInYear = this.userProfile.bio.born;
        this.region = this.userProfile.bio.region;
        this.education = this.userProfile.bio.edu;
        this.share = this.userProfile.prefs.public ? 'public' : 'private';
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        if (err.response && err.response.data && err.response.data.errors) {
          this.error = this.$t(err.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      }
    },
    async submitForm() {
      try {
        const vehicles = [];
        setVehicles.call(this, vehicles);
        await this.$store.dispatch('UPDATE_USER_PROFILE', {
          jwt: this.$store.getters.USER_TOKEN,
          userId: this.userProfile._id,
          drivingSince: this.drivingSince,
          vehicle: vehicles,
          sex: this.sex,
          bornInYear: this.bornInYear,
          region: this.region,
          education: this.education,
          publicProfile: this.share,
        });
        await this.$router.push({ name: 'user-profile', params: { id: this.userProfile._id } });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        this.success = false;
        if (error.response) {
          const veeErrors = convertErrors.call(this, error.response.data);
          this.$refs.form.setErrors(veeErrors);
        } else {
          this.error = this.$t('sign-up.something-went-wrong');
        }
      }
    },
  },
};
</script>

<style>
.sign-up-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  margin: 0 auto;
  max-width: 80%;
  padding: 1em 0;
}

#sign-up-form-success {
  color: green;
}

.sign-up-form__label {
  font-size: 25px;
  clear: both;
  margin-bottom: 0.6rem;
  font-weight: normal;
}

.sign-up-form__errors-heading {
  color: rgb(209, 49, 49);
  font-size: 150%;
  clear: both;
}

.sign-up-form__input {
  width: 100%;
  font-size: 20px;
  margin-bottom: 1rem;
}

select {
  font-size: 20px;
  padding: 8px;
  margin-bottom: 1rem;
}

.sign-up-form__button {
  display: block;
  clear: left;
  width: 100%;
}

@media all and (min-width: 850px) {
  .sign-up-wrapper {
    grid-template-columns: 1fr;
    max-width: 80%;
  }

  .sign-up-form__button {
    width: 30%;
  }

  .sign-up-form__input {
    /*width: 70%;*/
  }
}
</style>
