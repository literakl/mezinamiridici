<template>
    <b-container fluid class="w-75 m-auto pt-5 pb-5">
        <h3>{{ $t('poll.your-opinion') }}</h3>
        <b-button class="mr-5" variant="success" size="lg" v-on:click="voted('neutral')">
          <img src="@/assets/happy.png" class="pr-2" align="middle">
          {{ $t('poll.choices.neutral') }}
        </b-button>
        <b-button class="mr-5" variant="primary" size="lg" v-on:click="voted('trivial')">
          <img src="@/assets/ok.png">
          {{ $t('poll.choices.trivial') }}
        </b-button>
        <b-button class="mr-5" variant="warning" size="lg" v-on:click="voted('dislike')">
          <img src="@/assets/slanty.png">
          {{ $t('poll.choices.dislike') }}
        </b-button>
        <b-button class="mr-5" variant="danger" size="lg" v-on:click="voted('hate')">
          <img src="@/assets/angry.png">
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


<style lang="scss">


.opinion-poll__button {
  color: #FFF;
  height: 55px;
  border-radius: 20px;
  font-size: 20px;
  margin: 0 10px 0 10px;
  grid-column: 1 / span 4;
  cursor: pointer;
}

.opinion-poll__button:hover {
  text-decoration: underline;
}

.opinion-poll__button img {
  width: 25px;
  vertical-align: middle;
  padding-right: 20px;
}

.opinion-poll__button__neutral {
  background: #0b6e00;
}

.opinion-poll__button-trivial {
  background: #006ca2;
}

.opinion-poll__button-dislike {
  background: #fd6a02;
}

.opinion-poll__button-hate {
  background: #d60001;
}

#opinion-poll h3 {
  grid-column: 1 / span 4
}

@media all and (min-width: 850px) {
  .opinion-poll__button {
    grid-column: auto;
  }
}
</style>
