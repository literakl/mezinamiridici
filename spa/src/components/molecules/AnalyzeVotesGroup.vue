<template>
    <div>
        <div class="analyze-votes-group__wrapper">
            <div>
                <label :for="'sex' + group">Sex</label>
            </div>
            <div>
                <Radio v-model="sex" :name="'sex' + group" :identifier="'male' + group" text="Male" />
                <Radio v-model="sex" :name="'sex' + group" :identifier="'female' + group" text="Female" />
            </div>

            <div>
                <label :for="'age' + group">Age</label>
            </div>
            <div>
                <Checkbox v-model="ageLessThan25" :name="'age' + group" :identifier="'<25' + group" text="<25" />
                <Checkbox v-model="age26To35" :name="'age' + group" :identifier="'26-35' + group" text="26-35" />
                <Checkbox v-model="age36To50" :name="'age' + group" :identifier="'36-50' + group" text="36-50" />
                <Checkbox v-model="age51To60" :name="'age' + group" :identifier="'51-60' + group" text="51-60" />
                <Checkbox v-model="age61Plus" :name="'age' + group" :identifier="'61+' + group" text="61+" />
            </div>

            <div>
                <label :for="'driving-for-years' + group">Driving for years</label>
            </div>
            <div>
                <Checkbox v-model="drivingFor0To2" :name="'driving-for-years' + group" :identifier="'0-2' + group" text="0-2" />
                <Checkbox v-model="drivingFor2To5" :name="'driving-for-years' + group" :identifier="'2-5' + group" text="2-5" />
                <Checkbox v-model="drivingFor6To10" :name="'driving-for-years' + group" :identifier="'6-10' + group" text="6-10" />
                <Checkbox v-model="drivingFor11Plus" :name="'driving-for-years' + group" :identifier="'11+' + group" text="11+" />
            </div>

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

            <div>
                <label :for="'education' + group">Education</label>
            </div>
            <div>
                <select
                    :id="'education' + group"
                    v-model="education"
                >
                    <option value="">Please select</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="university">University</option>
                </select>
            </div>

            <div>
                <label :for="'vehicle' + group">Vehicle</label>
            </div>
            <div>
                <Checkbox v-model="bike" :name="'vehicle' + group" :identifier="'bike' + group" text="Bike" />
                <Checkbox v-model="car" :name="'vehicle' + group" :identifier="'car' + group" text="Car" />
                <Checkbox v-model="bus" :name="'vehicle' + group" :identifier="'bus' + group" text="Bus" />
                <Checkbox v-model="van" :name="'vehicle' + group" :identifier="'van' + group" text="Van" />
                <Checkbox v-model="truck" :name="'vehicle' + group" :identifier="'truck' + group" text="Truck" />
                <Checkbox v-model="tramway" :name="'vehicle' + group" :identifier="'tramway' + group" text="Tramway" />
            </div>
        </div>
    </div>
</template>

<script>
import Radio from '@/components/atoms/Radio.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';

export default {
  name: 'analyze-votes-group',
  props: {
    group: String,
  },
  components: {
    Radio,
    Checkbox,
  },
  methods: {
  },
};
</script>

<style>
.analyze-votes-group__wrapper {
    display: grid;
    grid-template-columns: 0.3fr 1fr;
    margin-bottom: 20px;
    grid-gap:  20px;
}
</style>
