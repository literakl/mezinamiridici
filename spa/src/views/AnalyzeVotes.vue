<template>
  <b-container fluid="true" class="pt-3 w-75 m-auto">
    <b-row>
      <b-col>
        <PollHeading v-if="item" :item="item"/>
        <ContentLoading v-if="! item" type="poll"/>
        <SeriesBarChart v-if="! inProgress" :series="groups" :colors="['#ffd200', '#f5a522']"
                        :captions="captions" :absolute-values="absoluteValues"/>
        <PredefinedComparisons v-if="item" :slug="slug"></PredefinedComparisons>
        <b-form-group :label="this.$t('poll.analysis.display_label')" label-cols="1">
          <b-form-radio-group id="radio-group-2" v-model="absoluteValues" class="pt-2">
            <b-form-radio :value="true">{{ $t('poll.analysis.values') }}</b-form-radio>
            <b-form-radio :value="false">{{ $t('poll.analysis.percents') }}</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row v-if="this.type === 'vlastni'">
      <b-col md="6">
        <h2 class="bg-warning p-2">1. {{ $t('poll.analysis.group') }}</h2>
      </b-col>
      <b-col md="6">
        <h2 class="bg-warning p-2">2. {{ $t('poll.analysis.group') }}</h2>
      </b-col>
    </b-row>
    <b-row v-if="this.type === 'vlastni'">
      <b-col class="text-center p-4">
        <Button :value="$t('poll.analysis.button')"/>
      </b-col>
    </b-row>
  </b-container>
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
    captions: null,
    queries: null,
    absoluteValues: false,
    inProgress: true,
    error: null,
  }),
  created() {
    this.parseType(this.type);
    if (this.queries) {
      this.$store.dispatch('GET_POLL', { slug: this.slug }).then(() => {
        this.runQueries(this.item._id, this.queries);
      });
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.parseType(to.params.type);
    if (this.queries) {
      this.runQueries(this.item._id, this.queries);
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
          this.queries = ['sex=man', 'sex=woman'];
          this.captions = [this.$t('poll.analysis.men'), this.$t('poll.analysis.women')];
          break;
        case 'auto_kamion':
          this.queries = ['vehicles=car', 'vehicles=truck'];
          this.captions = [this.$t('poll.analysis.car'), this.$t('poll.analysis.truck')];
          break;
        case 'auto_motorka':
          this.queries = ['vehicles=car', 'vehicles=bike'];
          this.captions = [this.$t('poll.analysis.car'), this.$t('poll.analysis.bike')];
          break;
        case 'zajic_zkuseny':
          this.queries = ['age=0:25&driving=0-3', 'age=26:110&driving=3:99'];
          this.captions = [this.$t('poll.analysis.unseasoned'), this.$t('poll.analysis.veteran')];
          break;
        case 'praha_brno':
          this.queries = ['region=PRG', 'region=JM'];
          this.captions = [this.$t('poll.analysis.praha'), this.$t('poll.analysis.brno')];
          break;
        default:
          this.queries = null;
          this.captions = [`1. ${this.$t('poll.analysis.group')}`, `2. ${this.$t('poll.analysis.group')}`];
      }
    },
  },
};
</script>
