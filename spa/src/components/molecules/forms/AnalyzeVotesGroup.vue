<template>
    <div>
        <div class="analyze-votes-group__wrapper">
            <div>
                <label for="sex">Sex</label>
            </div>
            <div>
                <Radio v-model="sex" name="sex" identifier="male" text="Male" />
                <Radio v-model="sex" name="sex" identifier="female" text="Female" />
            </div>

            <div>
                <label for="age">Age</label>
            </div>
            <div>
                <Checkbox v-model="ageLessThan25" name="age" identifier="<25" text="<25" />
                <Checkbox v-model="age26To35" name="age" identifier="26-35" text="26-35" />
                <Checkbox v-model="age36To50" name="age" identifier="36-50" text="36-50" />
                <Checkbox v-model="age51To60" name="age" identifier="51-60" text="51-60" />
                <Checkbox v-model="age61Plus" name="age" identifier="61+" text="61+" />
            </div>

            <div>
                <label for="driving-for-years">Driving for years</label>
            </div>
            <div>
                <Checkbox v-model="drivingFor0To2" name="driving-for-years" identifier="0-2" text="0-2" />
                <Checkbox v-model="drivingFor2To5" name="driving-for-years" identifier="2-5" text="2-5" />
                <Checkbox v-model="drivingFor6To10" name="driving-for-years" identifier="6-10" text="6-10" />
                <Checkbox v-model="drivingFor11Plus" name="driving-for-years" identifier="11+" text="11+" />
            </div>

            <div>
                <label for="region">Region</label>
            </div>
            <div>
                <select
                    id="region"
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
                <label for="education">Education</label>
            </div>
            <div>
                <select
                    id="education"
                    v-model="education"
                >
                    <option value="">Please select</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="university">University</option>
                </select>
            </div>

            <div>
                <label for="vehicle">Vehicle</label>
            </div>
            <div>
                <Checkbox v-model="bike" name="vehicle" identifier="bike" text="Bike" />
                <Checkbox v-model="car" name="vehicle" identifier="car" text="Car" />
                <Checkbox v-model="bus" name="vehicle" identifier="bus" text="Bus" />
                <Checkbox v-model="van" name="vehicle" identifier="van" text="Van" />
                <Checkbox v-model="truck" name="vehicle" identifier="truck" text="Truck" />
                <Checkbox v-model="tramway" name="vehicle" identifier="tramway" text="Tramway" />
            </div>
        </div>
    </div>
</template>

<script>
import Radio from '@/components/atoms/Radio.vue'
import Checkbox from '@/components/atoms/Checkbox.vue'
import Button from '@/components/atoms/Button.vue'

export default {
  name: 'analyze-votes-group',
  components: {
      Radio,
      Checkbox,
      Button
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