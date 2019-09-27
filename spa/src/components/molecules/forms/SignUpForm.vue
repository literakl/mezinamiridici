<template>
    <div>
        <form
            id="app"
            @submit.prevent="checkForm"
            v-if="success === false || success === null"
        >
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

            <div v-if="success !== true && success !== null">
                <strong class="sign-up-form__errors-heading">
                    {{ $t('sign-up.something-went-wrong-heading') }}
                </strong>
            </div>

            <div id="sign-up-form-wrapper">
                <div class="sign-up-form__label">
                    <label for="email">{{ $t('sign-up.email-label') }}</label>
                </div>
                <TextInput class="sign-up-form__input" v-model="email" identifier="email" type="email" />

                <div class="sign-up-form__label">
                    <label for="password">{{ $t('sign-up.password-label') }}</label>
                </div>
                <TextInput class="sign-up-form__input" v-model="password" identifier="password" type="password" />

                <div class="sign-up-form__label">
                    <label for="nickname">{{ $t('profile.nickname') }}</label>
                </div>
                <TextInput v-model="nickname" identifier="nickname" type="text" />

                <div class="sign-up-form__label">
                    <label for="driving-since">{{ $t('profile.driving-since') }}</label>
                </div>
                <TextInput v-model="drivingSince" identifier="driving-since" type="number" />

                <div class="sign-up-form__label">
                    <label for="vehicle">{{ $t('profile.vehicle') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <Checkbox v-model="bike" name="vehicle" identifier="bike" text="Bike" />
                    <Checkbox v-model="car" name="vehicle" identifier="car" text="Car" />
                    <Checkbox v-model="bus" name="vehicle" identifier="bus" text="Bus" />
                    <Checkbox v-model="van" name="vehicle" identifier="van" text="Van" />
                    <Checkbox v-model="truck" name="vehicle" identifier="truck" text="Truck" />
                    <Checkbox v-model="tramway" name="vehicle" identifier="tramway" text="Tramway" />
                </div>

                <div class="sign-up-form__label">
                    <label for="sex">{{ $t('profile.sex') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <Radio
                        name="sex"
                        identifier="male"
                        text="Male"
                        v-model="sex"
                    />

                    <Radio
                        name="sex"
                        identifier="female"
                        text="Female"
                        v-model="sex"
                    />
                </div>

                <div class="sign-up-form__label">
                    <label for="born-in-year">{{ $t('profile.born') }}</label>
                </div>
                <TextInput v-model="bornInYear" identifier="born-in-year" type="number" />

                <div class="sign-up-form__label">
                    <label for="region">{{ $t('profile.region') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <select
                        id="region"
                        v-model="region"
                    >
                        <option value="">Please select</option>
                        <option value="praha">Praha</option>
                        <option value="stredocesky">Stredocesky</option>
                        <option value="jihocesky">Jihocesky</option>
                        <option value="plzensky">Plzensky</option>
                        <option value="karlovarsky">Karlovarsky</option>
                        <option value="ustecky">Ustecky</option>
                        <option value="liberecky">Liberecky</option>
                        <option value="liberecky">Liberecky</option>
                        <option value="kralovohradecky">Kralovohradecky</option>
                        <option value="pardubicky">Pardubicky</option>
                        <option value="vysocina">Vysocina</option>
                        <option value="jihomoravsky">Jihomoravsky</option>
                        <option value="olomoucky">Olomoucky</option>
                        <option value="zlinsky">Zlinsky</option>
                        <option value="moravskoslezsky">Moravskoslezsky</option>
                    </select>
                </div>

                <div class="sign-up-form__label">
                    <label for="education">{{ $t('profile.education') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <select
                        id="education"
                        v-model="education"
                    >
                        <option value="">Please select</option>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="university">University</option>
                    </select>
                </div>

                <div class="sign-up-form__label">
                    <label for="share-profile">{{ $t('profile.share-profile') }}</label>
                </div>
                <div class="sign-up-form__input">
                    <Radio
                        name="share-profile"
                        identifier="share-nickname"
                        text="Only Nickname"
                        v-model="share"
                    />

                    <Radio
                        name="share-profile"
                        identifier="share-everything"
                        text="Everything"
                        v-model="share"
                    />
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

import Button from '@/components/atoms/Button.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  name: 'SignUpForm',
  components: {
    Checkbox,
    TextInput,
    Button,
    Radio
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
    signingIn: false
  }),
  methods: {
    async checkForm(e) {
      this.signingIn = true;
      this.errors = [];

      if (!this.email) {
        this.errors.push(this.$t('sign-up.email-required'));
      }
      if (!this.password) {
        this.errors.push(this.$t('sign-up.password-required'));
      }
      if (!this.termsAndConditions) {
        this.errors.push(this.$t('sign-up.terms-conditions-required'));
      }
      if (!this.personalDataProcessing) {
        this.errors.push(this.$t('sign-up.data-processing-required'));
      }

      e.preventDefault();

      if (this.errors.length === 0) {
        try {
            const vehicles = [];

            const { data } = await this.$store.dispatch('CREATE_USER_PROFILE', {
                email: this.email,
                password: this.password,
                tandcs: this.termsAndConditions,
                dataProcessing: this.personalDataProcessing,
                marketing: this.emailNotifications
            });

            if(bike) vehicles.push("bike");
            if(car) vehicles.push("car");
            if(bus) vehicles.push("bus");
            if(van) vehicles.push("van");
            if(truck) vehicles.push("truck");
            if(tramway) vehicles.push("tramway");

            await this.$store.dispatch('UPDATE_USER_PROFILE', {
                userId: data.userId,
                nickname: this.nickname,
                drivingSince: this.drivingSince,
                vehicle: vehicles,
                sex: this.sex,
                born: this.bornInYear,
                locationalRegion: this.region,
                education: this.education,
                shareProfile: this.share
            });

            this.success = true;
        } catch {
            this.success = false;
            this.signingIn = false;
        }
      }

      return this.errors.length !== 0;
    },
  },
};
</script>


<style lang="scss">
#sign-up-form-wrapper {
    display: grid;
    margin-top: 40px;
}

#sign-up-form-success {
    color: green;
}

.sign-up-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
}

.sign-up-form__input {
    width: 100%;
}

.sign-up-form__button {
    width: 100%;
}

@media all and (min-width: 850px) {

    .sign-up-form__button {
        width: 30%;
    }

    #sign-up-form-wrapper {
        grid-template-columns: 0.3fr 1fr;
    }

    .sign-up-form__input {
        width: 70%;
    }
}
</style>
