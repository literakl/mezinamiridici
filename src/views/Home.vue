<template>
  <div id="home">
    <div id="ads">
      Ads
    </div>
    <div id="content">
      <div id="heading">
        <hr />
        <h2 id="heading-title">"Slow car blocks the lane and its driver refuses to switch lanes"</h2>
        <div id="heading-metadata">
          <ul id="heading-metadata__details">
            <li>30.07.2018</li>
            <li>Leoś</li>
            <li>53 votes</li>
            <li>290 comments</li>
          </ul>
          <ul id="heading-metadata__social">
            <li>(Facebook) Like | Share</li>
            <li>Twitter Share</li>
          </ul>
        </div>
        <hr />
      </div>

      <div id="opinion-poll">
        <h3>What is your opinion?</h3>
        <button v-on:click="vote('no-problem')" class="opinion-poll-button opinion-poll-button__no-problem"><img src="../assets/happy.png" align="middle">No problem</button>
        <button v-on:click="vote('trivial')" class="opinion-poll-button opinion-poll-button__trivial"><img src="../assets/ok.png">Trivial trouble</button>
        <button v-on:click="vote('dont-like')" class="opinion-poll-button opinion-poll-button__dont-like"><img src="../assets/slanty.png">I don't like it</button>
        <button v-on:click="vote('hate-it')" class="opinion-poll-button opinion-poll-button__hate"><img src="../assets/angry.png">I hate it</button>
      </div>

      <div>
        <h3>Top polls</h3>
        <hr />
        <h4>
          <router-link to="/poll/1">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
          </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>
        <hr />
        <h4>
          <router-link to="/poll/2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
          </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>        
        <hr />
        <h4>
          <router-link to="/poll/3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
          </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>
        <hr />
        <h4>
          <router-link to="/poll/4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
          </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>      
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'home',
  components: {
  },
  methods: {
    vote: function (category){
      this.$router.push('/poll/1')
    }
  }
};
</script>

<style>


#home {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

#content {
  order: 2;
}

#ads {
  height: 100%;
  background: grey;
  order: 1;
}

#heading-title {
  font-size: 34px;
  line-height: 32px;
}

#heading-metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

#heading-metadata__social {
  text-align: right;
}

#heading-metadata ul {
  list-style: none;
  padding: 0;
}

#heading-metadata li {
  display: inline-block;
}

#heading-metadata li:after {
  content: '\b7\a0';
  padding: 0 10px 0 10px;
}

#heading-metadata li:last-child:after {
  content: '';
}

#opinion-poll {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.opinion-poll-button {
  color: #FFF;
  height: 55px;
  border-radius: 20px;
  font-size: 20px;
  margin: 0 10px 0 10px;
  grid-column: 1 / span 4;
  cursor: pointer;
}

.opinion-poll-button:hover {
  text-decoration: underline;
}

.opinion-poll-button img {
  width: 25px;
  vertical-align: middle;
  padding-right: 20px;
}

.opinion-poll-button__no-problem {
  background: #0b6e00;
}

.opinion-poll-button__trivial {
  background: #006ca2;
}

.opinion-poll-button__dont-like {
  background: #ff3333;
}

.opinion-poll-button__hate {
  background: #d60001;
}

#opinion-poll h3 {
  grid-column: 1 / span 4
}

@media all and (min-width: 850px) {
  #home {
    grid-template-columns: 1fr 0.2fr;
  }

  #content {
    order: 1;
  }

  #ads {
    order: 2;
  }

  .opinion-poll-button {
    grid-column: auto;
  }
}
</style>
