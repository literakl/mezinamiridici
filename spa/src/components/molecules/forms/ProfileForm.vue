







<!-- TOO this is unused curently because I do not know how to propagate data up -->





<template>
  <div>
    <div class="sign-up-form__label">
      <label for="share-profile">{{ $t('profile.share-profile') }}</label>
    </div>
    <div class="sign-up-form__input">
      <Radio
        v-model="share"
        identifier="public"
        :label="$t('profile.public')"
        name="share-profile"
      />
      <Radio
        v-model="share"
        identifier="private"
        :label="$t('profile.private')"
        name="share-profile"
      />
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
      name="born"
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
</template>

<script>
import Radio from '@/components/atoms/Radio.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import TextInput from '@/components/atoms/TextInput.vue';


export default {
  name: 'ProfileForm',
  components: {
    TextInput,
    Checkbox,
    Radio,
  },
};
</script>

<style lang="scss">
</style>
