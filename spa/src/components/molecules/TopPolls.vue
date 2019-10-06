<template>
    <div>
        <h3>Top polls</h3>
        <div v-if="polls">
          <div v-for="poll in polls" v-bind:key="poll.id">
              <hr />
              <h4>
                  <router-link :to="{ name: 'poll', params: { id: poll.pollId }}">
                  {{poll.text}}
                  </router-link> &middot; {{poll.votes}} Votes &middot; {{poll.comments}} comments
              </h4>
          </div>
        </div>
        <div v-if="!polls">
          <hr />
          <content-loader
            :height="20"
            :width="400"
            :speed="2"
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb"
          >
            <rect x="0" y="12" rx="3" ry="3" width="70" height="5" /> 
            <rect x="80" y="12" rx="3" ry="3" width="30" height="5" /> 
            <rect x="120" y="12" rx="3" ry="3" width="30" height="5" /> 
          </content-loader>
          <hr/>
          <content-loader
            :height="20"
            :width="400"
            :speed="2"
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb"
          >
            <rect x="0" y="12" rx="3" ry="3" width="70" height="5" /> 
            <rect x="80" y="12" rx="3" ry="3" width="30" height="5" /> 
            <rect x="120" y="12" rx="3" ry="3" width="30" height="5" /> 
          </content-loader>
          <hr/>
          <content-loader
            :height="20"
            :width="400"
            :speed="2"
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb"
          >
            <rect x="0" y="12" rx="3" ry="3" width="70" height="5" /> 
            <rect x="80" y="12" rx="3" ry="3" width="30" height="5" /> 
            <rect x="120" y="12" rx="3" ry="3" width="30" height="5" /> 
          </content-loader>
          <hr/>
          <content-loader
            :height="20"
            :width="400"
            :speed="2"
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb"
          >
            <rect x="0" y="12" rx="3" ry="3" width="70" height="5" /> 
            <rect x="80" y="12" rx="3" ry="3" width="30" height="5" /> 
            <rect x="120" y="12" rx="3" ry="3" width="30" height="5" /> 
          </content-loader>
          <hr/>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { ContentLoader } from "vue-content-loader"

export default {
  name: 'TopPolls',
  components: {
    ContentLoader
  },
  computed: {
    polls() {
      return this.$store.getters.POLLS;
    },
  },
  created() {
    this.$store.dispatch('GET_POLLS');
  },
};
</script>


<style lang="scss">
#sign-up-form-wrapper {
    display: grid;
    grid-template-columns: 0.3fr 1fr;
    margin-top: 40px;
}

.sign-up-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
}
</style>
