import Vue from 'vue';
import Vuex from 'vuex';

import users from './modules/users';
import polls from './modules/polls';
import comments from './modules/comments';
import { get, post, patch } from '@/utils/api';

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
    itemPictures: [],
  },
  getters: {
    TAGS: state => state.tags,
    ITEMS_BY_TAG: state => state.itemsByTag,
    BLOG: state => state.blog,
    ITEM_PICTURES: state => state.itemPictures,
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
    SET_ITEM_PICTURES: (state, payload) => {
      state.itemPictures = payload;
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
    FETCH_ITEM_PICTURES: async (context) => {
      Vue.$log.debug('FETCH_ITEM_PICTURES');
      const response = await get('API', '/items/pictures', context);
      context.commit('SET_ITEM_PICTURES', response.data.data);
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
    FETCH_BLOG: async (context, payload) => {
      Vue.$log.debug('FETCH_BLOG');
      const blog = await get('API', `/blog/${payload.slug}`, context);
      context.commit('SET_BLOG', blog.data.data);
      return blog.data.data;
    },
    UPLOAD_IMAGE: async (context, payload) => {
      Vue.$log.debug('IMAGE_UPLOAD');
      const response = await post('API', '/uploadImage', payload, context);
      return response.data;
    },
  },
});
