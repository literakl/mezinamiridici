import Vue from 'vue';
import Vuex from 'vuex';

import { get, post } from '@/utils/api';
import users from './modules/users';
import polls from './modules/polls';
import comments from './modules/comments';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    users,
    comments,
    polls,
    // items, TODO
  },
  state: {
    tags: null,
    itemsByTag: null,
  },
  getters: {
    TAGS: state => state.tags,
    ITEMS_BY_TAG: state => state.itemsByTag,
  },
  mutations: {
    SET_TAGS: (state, payload) => {
      state.tags = payload;
    },
    SET_ITEMS_BY_TAG: (state, payload) => {
      state.itemsByTag = payload;
    },
    // APPEND_STREAM: (state, payload) => {
    //   state.stream = payload;
    // },
  },
  actions: {
    SHARE_LINK: async (context, payload) => {
      const body = {
        path: payload.path,
        service: payload.service,
        userId: context.getters.USER_ID,
      };
      return post('API', `/items/${payload.itemId}/share`, body);
    },
    GET_TAGS: async (context) => {
      Vue.$log.debug('GET_TAGS');
      const response = await get('API', '/misc/tags/', context);
      context.commit('SET_TAGS', response.data.data);
      return response.data.data;
    },
    GET_ITEMS_BY_TAG: async (context, payload) => {
      Vue.$log.debug('GET_POLL_BY_TAG');
      const response = await get('BFF', `/items/${payload}`, context);
      context.commit('SET_ITEMS_BY_TAG', response.data.data);
      return response.data.data;
    },
  },
});
