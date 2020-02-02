<template>
  <div class="col-sm-8 offset-sm-2">
    <ValidationObserver ref="form" v-slot="{ passes, invalid }">
      <form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
        <div v-if="error">
          <strong class="sign-up-form__errors-heading">
            {{ error }}
          </strong>
        </div>

        <TextInput
          v-model="email"
          rules="required|email"
          :label="$t('sign-up.email-label')"
          :placeholder="$t('sign-up.email-hint')"
          name="email"
          type="email"/>
        <TextInput
          v-model="password"
          rules="required|min:6"
          :label="$t('sign-up.password-label')"
          :placeholder="$t('sign-up.password-hint')"
          name="password" type="password" />
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
          <div class="sign-up-form__label">
            <label for="share-profile">{{ $t('profile.share-profile') }}</label>
          </div>
          <div class="sign-up-form__input">
            <Radio
              name="share-profile"
              identifier="public"
              :label="$t('profile.public')"
              v-model="share" />
            <Radio
              name="share-profile"
              identifier="private"
              :label="$t('profile.private')"
              v-model="share" />
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
              :label="$t('profile.vehicle-bike')"
              name="vehicle"
              identifier="bike" />
            <Checkbox
              v-model="car"
              :label="$t('profile.vehicle-car')"
              name="vehicle"
              identifier="car" />
            <Checkbox
              v-model="bus"
              :label="$t('profile.vehicle-bus')"
              name="vehicle"
              identifier="bus" />
            <Checkbox
              v-model="van"
              :label="$t('profile.vehicle-van')"
              name="vehicle"
              identifier="van" />
            <Checkbox
              v-model="truck"
              :label="$t('profile.vehicle-truck')"
              name="vehicle"
              identifier="truck" />
            <Checkbox
              v-model="tramway"
              :label="$t('profile.vehicle-tramway')"
              name="vehicle"
              identifier="tramway" />
          </div>

          <div class="sign-up-form__label">
            <label for="sex">{{ $t('profile.sex') }}</label>
          </div>
          <div class="sign-up-form__input">
            <Radio
              v-model="sex"
              :label="$t('profile.sex-man')"
              name="sex"
              identifier="man" />
            <Radio
              v-model="sex"
              :label="$t('profile.sex-woman')"
              name="sex"
              identifier="woman" />
          </div>

          <TextInput
            v-model="bornInYear"
            rules="min_value:1915"
            :label="$t('profile.born')"
            name="born-in-year"
            type="number" />

          <div class="sign-up-form__label">
            <label for="region">{{ $t('profile.region') }}</label>
          </div>
          <div class="sign-up-form__input">
            <select id="region" v-model="region">
              <option value="">{{ $t('sign-up.region-options') }}</option>
              <option value="PRG">Praha</option>
              <option value="SC">Stredočeský</option>
              <option value="JC">Jihočeský</option>
              <option value="PLS">Plzeňský</option>
              <option value="KV">Karlovarský</option>
              <option value="UST">Ústecký</option>
              <option value="LBR">Liberecký</option>
              <option value="KH">Královohradecký</option>
              <option value="PRD">Pardubický</option>
              <option value="VSC">Vysočina</option>
              <option value="JM">Jihomoravský</option>
              <option value="OLM">Olomoucký</option>
              <option value="ZLN">Zlínský</option>
              <option value="MS">Moravskoslezský</option>
            </select>
          </div>

          <div class="sign-up-form__label">
            <label for="education">{{ $t('profile.education') }}</label>
          </div>
          <div class="sign-up-form__input">
            <Radio
              v-model="education"
              :label="$t('profile.edu-basic')"
              name="education"
              identifier="primary" />
            <Radio
              v-model="education"
              :label="$t('profile.edu-high')"
              name="education"
              identifier="secondary" />
            <Radio
              v-model="education"
              :label="$t('profile.edu-university')"
              name="education"
              identifier="university" />
          </div>
        </div>

        <h2>{{ $t('sign-up.consents') }}</h2>

        <Checkbox
          v-model="termsAndConditions"
          :rules="{ required: { allowFalse: false} }"
          :label="$t('sign-up.terms-label')"
          name="terms-and-conditions"
          identifier="termsAndConditions" />
        <Checkbox
          v-model="personalDataProcessing"
          :rules="{ required: { allowFalse: false} }"
          :label="$t('sign-up.processing-label')"
          name="personal-data-processing"
          identifier="personalDataProcessing" />
        <Checkbox
          v-model="emailNotifications"
          :label="$t('sign-up.notifications-label')"
          name="email-notifications"
          identifier="emailNotifications" />

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

import jwtDecode from 'jwt-decode';
import { extend, ValidationObserver } from 'vee-validate';
import {
// eslint-disable-next-line camelcase
  required, email, min, min_value,
} from 'vee-validate/dist/rules';
import Button from '../../atoms/Button.vue';
import Checkbox from '../../atoms/Checkbox.vue';
import Radio from '../../atoms/Radio.vue';
import TextInput from '../../atoms/TextInput.vue';

extend('email', email);
extend('required', required);
extend('min', min);
extend('min_value', min_value);

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
  name: 'SignUpForm',
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


<style lang="scss">
  .atoms__checkbox {
    width: 9em;
    float: left;
  }
  .atoms__radio {
    width: 9em;
    float: left;
  }

  #sign-up-form-wrapper {
    display: grid;
    margin-top: 40px;
  }

  #sign-up-form-success {
    color: green;
  }

  .sign-up-form__label {
    font-size: 25px;
    clear: both;
    margin-bottom: 20px;
    font-weight: normal;
  }

  .sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
  }

  .sign-up-form__year {
    width: 4em;
  }

  .sign-up-form__input {
    width: 100%;
    font-size: 20px;
    select{
      font-size: 20px;
      padding: 8px;
      margin-bottom: 20px;
    }
  }

  .sign-up-form__button {
    width: 100%;
  }

  .mandatory {
    font-weight: bold;
  }

  @media all and (min-width: 850px) {
    .sign-up-form__button {
      width: 30%;
    }

    #sign-up-form-wrapper {
      grid-template-columns: 0.3fr 1fr;
    }

    .sign-up-form__input {
      /*width: 70%;*/
    }
  }
</style>
