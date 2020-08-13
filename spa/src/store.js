import Vue from 'vue';
import Vuex from 'vuex';

import users from './modules/users';
import polls from './modules/polls';
import comments from './modules/comments';
import { post } from '@/utils/api';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    users,
    comments,
    polls,
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
  },
});
