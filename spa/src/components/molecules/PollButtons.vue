<template>
  <b-container>
    <b-row>
      <b-col>
        <h4 class="text-your-opinion">{{ $t('poll.your-opinion') }}</h4>
      </b-col>
      <b-col>
        <b-button variant="success" v-on:click="voted('neutral')">
          <img src="/images/icons/happy.png" class="pr-2" alt="">
          {{ $t('poll.choices.neutral') }}
        </b-button>
      </b-col>
      <b-col>
        <b-button variant="primary" v-on:click="voted('trivial')">
          <img src="/images/icons/ok.png" class="pr-2" alt="">
          {{ $t('poll.choices.trivial') }}
        </b-button>
      </b-col>
      <b-col>
        <b-button variant="warning" v-on:click="voted('dislike')">
          <img src="/images/icons/dislike.png" class="pr-2" alt="">
          {{ $t('poll.choices.dislike') }}
        </b-button>
      </b-col>
      <b-col>
        <b-button variant="danger" v-on:click="voted('hate')">
          <img src="/images/icons/angry.png" class="pr-2" alt="">
          {{ $t('poll.choices.hate') }}
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { BContainer, BButton, BRow, BCol } from 'bootstrap-vue';

export default {
  name: 'PollButtons',
  components: {
    BContainer,
    BButton,
    BRow,
    BCol,

  },
  methods: {
    voted(vote) {
      if (!this.$store.getters.IS_AUTHORIZED) {
        this.$router.push({ name: 'sign-in', params: { redirectUrl: this.$route.fullPath } });
      } else {
        this.$emit('do-vote', vote);
      }
    },
  },
};
</script>

<style scoped lang="scss">
  .text-your-opinion {
    //font-size: x-large;
  }
</style>
