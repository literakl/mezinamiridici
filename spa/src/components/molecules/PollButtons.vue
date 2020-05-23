<template>
  <b-container fluid>
    <h3>{{ $t('poll.your-opinion') }}</h3>
    <b-button class="mr-xl-5 mr-sm-3" variant="success" size="md" v-on:click="voted('neutral')">
      <img src="@/assets/happy.png" class="pr-2" align="middle">
      {{ $t('poll.choices.neutral') }}
    </b-button>
    <b-button class="mr-xl-5 mr-sm-3" variant="primary" size="md" v-on:click="voted('trivial')">
      <img src="@/assets/ok.png" class="pr-2" align="middle">
      {{ $t('poll.choices.trivial') }}
    </b-button>
    <b-button class="mr-xl-5 mr-sm-3" variant="warning" size="md" v-on:click="voted('dislike')">
      <img src="@/assets/dislike.png" class="pr-2" align="middle">
      {{ $t('poll.choices.dislike') }}
    </b-button>
    <b-button class="mr-xl-0 mr-sm-0" variant="danger" size="md" v-on:click="voted('hate')">
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
