<template>
  <b-container>
    <b-row class="mb-3">
      <b-col>
        <h3>{{ $t('poll.your-opinion') }}</h3>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button variant="success" size="md" v-on:click="voted('neutral')">
          <img src="@/assets/happy.png" class="pr-2" align="middle">
          {{ $t('poll.choices.neutral') }}
        </b-button>
      </b-col>
      <b-col>
        <b-button variant="primary" size="md" v-on:click="voted('trivial')">
          <img src="@/assets/ok.png" class="pr-2" align="middle">
          {{ $t('poll.choices.trivial') }}
        </b-button>
      </b-col>
      <b-col>
        <b-button variant="warning" size="md" v-on:click="voted('dislike')">
          <img src="@/assets/dislike.png" class="pr-2" align="middle">
          {{ $t('poll.choices.dislike') }}
        </b-button>
      </b-col>
      <b-col>
        <b-button variant="danger" size="md" v-on:click="voted('hate')">
          <img src="@/assets/angry.png" class="pr-2" align="middle">
          {{ $t('poll.choices.hate') }}
        </b-button>
      </b-col>
    </b-row>
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
