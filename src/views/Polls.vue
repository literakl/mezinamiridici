<template>
    <div id="polls">
        <TopPolls />
        <Button value="Load next" @clicked="clicked" />
        Page: {{page}}
    </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';
import TopPolls from '@/components/molecules/TopPolls.vue';

export default {
  name: 'poll',
  components: {
      TopPolls,
      Button
  },
  data: () => ({
    page: 0
  }),
  methods: {
      clicked: function () {
          console.log("Loading more...")
          this.page++;
      }
  }
};
</script>

<style>
#polls {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}
</style>
