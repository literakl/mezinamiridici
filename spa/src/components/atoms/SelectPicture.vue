<template>
  <b-container fluid class="p-4">
    <b-img center thumbnail :src="currentPath" class="item-thumb" @click="showModal"></b-img>

    <b-modal id="thumbs-list" v-model="listShow" size="xl" centered scrollable :hide-footer="true" v-if="pictureCount > 0">
      <b-row>
        <b-col v-for="index in countPerRow" :key="index-1" class="p-0">
          <b-img
            thumbnail
            fluid
            :src="pictures[index-1].path"
            class="item-thumb"
            @click="selectThumb(index-1)">
          </b-img>
        </b-col>
      </b-row>
      <b-row>
        <b-col v-for="index in countPerRow" :key="countPerRow + index - 1" class="p-0">
          <b-img
            thumbnail
            fluid
            :src="pictures[countPerRow + index - 1].path"
            class="item-thumb"
            v-if="pictures[countPerRow + index - 1]"
            @click="selectThumb(countPerRow + index - 1)">
          </b-img>
        </b-col>
      </b-row>
    </b-modal>
</b-container>
</template>

<script>
export default {
  name: 'SelectPicture',
  props: {
    currentPath: String,
  },
  data() {
    return {
      pictures: [],
      pictureCount: 0,
      countPerRow: 0,
      listShow: false,
    };
  },
  computed: {
    allPictures() {
      return this.$store.getters.ITEM_PICTURES;
    },
  },
  watch: {
    allPictures() {
      this.allPictures.forEach((item) => {
        if (item.default_picture) {
          if (!this.currentPath) {
            this.$emit('changePath', item.path);
          }
        } else {
          this.pictures.push(item);
        }
      });
      this.pictureCount = this.pictures.length;
      this.countPerRow = Math.floor(this.pictureCount / 2);
      if (this.pictureCount % 2 !== 0) {
        this.countPerRow = this.countPerRow + 1;
      }
    },
  },
  methods: {
    showModal() {
      this.listShow = true;
    },
    selectThumb(key) {
      this.listShow = false;
      this.$emit('changePath', this.pictures[key].path);
    },
  },
  async created() {
    await this.$store.dispatch('FETCH_ITEM_PICTURES');
  },
};
</script>

<style scoped>
  .item-thumb {
    width:385px;
    height:230px;
    cursor:pointer;
    transition: 0.5s ease;
  }
  .item-thumb:hover {
    transform: translateX(-2px) translateY(-2px) scale(1.03);
  }
  .item-thumb:active {
    transform: translateX(-1px) translateY(-1px) scale(1.01);
  }
</style>
