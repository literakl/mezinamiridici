<template>
  <div>
    <b-form>
      <b-form-group label="Driving:" label-cols-sm="2">
        <b-input-group class="mb-1">
          <b-form-input aria-label="Minimum" placeholder="From"
                        v-model="group.drivingMin" type="number" min="0">
          </b-form-input>
          <b-form-input aria-label="Maximum" placeholder="To"
                        v-model="group.drivingMax" type="number" min="0">
          </b-form-input>
          <b-input-group-append>
            <b-input-group-text>years</b-input-group-text>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <b-form-group label="Age:" label-cols-sm="2">
        <b-input-group class="mb-1">
          <b-form-input aria-label="Minimum" placeholder="From"
                        v-model="group.ageMin" type="number" min="0">
          </b-form-input>
          <b-form-input aria-label="Maximum" placeholder="To"
                        v-model="group.ageMax" type="number" min="0">
          </b-form-input>
          <b-input-group-append>
            <b-input-group-text>years</b-input-group-text>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <b-form-group label="Sex:" label-cols-sm="2">
        <b-form-checkbox-group id="sex" v-model="group.sex" name="sex" class="align-nicely mt-2">
          <b-form-checkbox value="men">Men</b-form-checkbox>
          <b-form-checkbox value="women">Women</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group label="Education:" label-cols-sm="2" class="pb-0">
        <b-form-checkbox-group id="edu" v-model="group.education" name="edu" class="align-nicely mt-2">
          <b-form-checkbox value="primary">Primary</b-form-checkbox>
          <b-form-checkbox value="secondary">Secondary</b-form-checkbox>
          <b-form-checkbox value="university">University</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group label="Vehicles:" label-cols-sm="2">
        <b-form-checkbox-group id="vehicle" v-model="group.vehicles" name="vehicle" class="align-nicely mt-2">
          <b-form-checkbox value="bike">Bike</b-form-checkbox>
          <b-form-checkbox value="bus">Bus</b-form-checkbox>
          <b-form-checkbox value="car">Car</b-form-checkbox>
          <b-form-checkbox value="truck">Truck</b-form-checkbox>
          <b-form-checkbox value="van">Van</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group label="Regions:" label-cols-sm="2">
        <b-form-checkbox-group id="region" v-model="group.regions" name="region" class="align-nicely mt-2">
          <b-form-checkbox value="PRG">{{ $t('profile.regions.PRG') }}</b-form-checkbox>
          <b-form-checkbox value="SC">{{ $t('profile.regions.SC') }}</b-form-checkbox>
          <b-form-checkbox value="JC">{{ $t('profile.regions.JC') }}</b-form-checkbox>
          <b-form-checkbox value="PLS">{{ $t('profile.regions.PLS') }}</b-form-checkbox>
          <b-form-checkbox value="KV">{{ $t('profile.regions.KV') }}</b-form-checkbox>
          <b-form-checkbox value="UST">{{ $t('profile.regions.UST') }}</b-form-checkbox>
          <b-form-checkbox value="LBR">{{ $t('profile.regions.LBR') }}</b-form-checkbox>
          <b-form-checkbox value="KH">{{ $t('profile.regions.KH') }}</b-form-checkbox>
          <b-form-checkbox value="PRD">{{ $t('profile.regions.PRD') }}</b-form-checkbox>
          <b-form-checkbox value="VSC">{{ $t('profile.regions.VSC') }}</b-form-checkbox>
          <b-form-checkbox value="JM">{{ $t('profile.regions.JM') }}</b-form-checkbox>
          <b-form-checkbox value="OLM">{{ $t('profile.regions.OLM') }}</b-form-checkbox>
          <b-form-checkbox value="ZLN">{{ $t('profile.regions.ZLN') }}</b-form-checkbox>
          <b-form-checkbox value="MS">{{ $t('profile.regions.MS') }}</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
export default {
  name: 'SeriesForm',
  props: {
    group: Object,
  },
  methods: {},
};
</script>

<style>
  .align-nicely {
    display: grid;
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    grid-template-columns: 1fr 1fr 1fr;
  }
</style>
