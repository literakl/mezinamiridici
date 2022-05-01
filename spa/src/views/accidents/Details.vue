<template>
  <div>
    <h2>
      Statistiky nehod pro {{ formattedDate }}
      <b-button @click="openPicker" size="sm" variant="link">
        <BIconCalendarDate scale="1.3"/>
      </b-button>
    </h2>
    <datepicker
      ref="programaticOpen"
      v-model="selectedDay"
      minimumView="day"
      :disabled-dates="statsScope"
      name="daySelector"
      :language="csLocale"
      :monday-first="true"
      :bootstrap-styling="true"
      input-class="hide-input"
    />
    <content-loader
      :height="820"
      :width="600"
      :speed="8"
      v-if="inProgress"
    >
      <rect x="0" y="0" rx="3" ry="3" width="600" height="800"/>
    </content-loader>
    <div v-if="!inProgress && thisDay" class="blog-posts pt-3 m-auto">
      <div class="stats-wrap">
        <div class="stats-result table-responsive">
          <table class="table table-hover table-sm table-bordered text-center">
            <thead>
            <tr>
              <th scope="col">Kraj</th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet nehod</span></span>
              <img src="/images/icons/crash.png" width="48" height="48" alt="Počet nehod">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet úmrtí</span></span>
              <img src="/images/icons/tombstone.png" width="48" height="48" alt="Počet úmrtí">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet těžkých zranění</span></span>
              <img src="/images/icons/ambulance.png" width="48" height="48" alt="Počet těžkých zranění">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet lehkých zranění</span></span>
              <img src="/images/icons/minor_injuries.png" width="48" height="48" alt="Počet lehkých zranění">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Nepřiměřená rychlost</span></span>
              <img src="/images/icons/reason_speed.png" width="48" height="48" alt="Nepřiměřená rychlost">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Nedání přednosti v jízdě</span></span>
              <img src="/images/icons/reason_give_way.png" width="48" height="48" alt="Nedání přednosti v jízdě">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Nesprávné předjížděn</span></span>
              <img src="/images/icons/reason_passing.png" width="48" height="48" alt="Nesprávné předjížděn">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Pod vlivem návykových látek</span></span>
              <img src="/images/icons/reason_drunk.png" width="48" height="48" alt="Pod vlivem návykových látek">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Nesprávný způsob jízdy</span></span>
              <img src="/images/icons/reason_mistake.png" width="48" height="48" alt="Nesprávný způsob jízdy">
            </span>
              </th>
              <th scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Jiná příčina</span></span>
              <img src="/images/icons/reason_other.png" width="48" height="48" alt="Jiná příčina">
            </span>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="region in thisDay.regions" :key="region.region">
              <td>{{ REGIONS[region.region] }}</td>
              <td>{{ region.count }}</td>
              <td>{{ region.impact.deaths }}</td>
              <td>{{ region.impact.severely }}</td>
              <td>{{ region.impact.slightly }}</td>
              <td>{{ region.reason.speed }}</td>
              <td>{{ region.reason.giveway }}</td>
              <td>{{ region.reason.passing }}</td>
              <td>{{ region.reason.drunk }}</td>
              <td>{{ region.reason.mistake }}</td>
              <td>{{ region.reason.other }}</td>
            </tr>
            <tr>
              <td>Celkem</td>
              <td>{{ thisDay.total.count }}</td>
              <td>{{ thisDay.total.impact.deaths }}</td>
              <td>{{ thisDay.total.impact.severely }}</td>
              <td>{{ thisDay.total.impact.slightly }}</td>
              <td>{{ thisDay.total.reason.speed }}</td>
              <td>{{ thisDay.total.reason.giveway }}</td>
              <td>{{ thisDay.total.reason.passing }}</td>
              <td>{{ thisDay.total.reason.drunk }}</td>
              <td>{{ thisDay.total.reason.mistake }}</td>
              <td>{{ thisDay.total.reason.other }}</td>
            </tr>
            </tbody>

          </table>
        </div>

        <h2 v-if="lastYear">Srovnání s předchozím rokem</h2>
        <div v-if="lastYear" style="overflow-x:auto;" class="stats-result table-responsive">
          <table class="table table-hover table-sm table-bordered text-center">
            <thead>
            <tr>
              <th>&nbsp;</th>
              <th colspan="2" scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet nehod</span></span>
              <img src="/images/icons/crash.png" width="48" height="48" alt="Počet nehod">
            </span>
              </th>
              <th colspan="2" scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet úmrtí</span></span>
              <img src="/images/icons/tombstone.png" width="48" height="48" alt="Počet úmrtí">
            </span>
              </th>
              <th colspan="2" scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet těžkých zranění</span></span>
              <img src="/images/icons/ambulance.png" width="48" height="48" alt="Počet těžkých zranění">
            </span>
              </th>
              <th colspan="2" scope="col">
            <span class="category-container" aria-haspopup="true" tabIndex="0">
              <span class="tooltip-box"><span class="tiptext">Počet lehkých zranění</span></span>
              <img src="/images/icons/minor_injuries.png" width="48" height="48" alt="Počet lehkých zranění">
            </span>
              </th>
            </tr>
            <tr>
              <th>&nbsp;</th>
              <th scope="col">{{ lastYearValue }}</th>
              <th scope="col">{{ thisYearValue }}</th>
              <th scope="col">{{ lastYearValue }}</th>
              <th scope="col">{{ thisYearValue }}</th>
              <th scope="col">{{ lastYearValue }}</th>
              <th scope="col">{{ thisYearValue }}</th>
              <th scope="col">{{ lastYearValue }}</th>
              <th scope="col">{{ thisYearValue }}</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Den</td>
              <td>{{ lastYear.day.count }}</td>
              <td>{{ thisYear.day.count }}</td>
              <td>{{ lastYear.day.impact.deaths }}</td>
              <td>{{ thisYear.day.impact.deaths }}</td>
              <td>{{ lastYear.day.impact.severely }}</td>
              <td>{{ thisYear.day.impact.severely }}</td>
              <td>{{ lastYear.day.impact.slightly }}</td>
              <td>{{ thisYear.day.impact.slightly }}</td>
            </tr>
            <tr>
              <td>Měsíc</td>
              <td>{{ lastYear.month.count }}</td>
              <td>{{ thisYear.month.count }}</td>
              <td>{{ lastYear.month.impact.deaths }}</td>
              <td>{{ thisYear.month.impact.deaths }}</td>
              <td>{{ lastYear.month.impact.severely }}</td>
              <td>{{ thisYear.month.impact.severely }}</td>
              <td>{{ lastYear.month.impact.slightly }}</td>
              <td>{{ thisYear.month.impact.slightly }}</td>
            </tr>
            <tr>
              <td>Rok</td>
              <td>{{ lastYear.year.count }}</td>
              <td>{{ thisYear.year.count }}</td>
              <td>{{ lastYear.year.impact.deaths }}</td>
              <td>{{ thisYear.year.impact.deaths }}</td>
              <td>{{ lastYear.year.impact.severely }}</td>
              <td>{{ thisYear.year.impact.severely }}</td>
              <td>{{ lastYear.year.impact.slightly }}</td>
              <td>{{ thisYear.year.impact.slightly }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <br>
      </div>
    </div>
  </div>
</template>

<script>
import { show, getDateWithOffset } from '@/utils/dateUtils';
import Datepicker from 'vuejs-datepicker';
import { cs } from 'vuejs-datepicker/dist/locale';
import { BButton, BIconCalendarDate } from 'bootstrap-vue';
import { ContentLoader } from 'vue-content-loader';

export default {
  name: 'AccidentsDetails',
  props: {
    day: String,
  },
  components: {
    BButton,
    BIconCalendarDate,
    ContentLoader,
    Datepicker,
  },
  data() {
    return {
      selectedDay: null,
      date: null,
      lastYearValue: null,
      thisYearValue: null,
      thisDay: null,
      lastYear: null,
      thisYear: null,
      inProgress: false,
      csLocale: cs,
      REGIONS: {
        PRG: 'Praha',
        SC: 'Středočeský',
        JC: 'Jihočeský',
        PLS: 'Plzeňský',
        KV: 'Karlovarský',
        UST: 'Ústecký',
        LBR: 'Liberecký',
        KH: 'Královéhradecký',
        PRD: 'Pardubický',
        VSC: 'Vysočina',
        JM: 'Jihomoravský',
        OLM: 'Olomoucký',
        ZLN: 'Zlínský',
        MS: 'Moravskoslezský',
      },
      statsScope: {
        to: new Date(2009, 2, 10),
        from: getDateWithOffset(-1),
      },
    };
  },
  computed: {
    formattedDate() {
      if (this.selectedDay) {
        return show(this.selectedDay, 'dynamicDate');
      } else {
        return show(this.day, 'dynamicDate');
      }
    },
  },
  methods: {
    async loadStats(date) {
      this.inProgress = true;
      try {
        const response = await this.$store.dispatch('GET_ACCIDENTS', { day: date });
        this.thisDay = response.data.data.day;
        this.date = this.thisDay.date;
        this.lastYear = response.data.data.lastYear;
        this.thisYear = response.data.data.thisYear;
        this.lastYearValue = response.data.data.lastYearValue;
        this.thisYearValue = response.data.data.thisYearValue;
      } finally {
        this.inProgress = false;
      }
    },
    openPicker() {
      this.$refs.programaticOpen.showCalendar();
    },
  },
  watch: {
    async selectedDay() {
      const isoDate = show(this.selectedDay, 'ISO');
      await this.loadStats(isoDate);
      await this.$router.replace({ name: 'accidents-details', params: { day: isoDate } })
    },
  },
  async created() {
    await this.loadStats(this.day);
  },
};
</script>

<style scoped>
.stats-result {
  margin: 0;
  border-top: 3px solid #ddd;
  border-left: 3px solid #ddd;
  border-right: 3px solid #ddd;
  border-bottom: 3px solid #ddd;
  overflow: auto;
  background-color: #fff;
  padding: 0px;
}
.stats-wrap h2 {
  font-size: 1.2rem;
  line-height: 21px;
  padding: 7pt 12pt;
  margin: 0;
  margin-top: 25px;
  background: #e6eaef;
  color: #656b6f;
  border-radius: 4px 4px 0 0;
}
.stats-result table tr td {
  vertical-align: middle;
}
.stats-result table tr th {
  vertical-align: middle;
  background: linear-gradient(45deg, var(--color-darkgreen) 10%, var(--blue-theme) 90%);
}
.category-container {
  position: relative;
  display: inline-block;
}
.tooltip-box {
  opacity: 0;
  width: 10rem;
  transition: opacity 0.25s linear;
  text-align: center;
  color: #fff;
  position: absolute !important;
  left: calc(50% - 5rem);
  z-index: 100;
  top: 50px;
  box-sizing: border-box;
}
.tooltip-box .tiptext:hover {
  opacity: 0;
}
.tooltip-box .tiptext {
  width: 100%;
  background-color: #fbfbfb;
  color: grey;
  border: 1px solid #ddd;
  font-size: 12px;
  text-align: center;
  letter-spacing: -0.3px;
  border-radius: 5px;
  padding: 5px 5px;
  box-shadow: 0 4px 2px -2px rgba(203, 206, 212, 0.8);
  user-select: none;
  display: block;
}
.category-container:hover .tooltip-box,
.category-container:active .tooltip-box,
.category-container:focus .tooltip-box {
  opacity: 1;
}
</style>

<style>
.hide-input {
  display: none !important;
}
</style>
