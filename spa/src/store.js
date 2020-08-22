import Vue from 'vue';
import Vuex from 'vuex';

import users from './modules/users';
import polls from './modules/polls';
import comments from './modules/comments';
import { get, post, patch, put } from '@/utils/api';

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
    blog: null,
  },
  getters: {
    TAGS: state => state.tags,
    ITEMS_BY_TAG: state => state.itemsByTag,
    BLOG: state => state.blog,
  },
  mutations: {
    SET_TAGS: (state, payload) => {
      state.tags = payload;
    },
    SET_ITEMS_BY_TAG: (state, payload) => {
      state.itemsByTag = payload;
    },
    SET_BLOG: (state, payload) => {
      state.blog = payload;
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
    CREATE_BLOG: async (context, payload) => {
      Vue.$log.debug('CREATE_BLOG');
      const { title, source } = payload;
      const body = {
        title,
        source,
      };
      const blog = await post('API', '/blog', body, context);
      Vue.$log.debug(blog);
      return blog.data.success;
    },
    UPDATE_BLOG: async (context, payload) => {
      Vue.$log.debug('UPDATE_BLOG');
      const { blogId } = payload;
      const blogData = await patch('API', `/blog/${blogId}/`, payload, context);
      const item = blogData.data.data;
      context.commit('SET_BLOG', item);
      return item;
    },
    GET_BLOG: async (context) => {
      Vue.$log.debug('GET_BLOG');

      const blog = await get('API', '/blog', context);
      context.commit('SET_BLOG', blog.data.data);

      return blog.data.data;
    },
    IMAGE_UPLOAD: async (context, payload) => {
      Vue.$log.debug('IMAGE_UPLOAD');

      const response = await put('API', '/uploadImage', payload, context);
      return response.data;
    },
  },
});
