<template>
  <div>
    xxx
    <div v-for="item in list" :key="item._id" :groupKey="item.groupKey">
      aaa
    </div>
    <GridLayout
      ref="ig"
      :options="options"
      :layoutOptions="layoutOptions"
      @append="onAppend"
      @layout-complete="onLayoutComplete"
    >
      <div v-for="item in list" :key="item._id" :groupKey="item.groupKey">
        <Date :date="item.info.date" format="dynamicDate" />
        <router-link :to="{ name: 'blog', params: { slug: item.info.slug, id: item.info.author.id } }">
          {{ item.info.caption }}
        </router-link>
      </div>
    </GridLayout>
    zzz
  </div>
</template>

<script>
import { GridLayout } from '@egjs/vue-infinitegrid';
import Date from '@/components/atoms/Date.vue';

export default {
  name: 'UserActivity',
  components: {
    GridLayout,
    Date,
  },
  props: {
    userId: String,
  },
  data() {
    return {
      filter: 'blog',
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
  methods: {
    async onAppend({ groupKey, startLoading }) {
      if (this.$refs.ig.isProcessing()) {
        return;
      }
      if (this.hasEnded) {
        return;
      }

      startLoading();
      const payload = { start: this.start, size: this.pageSize, userId: this.userId, type: this.filter };
      const items = await this.$store.dispatch('FETCH_USER_ACTIVITY', payload);
      if (items.length === 0) {
        this.hasEnded = true;
        this.$refs.ig.endLoading();
        return;
      }

      this.start = this.start + this.pageSize;
      const newGroupKey = parseFloat(groupKey || 0) + 1;
      items.forEach((item) => { item.groupKey = newGroupKey; });
      this.list = this.list.concat(items);
    },
    onLayoutComplete({ isLayout, endLoading }) {
      if (!isLayout) {
        endLoading();
      }
    },
  },
};
</script>
