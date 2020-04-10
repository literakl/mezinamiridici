<template>
    <div id="opinion-poll">
        <h3>{{ $t('poll.your-opinion') }}</h3>
        <button
            v-on:click="voted('neutral')"
            class="opinion-poll__button opinion-poll__button__neutral"
        >
            <img src="@/assets/happy.png" align="middle">{{ $t('poll.choices.neutral') }}
        </button>
        <button
            v-on:click="voted('trivial')"
            class="opinion-poll__button opinion-poll__button-trivial"
        >
            <img src="@/assets/ok.png">{{ $t('poll.choices.trivial') }}
        </button>
        <button
            v-on:click="voted('dislike')"
            class="opinion-poll__button opinion-poll__button-dislike"
        >
            <img src="@/assets/slanty.png">{{ $t('poll.choices.dislike') }}
        </button>
        <button
            v-on:click="voted('hate')"
            class="opinion-poll__button opinion-poll__button-hate"
        >
            <img src="@/assets/angry.png">{{ $t('poll.choices.hate') }}
        </button>
    </div>
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

#opinion-poll {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

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
