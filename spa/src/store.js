import Vue from 'vue';
import Vuex from 'vuex';

import users from './modules/users';
import polls from './modules/polls';
import comments from './modules/comments';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    users,
    comments,
    polls,
  },
});
