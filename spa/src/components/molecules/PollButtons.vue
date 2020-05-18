<template>
    <b-container fluid class="w-75 m-auto pt-5 pb-5">
        <h3>{{ $t('poll.your-opinion') }}</h3>
        <b-button class="mr-5" variant="success" size="lg" v-on:click="voted('neutral')">
          <img src="@/assets/happy.png" class="pr-2" align="middle">
          {{ $t('poll.choices.neutral') }}
        </b-button>
        <b-button class="mr-5" variant="primary" size="lg" v-on:click="voted('trivial')">
          <img src="@/assets/ok.png" class="pr-2" align="middle">
          {{ $t('poll.choices.trivial') }}
        </b-button>
        <b-button class="mr-5" variant="warning" size="lg" v-on:click="voted('dislike')">
          <img src="@/assets/slanty.png" class="pr-2" align="middle">
          {{ $t('poll.choices.dislike') }}
        </b-button>
        <b-button class="mr-5" variant="danger" size="lg" v-on:click="voted('hate')">
          <img src="@/assets/angry.png" class="pr-2" align="middle">
          {{ $t('poll.choices.hate') }}
        </b-button>
    </b-container>
</template>

<script>
export default {
  name: 'PollButtons',
  methods: {
    voted(vote) {
      if (!this.$store.getters.IS_AUTHORIZED) {
        this.$router.push({ name: 'sign-in' });
      } else {
        this.$emit('do-vote', vote);
      }
    },
  },
};
</script>
