<template>
  <div>
    <b-form>
      <b-form-group id="drivingYears-group" label="Driving:" label-cols-sm="2">
        <b-input-group class="mb-1">
          <b-form-input aria-label="Minimum" placeholder="From" v-model="group.drivingMin" type="number" min="0"></b-form-input>
          <b-form-input aria-label="Maximum" placeholder="To" v-model="group.drivingMax" type="number" max="90"></b-form-input>
          <b-input-group-append>
            <b-input-group-text>years</b-input-group-text>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <b-form-group id="age-group" label="Age:" label-cols-sm="2">
        <b-input-group class="mb-1">
          <b-form-input aria-label="Minimum" placeholder="From" v-model="group.ageMin" type="number" min="0"></b-form-input>
          <b-form-input aria-label="Maximum" placeholder="To" v-model="group.ageMax" type="number" max="105"></b-form-input>
          <b-input-group-append>
            <b-input-group-text>years</b-input-group-text>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <b-form-group id="sex-group" label="Sex:" label-cols-sm="2">
        <b-form-checkbox-group id="sex" v-model="group.sex" name="sex">
          <b-form-checkbox value="men">Men</b-form-checkbox>
          <b-form-checkbox value="women">Women</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group id="edu-group" label="Education:" label-cols-sm="2">
        <b-form-checkbox-group id="edu" v-model="group.education" name="edu">
          <b-form-checkbox value="primary">Primary</b-form-checkbox>
          <b-form-checkbox value="secondary">Secondary</b-form-checkbox>
          <b-form-checkbox value="university">University</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group id="vehicle-group" label="Vehicles:" label-cols-sm="2">
        <b-form-checkbox-group id="vehicle" v-model="group.vehicles" name="vehicle">
          <b-form-checkbox value="bike">Bike</b-form-checkbox>
          <b-form-checkbox value="bus">Bus</b-form-checkbox>
          <b-form-checkbox value="car">Car</b-form-checkbox>
          <b-form-checkbox value="truck">Truck</b-form-checkbox>
          <b-form-checkbox value="van">Van</b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
<!--      <div>

      <div>
        <label :for="'region' + group">Region</label>
      </div>
      <div>
        <select
          :id="'region' + group"
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
 -->   </b-form>
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
