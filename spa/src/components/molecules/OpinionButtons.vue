<template>
    <div id="opinion-poll">
        <h3>What is your opinion?</h3>
        <button
            v-on:click="voted('No problem')"
            class="opinion-poll__button opinion-poll__button__no-problem"
        >
            <img src="@/assets/happy.png" align="middle">{{ $t('bar-chart.no-problem') }}
        </button>
        <button
            v-on:click="voted('Trivial trouble')"
            class="opinion-poll__button opinion-poll__button-trivial"
        >
            <img src="@/assets/ok.png">{{ $t('bar-chart.trivial-trouble') }}
        </button>
        <button
            v-on:click="voted('I don\'t like it')"
            class="opinion-poll__button opinion-poll__button-dont-like"
        >
            <img src="@/assets/slanty.png">{{ $t('bar-chart.i-dont-like-it') }}
        </button>
        <button
            v-on:click="voted('I hate it')"
            class="opinion-poll__button opinion-poll__button-hate"
        >
            <img src="@/assets/angry.png">{{ $t('bar-chart.i-hate-it') }}
        </button>
    </div>
</template>

<script>
export default {
  name: 'OpinionButtons',
  computed: {
    signedIn() {
      return this.$store.getters.SIGNED_IN;
    }
  },
  methods: {
    voted(vote) {
      if(!this.signedIn){
        this.$router.push({ name: 'sign-in' });
      }

      this.$emit('voted', vote);
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

.opinion-poll__button__no-problem {
  background: #0b6e00;
}

.opinion-poll__button-trivial {
  background: #006ca2;
}

.opinion-poll__button-dont-like {
  background: #ff3333;
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
