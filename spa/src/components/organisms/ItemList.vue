<template>
  <div>
    <ContentLoading v-if="loading && list.length === 0" type="items"/>

    <div class="home-posts">
      <div class="item m-2" v-for="item in list" :key="item._id">
        <ViewItem :item="item"/>
      </div>
    </div>

  <div class="text-center my-4">
    <ButtonOutlined
      v-if="!endOfData && list.length > 0"
      :waiting="loading"
      :value="$t('generic.load-next-button')"
      sm='sm'
      @clicked="loadNextPage()"/>
  </div>
  </div>
</template>

<script>
import ButtonOutlined from '@/components/atoms/ButtonOutlined.vue';
import ViewItem from '@/components/molecules/ItemBox.vue';
import ContentLoading from '@/components/atoms/ContentLoading';

export default {
  name: 'ItemList',
  components: {
    ButtonOutlined,
    ContentLoading,
    ViewItem,
  },
  props: {
    tag: String,
    exceptItem: Object,
  },
  data() {
    return {
      start: 0,
      pageSize: 13,
      loading: false,
      endOfData: false,
      list: [],
    };
  },
  watch: {
    tag() {
      this.list = [];
      this.endOfData = false;
      this.start = 0;
    },
  },
  async created() {
    await this.loadNextPage();
  },
  methods: {
    async loadNextPage() {
      try {
        this.loading = true;

        let items = await this.$store.dispatch('GET_ITEM_STREAM', {
          start: this.start,
          size: this.pageSize,
          tag: this.tag,
        });

        if (items.length === 0) {
          this.endOfData = true;
          return;
        }

        if (items.length < this.pageSize) { // todo test
          this.endOfData = true;
        }

        if (this.exceptItem) {
          items = items.filter(item => item._id !== this.exceptItem._id);
        }
        this.list = this.list.concat(items);

        this.start = this.start + this.pageSize;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style scoped>
/*TODO clean up styles*/
.home-posts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1280px;
  margin: 0 auto;
}

.item {
  width: 300px;
  opacity: 1;
}

.item div {
  height: 300px;
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
  .home-posts {
    justify-content: flex-start;
    flex-direction: column;
  }

  .item {
    max-width: 767px;
    width: 100%;
    opacity: 1;
    padding: 0 15px;
  }

  .item div {
    height: auto;
  }
}
</style>
