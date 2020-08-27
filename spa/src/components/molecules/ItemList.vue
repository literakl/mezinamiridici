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
    async loadItems(groupKey, num) {
      const { tag } = this;
      const start = this.start || 0;

      let res = await this.$store.dispatch('GET_ITEM_STREAM', { start, num, tag });
      if (res.length === 0) {
        this.$refs.ig.endLoading();
        this.isEnded = true;
      }
      if (this.exceptItem) {
        res = res.filter(item => item._id !== this.exceptItem._id);
      }
      this.start = start + num;
      return res;
    },
    async onAppend({ groupKey, startLoading }) {
      const { list } = this;
      if (this.isEnded) return;

      const items = await this.loadItems(parseFloat(groupKey || 0) + 1, this.pageSize);
      startLoading();
      this.list = list.concat(items);
    },
    onLayoutComplete({ isLayout, endLoading }) {
      if (!isLayout) {
        endLoading();
      }
    },
    onImageError({ totalIndex }) {
      this.list.splice(totalIndex, 1);
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
