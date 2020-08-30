<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <b-row>
      <b-col>
        <h2>{{ $t('edit-profile.heading') }}</h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p>{{ $t('edit-profile.body') }}</p>
      </b-col>
    </b-row>

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
      <b-form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
        <label for="share-profile">{{ $t('profile.share-profile') }}</label>
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
        </b-row>

        <Datepicker
          :label="$t('profile.driving-since')"
          v-model="drivingSince"
          format="yyyy"
          minimumView="year"
          type="number"
          :disabled-dates="drivingDateScope"
          :typeable="true"
          name="driving-since"/>

        <div>
          <label for="vehicle">{{ $t('profile.vehicle') }}</label>
        </div>
        <b-row>
          <Checkbox
            class="pl-3"
            v-model="bike"
            :label="$t('profile.vehicles.bike')"
            name="vehicle"
            identifier="bike"/>
          <Checkbox
            class="pl-3"
            v-model="car"
            :label="$t('profile.vehicles.car')"
            name="vehicle"
            identifier="car"/>
          <Checkbox
            class="pl-3"
            v-model="bus"
            :label="$t('profile.vehicles.bus')"
            name="vehicle"
            identifier="bus"/>
          <Checkbox
            class="pl-3"
            v-model="van"
            :label="$t('profile.vehicles.van')"
            name="vehicle"
            identifier="van"/>
          <Checkbox
            class="pl-3"
            v-model="truck"
            :label="$t('profile.vehicles.truck')"
            name="vehicle"
            identifier="truck"/>
          <Checkbox
            class="pl-3"
            v-model="tramway"
            :label="$t('profile.vehicles.tramway')"
            name="vehicle"
            identifier="tramway"/>
        </b-row>

        <label class="pt-3" for="sex">{{ $t('profile.sex') }}</label>
        <b-row>
          <Radio
            class="pl-3"
            v-model="sex"
            :label="$t('profile.sexes.man')"
            name="sex"
            identifier="man"/>
          <Radio
            class="pl-3"
            v-model="sex"
            :label="$t('profile.sexes.woman')"
            name="sex"
            identifier="woman"/>
        </b-row>

        <Datepicker
          :label="$t('profile.born')"
          v-model="bornInYear"
          format="yyyy"
          type="number"
          minimumView="year"
          :disabled-dates="bornDateScope"
          :typeable="true"
          name="born"/>

        <label for="region">{{ $t('profile.region') }}</label>
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

        <label class="pt-3" for="education">{{ $t('profile.education') }}</label>
        <b-row class="pb-3">
          <Radio
            class="pl-3"
            v-model="education"
            :label="$t('profile.educations.primary')"
            name="education"
            identifier="primary"/>
          <Radio
            class="pl-3"
            v-model="education"
            :label="$t('profile.educations.secondary')"
            name="education"
            identifier="secondary"/>
          <Radio
            class="pl-3"
            v-model="education"
            :label="$t('profile.educations.university')"
            name="education"
            identifier="university"/>
        </b-row>

        <div v-if="error" class="text-danger">
          {{ error }}
        </div>
        <b-row class="mb-1">
          <b-col md="4" sm="12">
            <Button
              class="w-100"
              :disabled="invalid"
              :value="$t('edit-profile.save-button')"
              @clicked="submitForm()"/>
          </b-col>
        </b-row>
      </b-form>
    </ValidationObserver>

    <div id="sign-up-form-success" v-if="success === true">
      <p>{{ $t('sign-up.success-message') }}</p>
    </div>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import { ContentLoader } from 'vue-content-loader';
import Datepicker from '@/components/atoms/Datepicker.vue';
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import i18n from '@/i18n';

configure({
  defaultMessage: (field, values) => {
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
    Datepicker,
    Checkbox,
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
    drivingDateScope: {
      to: new Date(1935, 0, 1),
      from: new Date(),
    },
    bornDateScope: {
      to: new Date(1915, 0, 1),
      from: new Date(),
    },
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
        if (this.userProfile.driving.since) {
          if (this.userProfile.bio.born) {
            this.drivingSince = new Date(this.userProfile.driving.since, 0, 1);
          }

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
        if (this.userProfile.bio.born) {
          this.bornInYear = new Date(this.userProfile.bio.born, 0, 1);
        }
        this.region = this.userProfile.bio.region;
        this.education = this.userProfile.bio.edu;
        this.share = this.userProfile.prefs.public ? 'public' : 'private';
      } catch (err) {
        this.$log.error(err);
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
          drivingSince: (this.drivingSince) ? new Date(this.drivingSince).getFullYear() : null,
          vehicle: vehicles,
          sex: this.sex,
          bornInYear: (this.bornInYear) ? new Date(this.bornInYear).getFullYear() : null,
          region: this.region,
          education: this.education,
          publicProfile: this.share,
        });
        await this.$router.push({ name: 'user-profile', params: { id: this.userProfile._id } });
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
    },
  },
};
</script>
