<template>
  <div class="info-box"  v-if="infoBoxContent">
    <span class="closebtn" @click="ignoreMessage()"><BIconXCircle scale='1'></BIconXCircle></span>
    <component v-if="infoBoxContent" :is="infoBoxContent"></component>
  </div>
</template>

<script>
import { BIconXCircle } from 'bootstrap-vue';
import { infoBoxes } from '../../../config/infoBox.json';

export default {
  name: 'InfoBox',
  components: {
    BIconXCircle,
  },
  data() {
    return {
      infoBoxContent: null,
      infoBoxId: null,
    };
  },
  mounted() {
    this.loadInfoBox();
  },
  methods: {
    loadInfoBox() {
      const userIgnored = this.checkIfIgnored();
      if (userIgnored) {
        return;
      }
      const validInfoBoxes = this.findValidInfoBoxes(infoBoxes);
      const randomIndex = this.randomNumber(validInfoBoxes.length);
      this.loadComponent(validInfoBoxes[randomIndex].template);
      this.infoBoxId = validInfoBoxes[randomIndex].id;
    },
    checkIfIgnored() {
      const millisInDay = 24 * 3600 * 1000;
      const infoBoxCloseDate = localStorage.getItem('infoBoxCloseDate');

      if (infoBoxCloseDate) {
        const ignoredDate = new Date(infoBoxCloseDate);
        const nowDate = new Date();

        if (nowDate - ignoredDate < millisInDay) {
          return true;
        }
      }
      return false;
    },
    findValidInfoBoxes(list) {
      const stageOneFiltered = this.filterByDate(list);
      const stageTwoFiltered = this.filterByUserPreferences(stageOneFiltered);
      return stageTwoFiltered;
    },
    filterByDate(list) {
      const filteredList = [];

      for (let i = 0; i < list.length; i += 1) {
        const startDate = new Date(list[i].since);
        const endDate = new Date(list[i].to);
        const currentDate = new Date();

        if (currentDate > startDate && currentDate <= endDate) {
          filteredList.push(list[i]);
        }
      }
      return filteredList;
    },
    filterByUserPreferences(list) {
      const ignoredInfoBoxes = localStorage.getItem('ignoredInfoBoxes');
      let ignoredList;
      if (ignoredInfoBoxes) {
        ignoredList = JSON.parse(ignoredInfoBoxes);
      } else {
        ignoredList = [];
      }
      const filteredList = [];

      for (let i = 0; i < list.length; i += 1) {
        if (!ignoredList.includes(list[i].id)) {
          filteredList.push(list[i]);
        }
      }
      return filteredList;
    },
    randomNumber(max) {
      return Math.floor(Math.random() * max);
    },
    loadComponent(path) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const loadedComponent = require(`@/${path}`).default;
      this.infoBoxContent = loadedComponent;
    },
    ignoreMessage() {
      const ignoredInfoBoxes = localStorage.getItem('ignoredInfoBoxes');
      let ignoredList;
      if (ignoredInfoBoxes) {
        ignoredList = JSON.parse(ignoredInfoBoxes);
      } else {
        ignoredList = [];
      }

      if (!ignoredList.includes(this.infoBoxId)) {
        ignoredList.push(this.infoBoxId);
      }

      localStorage.setItem('infoBoxCloseDate', new Date());
      localStorage.setItem('ignoredInfoBoxes', JSON.stringify(ignoredList));
      this.infoBoxContent = null;
    },
  },
};
</script>

<style>
.info-box {
  background: #fff;
  width: 100%;
  text-align: center;
  padding:12px 5px;
  box-shadow: #c1c1c1 1px 1px 10px;
  position: relative;
  font-weight: 400;
}
.info-box p {
  margin-bottom: 0;
}
</style>
