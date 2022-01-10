import Vue from 'vue';
import { getSync } from '@/utils/api';

export default {
  state: () => ({
    showCookiesDialog: false,
  }),
  getters: {
    SHOW_COOKIES_DIALOG: state => state.showCookiesDialog,
  },
  mutations: {
    SHOW_COOKIES_DIALOG: (state, payload) => {
      state.showCookiesDialog = payload;
    },
  },
  actions: {
    FETCH_TWITTER_HTML: (context, payload) => {
      Vue.$log.debug('FETCH_TWITTER_HTML');
      const response = getSync('API', `/twitter-html?url=${payload.url}`);
      return response.data;
    },
  }
};
