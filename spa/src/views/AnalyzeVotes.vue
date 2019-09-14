<template>
  <div>
  <h1>Page in development  still</h1>

    <div class="analyze-votes__wrapper">
        <h2>First Group</h2>
        <h2>Second Group</h2>
        <AnalyzeVotesGroup />
        <AnalyzeVotesGroup />
    </div>
    <div class="analyze-votes__button-wrapper">
      <Button value="Analyze Votes" />
    </div>
  </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue'
import Radio from '@/components/atoms/Radio.vue'
import Checkbox from '@/components/atoms/Checkbox.vue'
import AnalyzeVotesGroup from '@/components/molecules/forms/AnalyzeVotesGroup.vue'

export default {
  name: 'analyze-votes',
  components: {
      Radio,
      Checkbox,
      AnalyzeVotesGroup,
      Button
  },
  methods: {
  },
};
</script>

<style>
.analyze-votes__wrapper {
    grid-template-columns: 1fr 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

.analyze-votes__button-wrapper {
  text-align:center;
  margin-bottom: 20px;
}
</style>
