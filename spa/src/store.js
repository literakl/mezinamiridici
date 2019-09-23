import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const API_ENDPOINT = 'https://ri5m1kvdnb.execute-api.eu-west-1.amazonaws.com/production/v1';

export default new Vuex.Store({
  state: {
    polls: null,
    poll: null
  },
  getters: {
    POLLS : state => {
      return state.polls;
    }
  },
  mutations: {
    SET_POLLS: (state, payload) => {
      state.polls = payload;
    },
  },
  actions: {
    GET_POLLS: async (context, payload) => {
      let { data } = await axios.get(API_ENDPOINT + '/polls')
      console.log(data);
      context.commit('SET_POLLS', data)
    }
  },
});
