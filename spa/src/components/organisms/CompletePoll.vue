<template>
  <div>
    <div>
      <div>
        <PollHeading :item="item"/>

        <div v-if="voted" class="pt-4 pb-4">
          <h2 class="pb-5">
            {{ $t('poll.your-vote') }} <span class="vote-text">{{ $t('poll.choices.'+voted) }}</span>
          </h2>

          <div class="w-75 m-auto pb-5">
            <BarChart :votes="item.votes" v-bind:voted="voted" />
          </div>
            <div class="pb-3">
              <PredefinedComparisons :slug="item.info.slug"></PredefinedComparisons>
            </div>
        </div>

        <div v-if="!voted">
          <PollButtons v-on:do-vote="onVote"/>
        </div>

        <content-loader
          :height="200"
          :width="400"
          :speed="22"
          primaryColor="#f3f3f3"
          secondaryColor="#ecebeb"
          v-if="voting"
        >
          <rect x="50" y="9.61" rx="3" ry="3" width="40" height="200" />
          <rect x="130" y="9.61" rx="3" ry="3" width="40" height="200" />
          <rect x=210 y="7.61" rx="3" ry="3" width="40" height="200" />
          <rect x="290" y="7.61" rx="3" ry="3" width="40" height="200" />
        </content-loader>
      </div>
    </div>
  </div>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';
import PollHeading from '@/components/molecules/PollHeading.vue';
import PollButtons from '@/components/molecules/PollButtons.vue';
import BarChart from '@/components/molecules/BarChart.vue';
import PredefinedComparisons from '@/components/molecules/PredefinedComparisons.vue';

export default {
  name: 'CompletePoll',
  components: {
    ContentLoader,
    BarChart,
    PollButtons,
    PollHeading,
    PredefinedComparisons,
  },
  data() {
    return {
      voting: false,
    };
  },
  computed: {
    item() {
      return this.$store.getters.POLL;
    },
    voted() {
      return this.$store.getters.POLL.my_vote;
    },
  },
  methods: {
    async onVote(vote) {
      this.voting = true;
      await this.$store.dispatch('POLL_VOTE', {
        id: this.item._id,
        vote,
      });
      this.voting = false;
    },
  },
};
</script>
