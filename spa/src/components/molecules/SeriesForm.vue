<template>
  <div class="container-fluid">
    <b-form>
      <b-form-group :label="$t('poll.analysis.driving_time')" label-cols-sm="3">
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
      <b-form-group :label="$t('poll.analysis.age')" label-cols-sm="3">
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
      <b-form-group :label="$t('poll.analysis.sex')" label-cols-sm="3">
        <b-form-checkbox-group id="sex" v-model="group.sex" name="sex" class="align-nicely mt-2">
          <b-form-checkbox value="man">{{ $t('poll.analysis.men') }}</b-form-checkbox>
          <b-form-checkbox value="woman">{{ $t('poll.analysis.women') }}</b-form-checkbox>
          <span></span>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.education')" label-cols-sm="3" class="pb-0">
        <b-form-checkbox-group id="edu" v-model="group.edu" name="edu" class="align-nicely mt-2">
          <b-form-checkbox value="primary">{{ $t('poll.analysis.edu-primary') }}</b-form-checkbox>
          <b-form-checkbox value="secondary">{{ $t('poll.analysis.edu-secondary') }}</b-form-checkbox>
          <b-form-checkbox value="university">{{ $t('poll.analysis.edu-university') }}</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.vehicles')" label-cols-sm="3">
        <b-form-select :id="`vehicle${id}`"
                       v-model="group.vehicles"
                       :options="vehicleOptions"
                       multiple :select-size="3"
                       class="align-nicely mt-2">
        </b-form-select>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.regions')" label-cols-sm="3">
        <b-form-select :id="`region${id}`"
                       v-model="group.region"
                       :options="regionOptions"
                       multiple :select-size="3"
                       class="mt-2">
        </b-form-select>
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
export default {
  name: 'SeriesForm',
  props: {
    group: Object,
    id: String,
  },
  data() {
    return {
      vehicleOptions: [
        { value: 'bike', text: this.$t('profile.vehicles.bike') },
        { value: 'bus', text: this.$t('profile.vehicles.bus') },
        { value: 'car', text: this.$t('profile.vehicles.car') },
        { value: 'truck', text: this.$t('profile.vehicles.truck') },
        { value: 'van', text: this.$t('profile.vehicles.van') },
      ],
      regionOptions: [
        { value: 'PRG', text: this.$t('profile.regions.PRG') },
        { value: 'SC', text: this.$t('profile.regions.SC') },
        { value: 'JC', text: this.$t('profile.regions.JC') },
        { value: 'PLS', text: this.$t('profile.regions.PLS') },
        { value: 'KV', text: this.$t('profile.regions.KV') },
        { value: 'UST', text: this.$t('profile.regions.UST') },
        { value: 'LBR', text: this.$t('profile.regions.LBR') },
        { value: 'KH', text: this.$t('profile.regions.KH') },
        { value: 'PRD', text: this.$t('profile.regions.PRD') },
        { value: 'VSC', text: this.$t('profile.regions.VSC') },
        { value: 'JM', text: this.$t('profile.regions.JM') },
        { value: 'OLM', text: this.$t('profile.regions.OLM') },
        { value: 'ZLN', text: this.$t('profile.regions.ZLN') },
        { value: 'MS', text: this.$t('profile.regions.MS') },
      ],
    };
  },
};
</script>

<style>
  .align-nicely {
    display: grid;
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  }
</style>
