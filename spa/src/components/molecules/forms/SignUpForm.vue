<template>
    <div>
        <form id="app" @submit.prevent="checkForm" v-if="success === false || success === null">
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

            <div id="sign-up-form-wrapper">
                <div class="sign-up-form__label mandatory">
                    <label for="email">{{ $t('sign-up.email-label') }}</label>
                </div>
                <TextInput class="sign-up-form__input" v-model="email" identifier="email" type="email" />

                <div class="sign-up-form__label mandatory">
                    <label for="password">{{ $t('sign-up.password-label') }}</label>
                </div>
                <TextInput class="sign-up-form__input" v-model="password" identifier="password" type="password" />

                <div class="sign-up-form__label mandatory">
                    <label for="nickname">{{ $t('profile.nickname') }}</label>
                </div>
                <TextInput class="sign-up-form__input" v-model="nickname" identifier="nickname" type="text" />

                <div class="sign-up-form__label">
                    <label for="driving-since">{{ $t('profile.driving-since') }}</label>
                </div>
                <TextInput class="sign-up-form__year" v-model="drivingSince" identifier="driving-since" type="number" />

                <div class="sign-up-form__label">
                    <label for="vehicle">{{ $t('profile.vehicle') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <Checkbox v-model="bike" name="vehicle" identifier="bike" :text="$t('profile.vehicle-bike')" />
                    <Checkbox v-model="car" name="vehicle" identifier="car" :text="$t('profile.vehicle-car')" />
                    <Checkbox v-model="bus" name="vehicle" identifier="bus" :text="$t('profile.vehicle-bus')" />
                    <Checkbox v-model="van" name="vehicle" identifier="van" :text="$t('profile.vehicle-van')" />
                    <Checkbox v-model="truck" name="vehicle" identifier="truck" :text="$t('profile.vehicle-truck')" />
                    <Checkbox v-model="tramway" name="vehicle" identifier="tramway" :text="$t('profile.vehicle-tramway')" />
                </div>

                <div class="sign-up-form__label">
                    <label for="sex">{{ $t('profile.sex') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <Radio name="sex" identifier="male" :text="$t('profile.sex-man')" v-model="sex" />
                    <Radio name="sex" identifier="female" :text="$t('profile.sex-woman')" v-model="sex" />
                </div>

                <div class="sign-up-form__label">
                    <label for="born-in-year">{{ $t('profile.born') }}</label>
                </div>
                <TextInput class="sign-up-form__year" v-model="bornInYear" identifier="born-in-year" type="number" />

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
                  <Radio name="education" identifier="primary" :text="$t('profile.edu-basic')" v-model="education" />
                  <Radio name="education" identifier="secondary" :text="$t('profile.edu-high')" v-model="education" />
                  <Radio name="education" identifier="university" :text="$t('profile.edu-university')" v-model="education" />
                </div>

                <div class="sign-up-form__label">
                    <label for="share-profile">{{ $t('profile.share-profile') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <Radio name="share-profile" identifier="public" :text="$t('profile.public')" v-model="share" />
                    <Radio name="share-profile" identifier="private" :text="$t('profile.private')" v-model="share" />
                </div>

                <div class="sign-up-form__input">
                    <Checkbox v-model="termsAndConditions" name="terms-and-conditions" identifier="terms-and-conditions"/>
                </div>
                <div class="sign-up-form__label">
                    <label for="terms-and-conditions">{{ $t('sign-up.terms-label') }}</label>
                </div>

                <div class="sign-up-form__input">
                    <Checkbox v-model="personalDataProcessing" name="personal-data-processing" identifier="personal-data-processing"/>
                </div>
                <div class="sign-up-form__label">
                    <label for="personal-data-processing">{{ $t('sign-up.processing-label') }}</label>
                </div>

                <div class="sign-up-form__input">
                    <Checkbox v-model="emailNotifications" name="email-notifications" identifier="email-notifications"/>
                </div>
                <div class="sign-up-form__label">
                    <label for="email-notifications">{{ $t('sign-up.notifications-label') }}</label>
                </div>
            </div>

            <Button :disabled="signingIn" :value="$t('sign-up.finished-button-label')" @clicked="checkForm" class="sign-up-form__button"/>
        </form>
        <div id="sign-up-form-success" v-if="success === true">
            <p>{{ $t('sign-up.success-message') }}</p>
        </div>
    </div>
</template>

<script>

import jwtDecode from 'jwt-decode';
import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';

function validateForm() {
  if (!this.email) {
    this.errors.push(this.$t('sign-up.email-required'));
  } else if (!(/\S+@\S+\.\S+/.test(this.email))) {
    this.errors.push(this.$t('sign-up.email-illegal'));
  }
  if (!this.password) {
    this.errors.push(this.$t('sign-up.password-required'));
  } else if (this.password.length < 6) {
    this.errors.push(this.$t('sign-up.password-short'));
  }
  if (!this.nickname) {
    this.errors.push(this.$t('sign-up.nickname-required'));
  }
  if (!this.termsAndConditions) {
    this.errors.push(this.$t('sign-up.terms-conditions-required'));
  }
  if (!this.personalDataProcessing) {
    this.errors.push(this.$t('sign-up.data-processing-required'));
  }
}

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
    async checkForm() {
      this.signingIn = true;
      this.errors = [];
      validateForm.call(this);
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
