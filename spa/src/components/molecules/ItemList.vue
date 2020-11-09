<template>
  <GridLayout
    ref="ig"
    :options="options"
    :layoutOptions="layoutOptions"
    @append="onAppend"
    @layout-complete="onLayoutComplete"
    @image-error="onImageError"
  >
    <div class="item" v-for="item in list" :key="item._id" :groupKey="item.groupKey">
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
      pageSize: 3,
      isEnded: false,
      list: [],
      options: {
        // isOverflowScroll: false,
        // useFit: true,
        // useRecycle: true,
        isConstantSize: true,
        horizontal: false,
        align: 'center',
        transitionDuration: 0.2,
      },
      layoutOptions: {
        margin: 15,
        align: 'center',
      },
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
    async onAppend({ groupKey, startLoading, currentTarget }) {
      if (currentTarget.isProcessing()) {
        return;
      }
      const start = this.start || 0, { tag } = this;
      const newGroupKey = parseFloat(groupKey || 0) + 1;
      this.index += 1;
      if (this.isEnded) {
        return;
      }
      this.start = start + this.pageSize;

      let items = await this.$store.dispatch('GET_ITEM_STREAM', { start, size: this.pageSize, tag });
      if (items.length === 0 || items.length < this.pageSize) {
        this.isEnded = true;
        this.$refs.ig.endLoading();
        return;
      }

      // this.start = start + items.length;
      if (this.exceptItem) {
        items = items.filter(item => item._id !== this.exceptItem._id);
      }
      items.forEach((item) => { item.groupKey = newGroupKey; });
      startLoading();
      this.list = this.list.concat(items);
    },
    onLayoutComplete({ isLayout, endLoading }) {
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
