<template>
    <div>
        <h3>Top polls</h3>
        <div v-for="poll in polls" v-bind:key="poll.id">
            <hr />
            <h4>
                <router-link :to="{ name: 'poll', params: { id: poll.pollId }}">
                {{poll.text}}
                </router-link> &middot; 138 Votes &middot; 9 comments
            </h4>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

import polls from '@/static-data/polls.json';

export default {
  name: 'TopPolls',
  data: () => ({
    polls: []
  }),
  mounted () {
    axios
      .get(this.apiEndpoint + '/polls')
      .then(polls => (this.polls = polls.data))
  }
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
