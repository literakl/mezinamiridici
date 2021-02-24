<template>
  <b-form-group class="title" :label="$t('generic.select-picture-label')">
    <b-img thumbnail :src="currentPath" class="item-thumb" @click="showModal"></b-img>
    <b-modal id="thumbs-list" v-model="showSelector" :title="$t('generic.select-picture-title')"
             size="xl" centered scrollable :hide-footer="true">
      <b-img
        thumbnail
        fluid
        class="item-thumb"
        v-for="picture in pictures"
        :src="picture.path"
        v-bind:key="picture.path"
        @click="selectPicture(picture.path)">
      </b-img>
    </b-modal>
  </b-form-group>
</template>

<script>
import { BFormGroup, BImg, BModal } from 'bootstrap-vue';

export default {
  name: 'SelectPicture',
  components: {
    BFormGroup, BImg, BModal,
  },
  props: {
    currentPath: String,
  },
  data() {
    return {
      pictures: [],
      showSelector: false,
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
        this.pictures.push(item);
        if (!this.currentPath && item.default_picture) {
          this.$emit('changePath', item.path);
        }
      });
    },
  },
  methods: {
    showModal() {
      this.showSelector = true;
    },
    selectPicture(path) {
      this.showSelector = false;
      this.$emit('changePath', path);
    },
  },
  async created() {
    await this.$store.dispatch('FETCH_ITEM_PICTURES');
  },
};
</script>

<style scoped>
.title{
  font-size:14px;
  font-weight:300
}
.item-thumb {
  width:200px;
  height:120px;
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
