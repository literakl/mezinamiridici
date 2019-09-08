<template>
    <form
        id="app"
        @submit="checkForm"
    >
        <div v-if="errors.length">
            <strong class="sign-up-form__errors-heading">
                Please correct the following error(s):
            </strong>
            <ul>
                <li v-for="error in errors" v-bind:key="error">
                    {{ error }}
                </li>
            </ul>
        </div>

        <div id="sign-up-form-wrapper">
            <div class="sign-up-form__label">
                <label for="email">Email</label>
            </div>
            <div class="sign-up-form__input">
                <input
                    id="email"
                    v-model="email"
                    type="email"
                    name="email"
                >
            </div>

            <div class="sign-up-form__label">
                <label for="password">Password</label>
            </div>
            <div class="sign-up-form__input">
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    name="password"
                >
            </div>

            <div class="sign-up-form__label">
                <label for="nickname">Nickname</label>
            </div>
            <div class="sign-up-form__input">
                <input
                    id="nickname"
                    v-model="nickname"
                    type="nickname"
                    name="nickname"
                >
            </div>

            <div class="sign-up-form__label">
                <label for="driving-since">Driving since</label>
            </div>
            <div class="sign-up-form__input">
                <input
                    id="driving-since"
                    v-model="drivingSince"
                    type="number"
                    name="driving-since"
                    min="1910"
                >
            </div>

            <div class="sign-up-form__label">
                <label for="vehicle">Vehicle</label>
            </div>
            <div class="sign-up-form__input">
                <input
                    id="bike"
                    v-model="bike"
                    type="checkbox"
                    name="vehicle"
                    value="bike"
                    class="sign-up-form__input-checkbox"
                >
                <label for="bike">bike</label>

                <input
                    id="car"
                    v-model="car"
                    type="checkbox"
                    name="vehicle"
                    value="car"
                    class="sign-up-form__input-checkbox"
                >
                <label for="car">car</label>

                <input
                    id="bus"
                    v-model="bus"
                    type="checkbox"
                    name="vehicle"
                    value="bus"
                    class="sign-up-form__input-checkbox"
                >
                <label for="bus">bus</label>

                <input
                    id="van"
                    v-model="van"
                    type="checkbox"
                    name="vehicle"
                    value="van"
                    class="sign-up-form__input-checkbox"
                >
                <label for="van">van</label>

                <input
                    id="truck"
                    v-model="truck"
                    type="checkbox"
                    name="vehicle"
                    value="truck"
                    class="sign-up-form__input-checkbox"
                >
                <label for="truck">truck</label>

                <input
                    id="tramway"
                    v-model="tramway"
                    type="checkbox"
                    name="vehicle"
                    value="tramway"
                    class="sign-up-form__input-checkbox"
                >
                <label for="tramway">tramway</label>
            </div>

            <div class="sign-up-form__label">
                <label for="sex">Sex</label>
            </div>
            <div class="sign-up-form__input">
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

            <div class="sign-up-form__label">
                <label for="born-in-year">Born</label>
            </div>
            <div class="sign-up-form__input">
                <input
                    id="born-in-year"
                    v-model="bornInYear"
                    type="number"
                    name="born-in-year"
                    min="1910"
                >
            </div>

            <div class="sign-up-form__label">
                <label for="region">Region</label>
            </div>
            <div class="sign-up-form__input">
                <select
                    id="region"
                    v-model="region"
                >
                    <option>A value</option>
                </select>
            </div>

            <div class="sign-up-form__label">
                <label for="education">Education</label>
            </div>
            <div class="sign-up-form__input">
                <select
                    id="education"
                    v-model="education"
                >
                    <option>A value</option>
                </select>
            </div>

            <div class="sign-up-form__label">
                <label for="share-profile">Share Profile</label>
            </div>
            <div class="sign-up-form__input">
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

        <p>
            <Submit value="Finished" />
        </p>
    </form>
</template>

<script>

import Submit from '@/components/atoms/Submit.vue';

export default {
  name: 'SignUpForm',
  components: {
    Submit,
  },
  data: () => ({
    errors: [],
    email: null,
    password: null,
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
    region: null,
    education: null,
    onlyNickname: null,
    everything: null,
  }),
  methods: {
    checkForm(e) {
      this.errors = [];

      if (!this.email) {
        this.errors.push('Email required.');
      }
      if (!this.password) {
        this.errors.push('Password required.');
      }
      if (!this.nickname) {
        this.errors.push('Nickname required.');
      }
      if (!this.drivingSince) {
        this.errors.push('Driving since required.');
      }
      if (!this.bike && !this.car && !this.bus && !this.van && !this.truck && !this.tramway) {
        this.errors.push('Vehicle required.');
      }
      if (!this.male && !this.female) {
        this.errors.push('Gender required.');
      }
      if (!this.bornInYear) {
        this.errors.push('Born in year required.');
      }
      if (!this.region) {
        this.errors.push('Region required.');
      }
      if (!this.education) {
        this.errors.push('Education required.');
      }
      if (!this.onlyNickname && !this.everything) {
        this.errors.push('Share profile required.');
      }

      e.preventDefault();

      if (this.errors.length === 0) {
        this.$router.push('/');
      }

      return this.errors.length !== 0;
    },
  },
};
</script>


<style lang="scss">
#sign-up-form-wrapper {
    display: grid;
    grid-template-columns: 0.3fr 1fr;
    margin-top: 40px;
}

.sign-up-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.sign-up-form__input {
    margin-bottom: 20px;
}

.sign-up-form__input > input {
    width: 40%;
    height:  20px;
    border-radius: 3px;
    border: 1px solid #cccccc
}

.sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
}
</style>
