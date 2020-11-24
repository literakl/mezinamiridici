<template>
  <div>
    <label for="share-profile">{{ $t('profile.share-profile') }}</label>
    <b-row>
      <Radio
        class="pl-3"
        v-model="share"
        identifier="public"
        :label="$t('profile.public')"
        name="share-profile"/>
      <Radio
        class="pl-3"
        v-model="share"
        identifier="private"
        :label="$t('profile.private')"
        name="share-profile"/>
    </b-row>

    <Datepicker
      :label="$t('profile.driving-since-label')"
      v-model="drivingSince"
      format="yyyy"
      minimumView="year"
      type="number"
      :disabled-dates="drivingDateScope"
      :typeable="true"
      name="driving-since"/>

    <div>
      <label for="vehicle">{{ $t('profile.vehicles-label') }}</label>
    </div>
    <b-row>
      <Checkbox
        class="pl-3"
        v-model="bike"
        :label="$t('profile.vehicles.bike')"
        name="vehicle"
        identifier="bike"/>
      <Checkbox
        class="pl-3"
        v-model="car"
        :label="$t('profile.vehicles.car')"
        name="vehicle"
        identifier="car"/>
      <Checkbox
        class="pl-3"
        v-model="bus"
        :label="$t('profile.vehicles.bus')"
        name="vehicle"
        identifier="bus"/>
      <Checkbox
        class="pl-3"
        v-model="van"
        :label="$t('profile.vehicles.van')"
        name="vehicle"
        identifier="van"/>
      <Checkbox
        class="pl-3"
        v-model="truck"
        :label="$t('profile.vehicles.truck')"
        name="vehicle"
        identifier="truck"/>
      <Checkbox
        class="pl-3"
        v-model="tramway"
        :label="$t('profile.vehicles.tramway')"
        name="vehicle"
        identifier="tramway"/>
    </b-row>

    <label class="pt-3" for="sex">{{ $t('profile.sex') }}</label>
    <b-row>
      <Radio
        class="pl-3"
        v-model="sex"
        :label="$t('profile.sexes.man')"
        name="sex"
        identifier="man"/>
      <Radio
        class="pl-3"
        v-model="sex"
        :label="$t('profile.sexes.woman')"
        name="sex"
        identifier="woman"/>
    </b-row>

    <Datepicker
      :label="$t('profile.born')"
      v-model="bornInYear"
      format="yyyy"
      type="number"
      minimumView="year"
      :disabled-dates="bornDateScope"
      :typeable="true"
      name="born"/>

    <label for="region">{{ $t('profile.region') }}</label>
    <div>
      <select id="region" v-model="region">
        <option value="">{{ $t('sign-up.region-options') }}</option>
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

    <label class="pt-3" for="education">{{ $t('profile.education') }}</label>
    <b-row class="pb-3">
      <Radio
        class="pl-3"
        v-model="education"
        :label="$t('profile.educations.primary')"
        name="education"
        identifier="primary"/>
      <Radio
        class="pl-3"
        v-model="education"
        :label="$t('profile.educations.secondary')"
        name="education"
        identifier="secondary"/>
      <Radio
        class="pl-3"
        v-model="education"
        :label="$t('profile.educations.university')"
        name="education"
        identifier="university"/>
    </b-row>

    <label class="pt-3">{{ $t('edit-profile.urls') }}</label>
    <b-row class="pb-2">
      <b-form-input v-model="urls[0]" :placeholder="$t('edit-profile.enter-url')" class="w-50"></b-form-input>
    </b-row>
    <b-row class="pb-2">
      <b-form-input v-model="urls[1]" :placeholder="$t('edit-profile.enter-url')" class="w-50"></b-form-input>
    </b-row>
    <b-row class="pb-2">
      <b-form-input v-model="urls[2]" :placeholder="$t('edit-profile.enter-url')" class="w-50"></b-form-input>
    </b-row>
  </div>
</template>

<script>
import Datepicker from '@/components/atoms/Datepicker.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import Radio from '@/components/atoms/Radio.vue';
import { BRow, BFormInput } from 'bootstrap-vue';

export default {
  components: {
    Datepicker,
    Checkbox,
    Radio,
    BRow,
    BFormInput,
  },
  props: {
    formData: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    drivingSince: null,
    bike: false,
    car: false,
    bus: false,
    van: false,
    truck: false,
    tramway: false,
    sex: null,
    bornInYear: null,
    region: '',
    education: '',
    share: 'public',
    drivingDateScope: {
      to: new Date(1935, 0, 1),
      from: new Date(),
    },
    bornDateScope: {
      to: new Date(1915, 0, 1),
      from: new Date(),
    },
    urls: ['', '', ''],
  }),
  watch: {
    drivingSince() {
      this.$emit('update', { drivingSince: this.drivingSince });
    },
    bike() {
      this.$emit('update', { bike: this.bike });
    },
    car() {
      this.$emit('update', { car: this.car });
    },
    bus() {
      this.$emit('update', { bus: this.bus });
    },
    van() {
      this.$emit('update', { van: this.van });
    },
    truck() {
      this.$emit('update', { truck: this.truck });
    },
    tramway() {
      this.$emit('update', { tramway: this.tramway });
    },
    sex() {
      this.$emit('update', { sex: this.sex });
    },
    bornInYear() {
      this.$emit('update', { bornInYear: this.bornInYear });
    },
    region() {
      this.$emit('update', { region: this.region });
    },
    education() {
      this.$emit('update', { education: this.education });
    },
    share() {
      this.$emit('update', { share: this.share });
    },
    urls() {
      this.$emit('update', { urls: this.urls });
    },
  },
  created() {
    // eslint-disable-next-line
    for (const property in this.formData) {
      this[property] = this.formData[property];
    }
  },
};
</script>
