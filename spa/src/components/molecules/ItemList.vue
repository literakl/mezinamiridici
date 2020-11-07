<template>
  <GridLayout
    ref="ig"
    :options="options"
    :layoutOptions="layoutOptions"
    @append="onAppend"
    @layout-complete="onLayoutComplete"
    @image-error="onImageError"
  >
    <div slot="loading">Loading...</div>
    <div class="item" v-for="(item) in list" :key="item.key">
      <ViewItem :item="item"/>
    </div>
  </GridLayout>
</template>


<script>
import { GridLayout } from '@egjs/vue-infinitegrid';
import ViewItem from '@/components/molecules/ItemBox.vue';

export default {
  name: 'ItemList',
  components: {
    GridLayout,
    ViewItem,
  },
  props: {
    tag: String,
    exceptItem: Object,
  },
  data() {
    return {
      start: 0,
      loading: false,
      list: [],
      isEnded: false,
      options: {
        isOverflowScroll: false,
        useFit: true,
        useRecycle: true,
        horizontal: false,
        align: 'center',
        transitionDuration: 0.2,
      },
      layoutOptions: {
        margin: 15,
        align: 'center',
      },
      pageSize: 3,
    };
  },
  watch: {
    tag() {
      this.list = [];
      this.isEnded = false;
      this.start = 0;
    },
  },
  methods: {
    async onAppend({ groupKey, startLoading }) {
      this.$log.debug(`onAppend group key = ${groupKey}`);
      const { list } = this;
      if (this.isEnded) return;
      const items = await this.loadItems();
      startLoading();
      this.list = list.concat(items);
    },
    async loadItems() {
      const start = this.start || 0, size = parseFloat(this.pageSize), { tag } = this;
      this.$log.debug(`loadItems start = ${start}, size = ${size}`);
      let res = await this.$store.dispatch('GET_ITEM_STREAM', { start, size, tag });
      if (res.length === 0) { // todo or smaller than requested
        this.$log.debug('loadItems no data');
        this.isEnded = true;
        this.$refs.ig.endLoading();
        return res;
      }
      if (this.exceptItem) {
        res = res.filter(item => item._id !== this.exceptItem._id);
      }
      this.start = start + res.length;
      return res;
    },
    onLayoutComplete({ isLayout, endLoading }) {
      this.$log.debug(`onLayoutComplete isLayout = ${isLayout}`);
      if (!isLayout) {
        endLoading();
      }
    },
    onImageError({ totalIndex }) {
      this.$log.warn(`Failed to load picture ${this.list[totalIndex].info.picture}`);
    },
  },
};
</script>
<style scoped>
.item {
  width: 250px;
  opacity: 1;
}
.item .thumbnail {
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
}
.item .thumbnail img {
  width: 100%;
  border-radius: 8px;
}
.item .info {
  margin-top: 10px;
  font-weight: bold;
  color: #777;
}
.item.animate {
  transition: opacity ease 1s;
  transition-delay: 0.2s;
  opacity: 1;
}
.loading {
  position: absolute;
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-weight: bold;
}
</style>
