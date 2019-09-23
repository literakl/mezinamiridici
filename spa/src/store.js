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
    },
    POLL : state => {
      return state.poll;
    }
  },
  mutations: {
    SET_POLLS: (state, payload) => {
      state.polls = payload;
    },
    SET_POLL: (state, payload) => {
      state.poll = payload;
    }
  },
  actions: {
    GET_POLLS: async (context, payload) => {
      let { data } = await axios.get(API_ENDPOINT + '/polls');
      context.commit('SET_POLLS', data);
    },
    GET_POLL: async (context, payload) => {
      context.commit('SET_POLL', data);
      let { data } = await axios.get(API_ENDPOINT + '/polls/' + payload.id);
      context.commit('SET_POLL', data);
    }
  }
});
