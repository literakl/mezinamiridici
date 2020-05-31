<template>
  <div class="container-fluid">
    <b-form>
      <b-form-group :label="$t('poll.analysis.driving_time')" label-cols-sm="2">
        <b-input-group class="mb-1">
          <b-form-input :aria-label="$t('poll.analysis.from')" :placeholder="$t('poll.analysis.from')"
                        v-model="group.drivingMin" type="number" min="0">
          </b-form-input>
          <b-form-input :aria-label="$t('poll.analysis.to')" :placeholder="$t('poll.analysis.to')"
                        v-model="group.drivingMax" type="number" min="0">
          </b-form-input>
          <b-input-group-append>
            <b-input-group-text>{{ $t('poll.analysis.years') }}</b-input-group-text>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.age')" label-cols-sm="2">
        <b-input-group class="mb-1">
          <b-form-input :aria-label="$t('poll.analysis.from')" :placeholder="$t('poll.analysis.from')"
                        v-model="group.ageMin" type="number" min="0">
          </b-form-input>
          <b-form-input :aria-label="$t('poll.analysis.to')" :placeholder="$t('poll.analysis.to')"
                        v-model="group.ageMax" type="number" min="0">
          </b-form-input>
          <b-input-group-append>
            <b-input-group-text>{{ $t('poll.analysis.years') }}</b-input-group-text>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.sex')" label-cols-sm="2">
        <b-form-checkbox-group id="sex" v-model="group.sex" name="sex" class="align-nicely mt-2">
          <b-form-checkbox value="man">{{ $t('poll.analysis.men') }}</b-form-checkbox>
          <b-form-checkbox value="woman">{{ $t('poll.analysis.women') }}</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.education')" label-cols-sm="2" class="pb-0">
        <b-form-checkbox-group id="edu" v-model="group.edu" name="edu" class="align-nicely mt-2">
          <b-form-checkbox value="primary">{{ $t('profile.educations.primary') }}</b-form-checkbox>
          <b-form-checkbox value="secondary">{{ $t('profile.educations.secondary') }}</b-form-checkbox>
          <b-form-checkbox value="university">{{ $t('profile.educations.university') }}</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.vehicles')" label-cols-sm="2">
        <b-form-checkbox-group id="vehicle" v-model="group.vehicles" name="vehicle" class="align-nicely mt-2">
          <b-form-checkbox value="bike">{{ $t('profile.vehicles.bike') }}</b-form-checkbox>
          <b-form-checkbox value="bus">{{ $t('profile.vehicles.bus') }}</b-form-checkbox>
          <b-form-checkbox value="car">{{ $t('profile.vehicles.car') }}</b-form-checkbox>
          <b-form-checkbox value="truck">{{ $t('profile.vehicles.truck') }}</b-form-checkbox>
          <b-form-checkbox value="van">{{ $t('profile.vehicles.van') }}</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.regions')" label-cols-sm="2">
        <b-form-checkbox-group id="region" v-model="group.region" name="region" class="align-nicely mt-2">
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
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  }
</style>
