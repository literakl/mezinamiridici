<template>
  <div>
    <div>
      <div>
        <PollHeading :item="item"/>

        <div v-if="voted" class="pt-2 pb-2">
          <div class="pb-3">
            {{ $t('poll.your-vote') }}
            <b-button class="ml-3" :variant="this.votedVariant" size="sm">
<!--              <img src="@/assets/happy.png" class="pr-2" align="middle">-->
<!--              <img :src="require(this.votedPicture)" class="pr-2" align="middle">-->
              {{ $t('poll.choices.'+voted) }}
            </b-button>
          </div>

          <BarChart :votes="item.votes" v-bind:voted="voted" />
          <PredefinedComparisons :slug="item.info.slug"></PredefinedComparisons>
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
    votedVariant() {
      switch (this.$store.getters.POLL.my_vote) {
        case 'neutral':
          return 'success';
        case 'trivial':
          return 'primary';
        case 'dislike':
          return 'warning';
        default:
          return 'danger';
      }
    },
    votedPicture() {
      switch (this.$store.getters.POLL.my_vote) {
        case 'neutral':
          return '@/assets/happy.png';
        case 'trivial':
          return '@/assets/ok.png';
        case 'dislike':
          return '@/assets/slanty.png';
        default:
          return '@/assets/angry.png';
      }
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
