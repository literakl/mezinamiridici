<template>
  <div id="home__wrapper">
    <div id="home__ads">
      Ads
    </div>
    <div id="home__content">
      <Heading />

      <div id="home__opinion-poll">
        <h3>What is your opinion?</h3>
        <button
          v-on:click="vote('no-problem')"
          class="home__opinion-poll-button home__opinion-poll-button__no-problem"
        >
          <img src="../assets/happy.png" align="middle">No problem
        </button>
        <button
          v-on:click="vote('trivial')"
          class="home__opinion-poll-button home__opinion-poll-button-trivial"
        >
          <img src="../assets/ok.png">Trivial trouble
        </button>
        <button
          v-on:click="vote('dont-like')"
          class="home__opinion-poll-button home__opinion-poll-button-dont-like"
        >
          <img src="../assets/slanty.png">I don't like it
        </button>
        <button
          v-on:click="vote('hate-it')"
          class="home__opinion-poll-button home__opinion-poll-button-hate"
        >
          <img src="../assets/angry.png">I hate it
        </button>
      </div>

      <TopPolls />
    </div>
  </div>
</template>

<script>
import TopPolls from '@/components/molecules/TopPolls.vue';
import Heading from '@/components/molecules/Heading.vue';

export default {
  name: 'home',
  components: {
    TopPolls,
    Heading,
  },
  methods: {
    vote(category) {
      console.log(`User voted ${category}`);
      this.$router.push('/poll/1');
    },
  },
};
</script>

<style>
#home__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

#home__content {
  order: 2;
}

#home__ads {
  height: 100%;
  background: grey;
  order: 1;
}

#home__opinion-poll {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.home__opinion-poll-button {
  color: #FFF;
  height: 55px;
  border-radius: 20px;
  font-size: 20px;
  margin: 0 10px 0 10px;
  grid-column: 1 / span 4;
  cursor: pointer;
}

.home__opinion-poll-button:hover {
  text-decoration: underline;
}

.home__opinion-poll-button img {
  width: 25px;
  vertical-align: middle;
  padding-right: 20px;
}

.home__opinion-poll-button__no-problem {
  background: #0b6e00;
}

.home__opinion-poll-button-trivial {
  background: #006ca2;
}

.home__opinion-poll-button-dont-like {
  background: #ff3333;
}

.home__opinion-poll-button-hate {
  background: #d60001;
}

#home__opinion-poll h3 {
  grid-column: 1 / span 4
}

@media all and (min-width: 850px) {
  #home__wrapper {
    grid-template-columns: 1fr 0.2fr;
  }

  #home__content {
    order: 1;
  }

  #home__ads {
    order: 2;
  }

  .home__opinion-poll-button {
    grid-column: auto;
  }
}
</style>
