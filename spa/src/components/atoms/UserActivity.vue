<template>
  <b-container fluid="true" class="pt-3 w-100 m-auto">
    <h1 v-if="timelineTitle">{{timelineTitle}}</h1>
   <vertical-timeline :inputData="activityList" :reversed="true" />
  </b-container>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    timelineTitle: String,
  },
  components: {
  },
  data: () => ({
    activityList: [],
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
          title: item.item_docs[0].info.caption,
          text: `${item.comment_docs[0].text.replace(/<[^>]*>?/gm, '')}`,
          date: new Date(item.published).toLocaleString('cs-CZ'),
          tags: [`${item.action} ${(item.action === 'vote') ? vote : ''}`],
        });
      });
      return arr;
    },
  },
};
</script>
<style>
  *, ::after, ::before {
    box-sizing: content-box;
  }
</style>
