<template>
  <div>
    <div class="analyze-votes_header">
      <PollHeading v-if="item" :item="item"/>
      <ContentLoading v-if="! item" type="poll" />
      <SeriesBarChart v-if="! inProgress" :series="groups" :colors="['#ffd200', '#f5a522']"/>
      <PredefinedComparisons v-if="item" :slug="slug"></PredefinedComparisons>
    </div>
    <div class="analyze-votes__wrapper">
        <h2 class="first-group__heading">1. {{ $t('poll.analysis.group') }}</h2>
        <h2 class="second-group__heading">2. {{ $t('poll.analysis.group') }}</h2>
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
import SeriesBarChart from '@/components/molecules/SeriesBarChart.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
// import AnalyzeVotesGroup from '@/components/molecules/AnalyzeVotesGroup.vue';
import PredefinedComparisons from '@/components/molecules/PredefinedComparisons.vue';

export default {
  name: 'analyze-votes',
  components: {
    // AnalyzeVotesGroup,
    PollHeading,
    SeriesBarChart,
    PredefinedComparisons,
    ContentLoading,
    Button,
  },
  props: {
    slug: String,
    type: String,
  },
  data: () => ({
    groups: [{}, {}],
    inProgress: true,
    error: null,
  }),
  created() {
    const queries = this.parseType(this.type);
    if (queries) {
      this.$store.dispatch('GET_POLL', { slug: this.slug }).then(() => {
        this.runQueries(this.item._id, queries);
      });
    }
  },
  beforeRouteUpdate(to, from, next) {
    const queries = this.parseType(to.params.type);
    if (queries) {
      this.runQueries(this.item._id, queries);
    } else {
      this.groups = [{}, {}];
    }
    next();
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
          this.inProgress = false;
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        if (err.response && err.response.data && err.response.data.errors) {
          this.error = this.$t(err.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
        this.inProgress = false;
      }
    },
    parseType(type) {
      switch (type) {
        case 'muzi_zeny':
          return ['sex=man', 'sex=woman'];
        case 'auto_kamion':
          return ['vehicles=car', 'vehicles=truck'];
        case 'auto_motorka':
          return ['vehicles=car', 'vehicles=bike'];
        case 'zajic_zkuseny':
          return ['age=0:25&driving=0-3', 'age=26:110&driving=3:99'];
        case 'praha_brno':
          return ['region=PRG', 'region=JM'];
        default:
          return null;
      }
    },
  },
};
</script>

<style>
  .analyze-votes_header {
      margin: 0 auto;
      max-width: 80%;
      padding: 1em 0;
  }

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

  .first-group__heading {
    background-color: #ffd200;
    padding: 5px;
  }

  .second-group__heading {
    background-color: #f5a522;
    padding: 5px;
    grid-row: 3;
  }

  @media all and (min-width: 850px) {
  .analyze-votes__wrapper {
      grid-template-columns: 1fr 1fr;
  }
   .second-group__heading {
    background-color: #f5a522;
    padding: 5px;
    grid-row: auto;
  }
}
</style>
