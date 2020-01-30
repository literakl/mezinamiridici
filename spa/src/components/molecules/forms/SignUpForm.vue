<template>
    <div>
      <ValidationObserver v-slot="{ passes }">
        <form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
            <div v-if="errors.length">
                <strong class="sign-up-form__errors-heading">
                    {{ $t('sign-up.errors-heading') }}
                </strong>
                <ul>
                    <li v-for="error in errors" v-bind:key="error">
                        {{ error }}
                    </li>
                </ul>
            </div>

            <div v-if="success !== true && success !== null && errors.length === 0">
                <strong class="sign-up-form__errors-heading">
                    {{ $t('sign-up.something-went-wrong-heading') }}
                </strong>
            </div>

          <TextInput v-model="email" rules="required|email" :label="$t('sign-up.email-label')" name="email" placeholder="placeholder"/>
          <TextInput v-model="password" rules="required|min:6" :label="$t('sign-up.password-label')" name="password" type="password" />
          <TextInput v-model="nickname" rules="required|min:3" :label="$t('profile.nickname')" name="nickname" />
          <TextInput v-model="drivingSince" rules="min_value:1935" :label="$t('profile.driving-since')" name="driving-since" type="number" />

            <div class="sign-up-form__label">
                <label for="vehicle">{{ $t('profile.vehicle') }}</label>
            </div>
            <div class="sign-up-form__input">
                <Checkbox v-model="bike" :label="$t('profile.vehicle-bike')" name="vehicle" identifier="bike" />
                <Checkbox v-model="car" :label="$t('profile.vehicle-car')" name="vehicle" identifier="car" />
                <Checkbox v-model="bus" :label="$t('profile.vehicle-bus')" name="vehicle" identifier="bus" />
                <Checkbox v-model="van" :label="$t('profile.vehicle-van')" name="vehicle" identifier="van" />
                <Checkbox v-model="truck" :label="$t('profile.vehicle-truck')" name="vehicle" identifier="truck" />
                <Checkbox v-model="tramway" :label="$t('profile.vehicle-tramway')" name="vehicle" identifier="tramway" />
            </div>

            <div class="sign-up-form__label">
                <label for="sex">{{ $t('profile.sex') }}</label>
            </div>
            <div class="sign-up-form__input">
                <Radio v-model="sex" :label="$t('profile.sex-man')" name="sex" identifier="male" />
                <Radio v-model="sex" :label="$t('profile.sex-woman')" name="sex" identifier="female" />
            </div>

          <TextInput v-model="bornInYear" rules="min_value:1915" :label="$t('profile.born')" name="born-in-year" type="number" />

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
              <Radio v-model="education" :label="$t('profile.edu-basic')" name="education" identifier="primary" />
              <Radio v-model="education" :label="$t('profile.edu-high')" name="education" identifier="secondary" />
              <Radio v-model="education" :label="$t('profile.edu-university')" name="education" identifier="university" />
            </div>

            <div class="sign-up-form__label">
                <label for="share-profile">{{ $t('profile.share-profile') }}</label>
            </div>
            <div class="sign-up-form__input">
                <Radio name="share-profile" identifier="public" :text="$t('profile.public')" v-model="share" />
                <Radio name="share-profile" identifier="private" :text="$t('profile.private')" v-model="share" />
            </div>

          <Checkbox v-model="termsAndConditions" rules="required" :label="$t('sign-up.terms-label')" name="terms-and-conditions" identifier="termsAndConditions" />
          <Checkbox v-model="personalDataProcessing" rules="required" :label="$t('sign-up.processing-label')" name="personal-data-processing" identifier="personalDataProcessing" />
          <Checkbox v-model="emailNotifications" :label="$t('sign-up.notifications-label')" name="email-notifications" identifier="emailNotifications" />

          <Button :disabled="signingIn" :value="$t('sign-up.finished-button-label')" @clicked="submitForm" class="sign-up-form__button"/>
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
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';

extend('email', email);
extend('required', required);
extend('min', min);
extend('min_value', min_value);

/*
function validateForm() {
  if (!this.termsAndConditions) {
    this.errors.push(this.$t('sign-up.consent-missing'));
  }
  if (!this.personalDataProcessing) {
    this.errors.push(this.$t('sign-up.consent-missing'));
  }
}
*/

function setVehicles(vehicles) {
  if (this.bike) vehicles.push('bike');
  if (this.car) vehicles.push('car');
  if (this.bus) vehicles.push('bus');
  if (this.van) vehicles.push('van');
  if (this.truck) vehicles.push('truck');
  if (this.tramway) vehicles.push('tramway');
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
    errors: [],
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
    share: null,
    success: null,
    signingIn: false,
  }),
  methods: {
    async submitForm() {
      this.signingIn = true;
      this.errors = [];
      // validateForm.call(this);
      if (this.errors.length > 0) {
        this.signingIn = false;
        return false;
      }

      try {
        const vehicles = [];
        const { data } = await this.$store.dispatch('CREATE_USER_PROFILE', {
          email: this.email,
          password: this.password,
          nickname: this.nickname,
          termsAndConditions: this.termsAndConditions,
          dataProcessing: this.personalDataProcessing,
          emails: this.emailNotifications,
        });

        if (data.token !== undefined) {
          const jwtData = jwtDecode(data.token);
          setVehicles.call(this, vehicles);
          await this.$store.dispatch('UPDATE_USER_PROFILE', {
            jwt: data,
            userId: jwtData.userId,
            nickname: this.nickname,
            drivingSince: this.drivingSince,
            vehicle: vehicles,
            sex: this.sex,
            bornInYear: this.bornInYear,
            region: this.region,
            education: this.education,
            shareProfile: this.share,
          });
          this.success = true;
        } else {
          console.log('token is missing', this.errors);
          this.signingIn = false;
          this.errors.push(data.message);
        }
      } catch (error) {
        console.log(error);
        this.signingIn = false;
        this.success = false;
        const e = error.response.data;
        if (e.error.code === 1002) {
          e.error.validation.forEach((v) => {
            // eslint-disable-next-line default-case
            switch (v.field) {
              case 'email':
                this.errors.push(this.$t('sign-up.email-exists')); break;
              case 'nickname':
                this.errors.push(this.$t('sign-up.nickname-exists')); break;
            }
          });
        } else {
          console.log('other error', error);
        }
      }
      return this.errors.length !== 0;
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
