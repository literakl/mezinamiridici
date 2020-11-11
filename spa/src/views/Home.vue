<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <template v-if="poll">
      <div class="poll-borders">
        <h4 class="text-center">
          <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }}">
            {{ poll.info.caption }}
          </router-link>
        </h4>

        <Date :date="poll.info.date" format="dynamicDate" />  &bull;
        <ProfileLink :profile="poll.info.author"/> &bull;
        {{ $t('poll.votes') }}: {{ poll.votes.total }} &bull;
        <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }, hash: '#comments'}">
          {{ $t('comment.comments') }}: {{ poll.comments.count }}
        </router-link>
      </div>

      <div v-if="voted" class="pt-2 pb-2">
        <VotesChart :votes="poll.votes" v-bind:voted="voted" :horizontal="true" :stacked="true" />
      </div>

      <div v-if="!voted" class="m-auto pt-3 pb-3">
        <PollButtons v-on:do-vote="onVote"/>
      </div>
    </template>

    <ContentLoading v-if="!poll" type="poll"/>

    <ItemList :exceptItem="poll"/>
  </div>
</template>

<script>
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import ItemList from '@/components/molecules/ItemList.vue';
import VotesChart from '@/components/molecules/VotesChart.vue';
import PollButtons from '@/components/molecules/PollButtons.vue';
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';

export default {
  name: 'home',
  components: {
    ContentLoading,
    VotesChart,
    PollButtons,
    ItemList,
    ProfileLink,
    Date,
  },
  data() {
    return {
      voting: false,
    };
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
    voted() {
      return this.$store.getters.POLL.my_vote;
    },
  },
  created() {
    this.$store.dispatch('GET_LATEST_POLL');
    this.$root.$once('sign-out', this.logoutEventHandler);
  },
  methods: {
    async onVote(vote) {
      this.voting = true;
      await this.$store.dispatch('POLL_VOTE', {
        id: this.poll._id,
        vote,
      });
      this.voting = false;
    },
    logoutEventHandler() {
      this.$store.dispatch('GET_LATEST_POLL');
    },
  },
};
</script>

<style scoped>
.poll-borders {
  border-top: 1px solid;
  border-bottom: 1px solid;
  color: #777;
}
</style>
