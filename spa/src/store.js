import Vue from 'vue';
import Vuex from 'vuex';

import app from './modules/vuex/app';
import items from './modules/vuex/items';
import users from './modules/vuex/users';
import polls from './modules/vuex/polls';
import comments from './modules/vuex/comments';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    users,
    comments,
    polls,
    items,
    app,
  },
});
