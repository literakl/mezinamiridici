<template>
    <form
        id="app"
        @submit="checkForm"
    >
        <div id="complete-profile-form-wrapper">
            <div class="complete-profile-form__label">
                <label for="nickname">Nickname</label>
            </div>
            <TextInput v-model="nickname" identifier="nickname" type="text" />

            <div class="complete-profile-form__label">
                <label for="driving-since">Driving since</label>
            </div>
            <TextInput v-model="drivingSince" identifier="driving-since" type="number" />

            <div class="complete-profile-form__label">
                <label for="vehicle">Vehicle</label>
            </div>
            <div class="complete-profile-form__input">
                <Checkbox v-model="bike" name="vehicle" identifier="bike" text="Bike" />
                <Checkbox v-model="car" name="vehicle" identifier="car" text="Car" />
                <Checkbox v-model="bus" name="vehicle" identifier="bus" text="Bus" />
                <Checkbox v-model="van" name="vehicle" identifier="van" text="Van" />
                <Checkbox v-model="truck" name="vehicle" identifier="truck" text="Truck" />
                <Checkbox v-model="tramway" name="vehicle" identifier="tramway" text="Tramway" />
            </div>

            <div class="complete-profile-form__label">
                <label for="sex">Sex</label>
            </div>
            <div class="complete-profile-form__input">
                <input
                    id="male"
                    v-model="male"
                    type="radio"
                    name="sex"
                    value="male"
                >
                <label for="male">Male</label>

                <input
                    id="female"
                    v-model="female"
                    type="radio"
                    name="sex"
                    value="female"
                >
                <label for="female">Female</label>
            </div>

            <div class="complete-profile-form__label">
                <label for="born-in-year">Born</label>
            </div>
            <TextInput v-model="bornInYear" identifier="born-in-year" type="number" />

            <div class="complete-profile-form__label">
                <label for="region">Region</label>
            </div>
            <div class="complete-profile-form__input">
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

            <div class="complete-profile-form__label">
                <label for="education">Education</label>
            </div>
            <div class="complete-profile-form__input">
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

            <div class="complete-profile-form__label">
                <label for="share-profile">Share Profile</label>
            </div>
            <div class="complete-profile-form__input">
                <input
                    id="onlynickname"
                    v-model="onlyNickname"
                    type="radio"
                    name="share-profile"
                    value="onlyNickname"
                >
                <label for="onlynickname">Only Nickname</label>

                <input
                    id="everything"
                    v-model="everything"
                    type="radio"
                    name="share-profile"
                    value="everything"
                >
                <label for="everything">Everything</label>
            </div>
        </div>

        <Submit value="Finished" />
    </form>
</template>

<script>

import Submit from '@/components/atoms/Submit.vue';
import Radio from '@/components/atoms/Radio.vue';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  name: 'SignUpForm',
  components: {
    Radio,
    TextInput,
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
    region: "",
    education: "",
    onlyNickname: null,
    everything: null,
  }),
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
