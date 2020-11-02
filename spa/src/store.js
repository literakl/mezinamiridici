import Vue from 'vue';
import Vuex from 'vuex';

import items from './modules/items';
import users from './modules/users';
import polls from './modules/polls';
import comments from './modules/comments';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    users,
    comments,
    polls,
    items,
  },
});
