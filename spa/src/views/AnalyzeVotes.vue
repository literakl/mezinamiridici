<template>
  <div>
    <div class="analyze-votes__wrapper">
      <GroupedBarChart />
    </div>
    <div class="analyze-votes__wrapper">
        <h2 class="first-group__heading">{{ $t('analyze-votes.first-group') }}</h2>
        <h2 class="second-group__heading">{{ $t('analyze-votes.second-group') }}</h2>
        <AnalyzeVotesGroup group="1" />
        <AnalyzeVotesGroup group="2" />
    </div>
    <div class="analyze-votes__button-wrapper">
      <Button :value="$t('analyze-votes.button')" />
    </div>
  </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';
import Radio from '@/components/atoms/Radio.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';
import AnalyzeVotesGroup from '@/components/molecules/forms/AnalyzeVotesGroup.vue';
import GroupedBarChart from '@/components/molecules/charts/GroupedBarChart.vue';

export default {
  name: 'analyze-votes',
  components: {
    Radio,
    Checkbox,
    AnalyzeVotesGroup,
    Button,
    GroupedBarChart,
  },
  methods: {
  },
};
</script>

<style>
  .analyze-votes__wrapper {
      display: grid;
      margin: 0 auto;
      max-width: 80%;
      padding: 1em 0;
      grid-gap: 20px;
      overflow: hidden;
  }

  .analyze-votes__button-wrapper {
    text-align:center;
    margin-bottom: 20px;
  }

  .first-group__heading{
    background-color: #ffd200;
    padding: 5px;
  }

  .second-group__heading{
    background-color: #f5a522;
    padding: 5px;
    grid-row: 3;
  }

  @media all and (min-width: 850px) {
  .analyze-votes__wrapper {
      grid-template-columns: 1fr 1fr;
  }
   .second-group__heading{
    background-color: #f5a522;
    padding: 5px;
    grid-row: auto;
  }
}
</style>
