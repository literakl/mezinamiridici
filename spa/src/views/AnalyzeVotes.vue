<template>
  <div>
    <div class="analyze-votes__wrapper">
      <PollHeading v-if="item" :item="item"/>
      <ContentLoading v-if="! item" type="poll" />
<!--      <GroupedBarChart />-->
    </div>
    <div class="analyze-votes__wrapper">
        <h2 class="first-group__heading">{{ $t('poll.analysis.first-group') }}</h2>
        <h2 class="second-group__heading">{{ $t('poll.analysis.second-group') }}</h2>
<!--        <AnalyzeVotesGroup group="1" />-->
<!--        <AnalyzeVotesGroup group="2" />-->
    </div>
    <div class="analyze-votes__button-wrapper">
      <Button :value="$t('poll.analysis.button')" />
    </div>
  </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';
import PollHeading from '@/components/molecules/PollHeading.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
// import AnalyzeVotesGroup from '@/components/molecules/AnalyzeVotesGroup.vue';

export default {
  name: 'analyze-votes',
  components: {
    // AnalyzeVotesGroup,
    PollHeading,
    ContentLoading,
    Button,
  },
  props: {
    slug: String,
    type: String,
  },
  data: () => ({
    groups: [{}, {}],
    inProgress: false,
    error: null,
  }),
  created() {
    this.$store.dispatch('GET_POLL', { slug: this.slug }).then(() => {
      this.runQueries(this.item._id, ['vehicles=car&vehicles=bike', 'region=PRG']);
    });
  },
  computed: {
    item() {
      return this.$store.getters.POLL;
    },
  },
  methods: {
    async runQueries(id, queries) {
      try {
        this.inProgress = true;
        const promises = [];
        for (let i = 0; i < queries.length; i += 1) {
          promises.push(this.$store.dispatch('GET_POLL_VOTES', { id, query: queries[i] }));
        }
        Promise.all(promises).then((values) => {
          for (let i = 0; i < values.length; i += 1) {
            this.groups[i] = values[i].data.data;
          }
        });
        console.log(this.groups);
        this.inProgress = false;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        if (err.response && err.response.data && err.response.data.errors) {
          this.error = this.$t(err.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      }
    },
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
