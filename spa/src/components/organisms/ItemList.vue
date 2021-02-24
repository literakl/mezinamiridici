<template>
  <GridLayout
  class="home-posts"
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
      pageSize: 10,
      hasEnded: false,
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
      this.hasEnded = false;
      this.start = 0;
    },
  },
  methods: {
    async onAppend({ groupKey, startLoading }) {
      if (this.$refs.ig.isProcessing()) {
        return;
      }
      if (this.hasEnded) {
        return;
      }

      startLoading();
      let items = await this.$store.dispatch('GET_ITEM_STREAM', { start: this.start, size: this.pageSize, tag: this.tag });
      if (items.length === 0) {
        this.hasEnded = true;
        this.$refs.ig.endLoading();
        return;
      }

      this.start = this.start + this.pageSize;
      if (this.exceptItem) {
        items = items.filter(item => item._id !== this.exceptItem._id);
      }
      const newGroupKey = parseFloat(groupKey || 0) + 1;
      items.forEach((item) => { item.groupKey = newGroupKey; });
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

.home-posts{
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-width: 1280px;
  margin: 0 auto;
}
.item {
  width: 255px;
  opacity: 1;
}
.item div{
  height: 270px;
}
.item .thumbnail {
  max-height: 270px;
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
@media (max-width: 767px) {
.home-posts{
  justify-content: flex-start;
  flex-direction: column;
  }
  .item {
  max-width: 767px;
  width: 100%;
  opacity: 1;
  padding: 0 15px;
  }
  .item div{
    height: auto;
  }
}
</style>
