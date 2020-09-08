<template>
  <b-container fluid="true" class="pt-3 w-100 m-auto">
    <h3 v-if="timelineTitle">{{timelineTitle}}</h3>

    <div id="table">
      <div class="header">
        <span class="no">No</span>
        <span class="date">Date</span>
        <span class="writer">Action</span>
        <span class="title">Content</span>
      </div>
      <div class="container">
        <GridLayout
          ref="ig"
          :options="{
            align: 'center',
            isConstantSize: true,
            transitionDuration: 0.2,
            isOverflowScroll: false,
          }"
          @append="onAppend"
          @layout-complete="onLayoutComplete"
          v-if="activityData"
        >
          <div slot="loading">{{ $t('generic.loading-message') }}</div>
          <div class="post" v-for="item in list" :key="item.key">
            <span class="no">{{item.key + 1}}</span>
            <span class="date">{{item.data.date}}</span>
            <span class="writer">{{item.data.tags}}</span>
            <span class="title">{{item.data.text}}</span>
          </div>
        </GridLayout>
      </div>
    </div>

  </b-container>
</template>

<script>
import { GridLayout } from '@egjs/vue-infinitegrid';

export default {
  name: 'Timeline',
  components: {
    GridLayout,
  },
  props: {
    timelineTitle: String,
  },
  data: () => ({
    start: 0,
    loading: false,
    activityList: [],
    list: [],
  }),
  computed: {
    activityData() {
      return this.$store.getters.USER_ACTIVITY;
    },
  },
  watch: {
    activityData() {
      this.activityList = this.getActivityData(this.activityData);
    },
    list() {
      if (this.list.length === this.activityList.length) this.$refs.ig.layout();
    },
  },
  created() {
    this.$store.dispatch('FETCH_USER_ACTIVITY');
  },
  methods: {
    getActivityData(data) {
      const arr = [];
      data.forEach((item) => {
        const vote = (item.vote === 1) ? 'up' : 'down';
        arr.push({
          text: `${item.info.caption}`,
          date: new Date(item.date).toLocaleString('cs-CZ'),
          tags: `${item.action} ${(item.action === 'vote') ? vote : ''}`,
        });
      });
      return arr;
    },

    loadItems(groupKey, num) {
      const items = [];
      const start = this.start || 0;

      for (let i = 0; i < num; i += 1) {
        const key = this.start + i;
        if (key === this.activityData.length) break;
        items.push({
          groupKey,
          key,
          data: this.activityList[key],
        });
      }
      this.start = start + num;

      return items;
    },
    onAppend({ groupKey, startLoading }) {
      if (this.start > this.activityData.length) {
        return;
      }
      const items = this.loadItems(parseFloat(groupKey || 0) + 1, 5);

      startLoading();
      this.list = [...this.list, ...items];
    },
    onLayoutComplete({ isLayout, endLoading }) {
      if (!isLayout) {
        endLoading();
      }
    },
  },
};
</script>
<style scoped>
 #table span {
    float: left;
  }
  .header {
    background: #282D37;
    color: #fff;
    width: 100%;
    z-index: 2;
  }
  .header span {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    padding: 5px 10px;
  }
  #table span.no {
    width: 50px;
    margin-left: 10px;
  }
  #table span.writer, #table span.date {
    float: right;
    width: 100px;
  }
  #table span.date {
    width: 150px;
  }
  #table span.title {
    float: none;
    display: block;
  }
  .container {
    width: 100%;
  }
  #table .post {
    border-bottom: 1px solid #ddd;
    width: 100%;
  }
  #table .post span {
    padding: 15px 10px;
    color: #333;
  }
  #table .post .title {
    font-weight: bold;
  }
  #table .post .date {
    color: #999;
  }
  #table a {
    text-decoration: none;
    color: #333;
  }

  @media (max-width: 600px) {
    #table span.date {
      display: none;
    }
  }
  @media (max-width: 380px) {
    #table span.writer {
      display: none;
    }
  }
</style>
