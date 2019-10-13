<template>
    <form
        id="app"
        @submit="checkForm"
    >
        <div id="complete-profile-form-wrapper">
            <div class="complete-profile-form__label">
                <label for="nickname">{{ $t('profile.nickname') }}</label>
            </div>
            <TextInput v-model="nickname" identifier="nickname" type="text" :value="nickname" />

            <div class="complete-profile-form__label">
                <label for="driving-since">{{ $t('profile.driving-since') }}</label>
            </div>
            <TextInput v-model="drivingSince" identifier="driving-since" type="number" :value="drivingSince" />

            <div class="complete-profile-form__label">
                <label for="vehicle">{{ $t('profile.vehicle') }}</label>
            </div>

            <div class="complete-profile-form__input">
                <Checkbox v-model="bike" name="vehicle" identifier="bike" text="Bike" :checked="bike"/>
                <Checkbox v-model="car" name="vehicle" identifier="car" text="Car" :checked="car"/>
                <Checkbox v-model="bus" name="vehicle" identifier="bus" text="Bus" :checked="bus" />
                <Checkbox v-model="van" name="vehicle" identifier="van" text="Van" :checked="van" />
                <Checkbox v-model="truck" name="vehicle" identifier="truck" text="Truck" :checked="truck" />
                <Checkbox v-model="tramway" name="vehicle" identifier="tramway" text="Tramway" :checked="tramway" />
            </div>

            <div class="complete-profile-form__label">
                <label for="sex">{{ $t('profile.sex') }}</label>
            </div>
            <div class="complete-profile-form__input">
                <Radio
                    name="sex"
                    identifier="male"
                    text="Male"
                    :checked="male"
                />

                <Radio
                    name="sex"
                    identifier="false"
                    text="Female"
                    :checked="female"
                />
            </div>

            <div class="complete-profile-form__label">
                <label for="born-in-year">{{ $t('profile.born') }}</label>
            </div>
            <TextInput v-model="bornInYear" identifier="born-in-year" type="number" :value="bornInYear" />

            <div class="complete-profile-form__label">
                <label for="region">{{ $t('profile.region') }}</label>
            </div>
            <div class="complete-profile-form__input">
                <select
                    id="region"
                    v-model="region"
                    :value="region"
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

            <div class="complete-profile-form__label">
                <label for="education">{{ $t('profile.education') }}</label>
            </div>
            <div class="complete-profile-form__input">
                <select
                    id="education"
                    v-model="education"
                    :value="education"
                >
                    <option value="">Please select</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="university">University</option>
                </select>
            </div>

            <div class="complete-profile-form__label">
                <label for="share-profile">{{ $t('profile.share-profile') }}</label>
            </div>
            <div class="complete-profile-form__input">
                <Radio
                    name="share-profile"
                    identifier="onlyNickname"
                    text="Only Nickname"
                    :checked="onlyNickname"
                />

                <Radio
                    name="share-profile"
                    identifier="everything"
                    text="Everything"
                    :checked="everything"
                />
            </div>
        </div>

        <Submit :value="$t('profile.finish-button')" />
    </form>
</template>

<script>

import Submit from '@/components/atoms/Submit.vue';
import Radio from '@/components/atoms/Radio.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  name: 'SignUpForm',
  components: {
    Radio,
    TextInput,
    Checkbox,
    Submit,
  },
  data: () => ({
    nickname: null,
    drivingSince: null,
    bike: null,
    car: null,
    bus: null,
    van: null,
    truck: null,
    tramway: null,
    male: null,
    female: null,
    bornInYear: null,
    region: '',
    education: '',
    onlyNickname: null,
    everything: null,
  }),
  async created(){
    await this.$store.dispatch('GET_SIGNED_IN_USER_PROFILE');
      if(this.$store.getters.SIGNED_IN_USER_PROFILE) {
          this.nickname = this.$store.getters.SIGNED_IN_USER_PROFILE.nickname;
          this.drivingSince = this.$store.getters.SIGNED_IN_USER_PROFILE.drivingSince;
          this.bornInYear = this.$store.getters.SIGNED_IN_USER_PROFILE.born;
          this.bike = this.$store.getters.SIGNED_IN_USER_PROFILE.vehicle.find(v => v === "bike") === "bike";
          this.car = this.$store.getters.SIGNED_IN_USER_PROFILE.vehicle.find(v => v === "car") === "car";
          this.bus = this.$store.getters.SIGNED_IN_USER_PROFILE.vehicle.find(v => v === "bus") === "bus";
          this.van = this.$store.getters.SIGNED_IN_USER_PROFILE.vehicle.find(v => v === "van") === "van";
          this.truck = this.$store.getters.SIGNED_IN_USER_PROFILE.vehicle.find(v => v === "truck") === "truck";
          this.tramway = this.$store.getters.SIGNED_IN_USER_PROFILE.vehicle.find(v => v === "tramway") === "tramway";
          this.male = this.$store.getters.SIGNED_IN_USER_PROFILE.sex === "male";
          this.female = this.$store.getters.SIGNED_IN_USER_PROFILE.sex === "female";
          this.region = this.$store.getters.SIGNED_IN_USER_PROFILE.locationalRegion;
          this.education = this.$store.getters.SIGNED_IN_USER_PROFILE.education;
          this.everyting = this.$store.getters.SIGNED_IN_USER_PROFILE.shareProfile === "everything";
          this.onlyNickname = this.$store.getters.SIGNED_IN_USER_PROFILE.shareProfile = "onlyNickname";
      }
  },
  methods: {
    checkForm(e) {
      e.preventDefault();

      if (this.errors.length === 0) {
        // This will eventually call the API to create the user as validation has passed.
        this.$router.push('/');
      }

      return this.errors.length !== 0;
    },
  },
};
</script>

<style lang="scss">
#complete-profile-form-wrapper {
    display: grid;
    grid-template-columns: 0.3fr 1fr;
    margin-top: 40px;
}

.complete-profile-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.complete-profile-form__errors-heading {
    color: rgb(209, 49, 49);
}
</style>
