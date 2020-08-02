<template>
  <div class="container flex-wrap pt-3 w-75 ml-auto mr-auto mt-auto mb-5">
    <div class="row">
      <div class="col">
        <PollHeading v-if="item" :item="item"/>
        <ContentLoading v-if="! item" type="poll"/>
        <SeriesBarChart v-if="! inProgress" :series="groups" :colors="['#ffd200', '#f5a522']"
                        :captions="captions" :absolute-values="absoluteValues"/>
        <PredefinedComparisons v-if="item" :slug="slug"></PredefinedComparisons>
        <b-form-group :label="this.$t('poll.analysis.display_label')" label-cols="3" label-cols-md="1">
          <b-form-radio-group id="radio-group-2" v-model="absoluteValues" class="pt-2">
            <b-form-radio :value="true">{{ $t('poll.analysis.values') }}</b-form-radio>
            <b-form-radio :value="false">{{ $t('poll.analysis.percents') }}</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </div>
    </div>
    <div class="row" v-if="this.type === 'vlastni'">
      <div class="col-sm-6">
        <b-card :header="captions[0]">
          <SeriesForm :group="forms[0]" id="1" />
        </b-card>
      </div>
      <div class="col-sm-6">
        <b-card :header="captions[1]">
          <SeriesForm :group="forms[1]" id="2" />
        </b-card>
      </div>
    </div>
    <div class="row" v-if="this.type === 'vlastni'">
      <div class="col text-center p-4">
        <b-button v-on:click="handleCustom">{{ $t('poll.analysis.button') }}</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import PollHeading from '@/components/molecules/PollHeading.vue';
import SeriesBarChart from '@/components/molecules/SeriesBarChart.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import SeriesForm from '@/components/molecules/SeriesForm.vue';
import PredefinedComparisons from '@/components/molecules/PredefinedComparisons.vue';

export default {
  name: 'analyze-votes',
  components: {
    SeriesForm,
    PollHeading,
    SeriesBarChart,
    PredefinedComparisons,
    ContentLoading,
  },
  props: {
    slug: String,
    type: String,
  },
  data: () => ({
    groups: [{}, {}],
    forms: [{ region: [], vehicles: [] }, { region: [], vehicles: [] }],
    captions: null,
    queries: null,
    absoluteValues: false,
    inProgress: true,
    error: null,
  }),
  created() {
    this.parseType(this.type);
    this.$store.dispatch('GET_POLL', { slug: this.slug }).then(() => {
      if (this.queries) {
        this.runQueries(this.item._id, this.queries);
      }
    });
  },
  async beforeRouteUpdate(to, from, next) {
    if (from.params.slug !== to.params.slug) {
      await this.$store.dispatch('GET_POLL', { slug: to.params.slug });
    }
    this.parseType(to.params.type);
    if (this.queries) {
      await this.runQueries(this.item._id, this.queries);
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
    parseGroup(group) {
      let query = '', appendAnd = false;
      const drivingMin = group.drivingMin || 0;
      let drivingMax = group.drivingMax || 0;
      if (drivingMin + drivingMax > 0) {
        if (drivingMax === 0) drivingMax = 99;
        query = `driving=${drivingMin}:${drivingMax}`;
        appendAnd = true;
      }

      const ageMin = group.ageMin || 0;
      let ageMax = group.ageMax || 0;
      if (ageMin + ageMax > 0) {
        if (ageMax === 0) ageMax = 99;
        if (appendAnd) query += '&';
        query += `age=${ageMin}:${ageMax}`;
        appendAnd = true;
      }

      (group.sex || []).forEach((x) => {
        if (appendAnd) query += '&';
        query += `sex=${x}`;
        appendAnd = true;
      });

      (group.edu || []).forEach((x) => {
        if (appendAnd) query += '&';
        query += `edu=${x}`;
        appendAnd = true;
      });

      (group.region || []).forEach((x) => {
        if (appendAnd) query += '&';
        query += `region=${x}`;
        appendAnd = true;
      });

      (group.vehicles || []).forEach((x) => {
        if (appendAnd) query += '&';
        query += `vehicles=${x}`;
        appendAnd = true;
      });
      return query;
    },
    handleCustom() {
      const query1 = this.parseGroup(this.forms[0]);
      const query2 = this.parseGroup(this.forms[1]);
      this.queries = [query1, query2];
      this.runQueries(this.item._id, this.queries);
    },
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
        this.$log.error(err);
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
          this.captions = [this.$t('poll.analysis.Men'), this.$t('poll.analysis.Women')];
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
          this.queries = ['age=0:25&driving=0:3', 'age=26:110&driving=3:99'];
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
