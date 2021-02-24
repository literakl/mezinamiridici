<template>
  <div class="">
    <b-form>
      <div class="group-one">
      <b-form-group :label="$t('poll.analysis.driving_time')" label-cols-sm="4">
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
      <b-form-group :label="$t('poll.analysis.age')" label-cols-sm="4">
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
      <b-form-group :label="$t('poll.analysis.sex')" label-cols-sm="4">
        <b-form-checkbox-group id="sex" v-model="group.sex" name="sex" class="align-nicely">
          <b-form-checkbox value="man">{{ $t('poll.analysis.men') }}</b-form-checkbox>
          <b-form-checkbox value="woman">{{ $t('poll.analysis.women') }}</b-form-checkbox>
          <span></span>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.education')" label-cols-sm="4" class="pb-0">
        <b-form-checkbox-group id="edu" v-model="group.edu" name="edu" class="align-nicely">
          <b-form-checkbox value="primary">{{ $t('poll.analysis.edu-primary') }}</b-form-checkbox>
          <b-form-checkbox value="secondary">{{ $t('poll.analysis.edu-secondary') }}</b-form-checkbox>
          <b-form-checkbox value="university">{{ $t('poll.analysis.edu-university') }}</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.vehicles')" label-cols-sm="4">
         <b-form-checkbox-group id="vehicle" v-model="group.edu" name="vehicle" class="col-two">
          <div><b-form-checkbox value="bike">{{ $t('profile.vehicles.bike') }}</b-form-checkbox>
          <b-form-checkbox value="bus">{{ $t('profile.vehicles.bus') }}</b-form-checkbox>
          <b-form-checkbox value="car">{{ $t('profile.vehicles.car') }}</b-form-checkbox>
          </div>
          <div>
          <b-form-checkbox value="truck">{{ $t('profile.vehicles.truck') }}</b-form-checkbox>
          <b-form-checkbox value="van">{{ $t('profile.vehicles.van') }}</b-form-checkbox>
          </div>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group :label="$t('poll.analysis.regions')" label-cols-sm="4">
        <b-form-checkbox-group id="regions" v-model="group.edu" name="regions" class="align-nicely col-two">
          <div>
            <b-form-checkbox value="PRG">{{ $t('profile.regions.PRG') }}</b-form-checkbox>
            <b-form-checkbox value="SC">{{ $t('profile.regions.SC') }}</b-form-checkbox>
            <b-form-checkbox value="JC">{{ $t('profile.regions.JC') }}</b-form-checkbox>
            <b-form-checkbox value="PLS">{{ $t('profile.regions.PLS') }}</b-form-checkbox>
            <b-form-checkbox value="KV">{{ $t('profile.regions.KV') }}</b-form-checkbox>
            <b-form-checkbox value="UST">{{ $t('profile.regions.UST') }}</b-form-checkbox>
            <b-form-checkbox value="LBR">{{ $t('profile.regions.LBR') }}</b-form-checkbox>
          </div>
          <div>
            <b-form-checkbox value="KH">{{ $t('profile.regions.KH') }}</b-form-checkbox>
            <b-form-checkbox value="PRD">{{ $t('profile.regions.PRD') }}</b-form-checkbox>
            <b-form-checkbox value="VSC">{{ $t('profile.regions.VSC') }}</b-form-checkbox>
            <b-form-checkbox value="JM">{{ $t('profile.regions.JM') }}</b-form-checkbox>
            <b-form-checkbox value="OLM">{{ $t('profile.regions.OLM') }}</b-form-checkbox>
            <b-form-checkbox value="ZLN">{{ $t('profile.regions.ZLN') }}</b-form-checkbox>
            <b-form-checkbox value="MS">{{ $t('profile.regions.MS') }}</b-form-checkbox>
          </div>
          </b-form-checkbox-group>
      </b-form-group>
      </div>
    </b-form>
  </div>
</template>

<script>
import { BFormGroup, BForm, BInputGroup, BFormInput, BFormCheckbox,
  BFormCheckboxGroup, BInputGroupAppend, BInputGroupText } from 'bootstrap-vue';

export default {
  name: 'SeriesForm',
  components: {
    BFormGroup, BForm, BInputGroup, BFormInput, BFormCheckbox, BFormCheckboxGroup, BInputGroupAppend, BInputGroupText,
  },
  props: {
    group: Object,
    id: String,
  },
  data() {
    return {
    };
  },
};
</script>

<style>
.group-one { font-size: 14px;}
.group-one .input-group-text{font-size: 14px;}
fieldset.label{
  display: flex;
}
  .campbox-one{
    margin-bottom: 15px;
  }
  .group-one .form-row{
    align-items: flex-start;
  }
.group-one .form-row .col-sm-4 {
  padding: 0px 5px 5px;
}
.col-two{
  display: flex;
}
.col-two div{
  width: 48%;
}
@media (max-width: 1050px) {
  .group-one .form-row .col-sm-4{
    width: 100%!important;
        max-width: 100%!important;
  }
  .group-one .form-row{
    flex-direction: column;
  }
  .group-one .form-row select{ color: var(--text-color-light);}
  .group-one .input-group-text{
    font-size: 14px;
  }
}
</style>
