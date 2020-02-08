<template>
  <div class="complete-profile__wrapper">
    <div>
      <h2>{{ $t('complete-profile.heading') }}</h2>
      <ValidationObserver ref="form" v-slot="{ passes, invalid }">
        <form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
          <div id="complete-profile-form-wrapper">
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

          <div v-if="error">
            <strong class="sign-up-form__errors-heading">
              {{ error }}
            </strong>
          </div>

          <Submit :value="$t('profile.finish-button')" />
        </form>
      </ValidationObserver>

      <div id="sign-up-form-success" v-if="success === true">
        <p>{{ $t('sign-up.success-message') }}</p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'sign-up',
  components: {
  },
};
</script>

<style>
.complete-profile__wrapper{
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
    grid-template-columns: 0.5fr 0.5fr;
}
</style>
