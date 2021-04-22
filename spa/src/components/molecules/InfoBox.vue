<template>
  <div class="info-box"  v-if="infoBoxContent">
    <span class="closebtn" @click="ignoreMessage()"><BIconXCircle scale='1'></BIconXCircle></span>
    <component :is="infoBoxContent"></component>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { BIconXCircle } from 'bootstrap-vue';
import { infoBoxes } from '@/config/infoBox.json';

dayjs.extend(isBetween);

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
      if (this.checkIfIgnored()) return;
      const validInfoBoxes = this.findValidInfoBoxes(infoBoxes);

      if (validInfoBoxes.length) {
        const randomIndex = this.randomNumber(validInfoBoxes.length);
        this.loadComponent(validInfoBoxes[randomIndex].template);
        this.infoBoxId = validInfoBoxes[randomIndex].id;
      }
    },
    checkIfIgnored() {
      const millisInDay = 24 * 3600 * 1000;
      const infoBoxCloseDate = localStorage.getItem('infoBoxCloseDate');

      if (infoBoxCloseDate) {
        if (new Date() - new Date(infoBoxCloseDate) < millisInDay) {
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
      return list.filter(item => dayjs().isBetween(item.since, item.to));
    },
    filterByUserPreferences(list) {
      const ignoredInfoBoxes = localStorage.getItem('ignoredInfoBoxes');

      let ignoredList;
      if (ignoredInfoBoxes) {
        ignoredList = JSON.parse(ignoredInfoBoxes);
      } else {
        return list;
      }

      return list.filter(item => !ignoredList.includes(item.id));
    },
    randomNumber(max) {
      return Math.floor(Math.random() * max);
    },
    loadComponent(path) {
      try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const loadedComponent = require(`@/${path}`).default;
        this.infoBoxContent = loadedComponent;
      } catch (err) {
        this.$log.error(err);
      }
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
