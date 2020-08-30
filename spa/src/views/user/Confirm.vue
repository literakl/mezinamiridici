<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <b-row>
      <b-col>
        <h1>{{ $t('confirm.heading') }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p>{{ $t('sign-up.body') }}</p>
      </b-col>
    </b-row>
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
              name="share-profile"
            />
            <Radio
              class="pl-3"
              v-model="share"
              identifier="private"
              :label="$t('profile.private')"
              name="share-profile"
            />
          </b-row>
          <br />

          <TextInput
            v-model="drivingSince"
            rules="min_value:1935"
            :label="$t('profile.driving-since')"
            name="driving-since"
            type="number"
          />

          <div>
            <label for="vehicle">{{ $t('profile.vehicle') }}</label>
          </div>
          <b-row>
            <Checkbox
              class="pl-3"
              v-model="bike"
              :label="$t('profile.vehicles.bike')"
              name="vehicle"
              identifier="bike"
            />
            <Checkbox
              class="pl-3"
              v-model="car"
              :label="$t('profile.vehicles.car')"
              name="vehicle"
              identifier="car"
            />
            <Checkbox
              class="pl-3"
              v-model="bus"
              :label="$t('profile.vehicles.bus')"
              name="vehicle"
              identifier="bus"
            />
            <Checkbox
              class="pl-3"
              v-model="van"
              :label="$t('profile.vehicles.van')"
              name="vehicle"
              identifier="van"
            />
            <Checkbox
              class="pl-3"
              v-model="truck"
              :label="$t('profile.vehicles.truck')"
              name="vehicle"
              identifier="truck"
            />
            <Checkbox
              class="pl-3"
              v-model="tramway"
              :label="$t('profile.vehicles.tramway')"
              name="vehicle"
              identifier="tramway"
            />
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
              identifier="man"
            />
            <Radio
              class="pl-3"
              v-model="sex"
              :label="$t('profile.sexes.woman')"
              name="sex"
              identifier="woman"
            />
          </b-row>
          <br />

          <TextInput
            v-model="bornInYear"
            rules="min_value:1915"
            :label="$t('profile.born')"
            name="born"
            type="number"
          />

          <div>
            <label for="region">{{ $t('profile.region') }}</label>
          </div>
          <div>
            <select id="region" v-model="region">
              <option value>{{ $t('sign-up.region-options') }}</option>
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
              identifier="primary"
            />
            <Radio
              class="pl-3"
              v-model="education"
              :label="$t('profile.educations.secondary')"
              name="education"
              identifier="secondary"
            />
            <Radio
              class="pl-3"
              v-model="education"
              :label="$t('profile.educations.university')"
              name="education"
              identifier="university"
            />
          </b-row>
        </div>

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

        <b-row>
          <b-col md="4" sm="12">
            <Button
              class="w-100"
              :disabled="invalid"
              :value="$t('confirm.finished-button-label')"
              @clicked="submitForm()"
            />
          </b-col>
        </b-row>
      </b-form>
    </ValidationObserver>

    <b-row v-if="success === true">
      <b-col>
        <p>{{ $t('sign-up.success-message') }}</p>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import i18n from '@/i18n';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});


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
    Radio,
  },
  data: () => ({
    email: null,
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
        this.$log.debug(JSON.stringify(profile));
        this.nickname = profile.data.data.bio.nickname;
        // this.email = profile.data.data.auth.email;
        // this.$router.push('/');
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
        this.$log.debug(JSON.stringify(data));
        if (data.success) {
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
  },
};
</script>
