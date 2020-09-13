import Vue from 'vue';
import Vuex from 'vuex';

import { get, post, patch, deleteApi } from '@/utils/api';
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
    tagCloud: null,
    itemsByTag: null,
    blog: null,
    itemPictures: [],
    itemStream: [],
    cms: null,
  },
  getters: {
    TAGS: state => state.tags,
    TAG_CLOUD: state => state.tagCloud,
    ITEMS_BY_TAG: state => state.itemsByTag,
    BLOG: state => state.blog,
    ITEM_PICTURES: state => state.itemPictures,
    ITEM_STREAM: state => state.itemStream,
    CMS: state => state.cms,
  },
  mutations: {
    SET_TAGS: (state, payload) => {
      state.tags = payload;
    },
    SET_TAG_CLOUD: (state, payload) => {
      state.tagCloud = payload;
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
    APPEND_STREAM: (state, payload) => {
      state.itemStream.push(...payload);
    },
    SET_CMS: (state, payload) => {
      state.cms = payload;
    },
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
    FETCH_TAGS: async (context) => {
      Vue.$log.debug('FETCH_TAGS');
      const response = await get('API', '/misc/tags/', context);
      context.commit('SET_TAGS', response.data.data);
      return response.data.data;
    },
    FETCH_TAG_CLOUD: async (context) => {
      Vue.$log.debug('FETCH_TAG_CLOUD');
      const response = await get('API', '/misc/tags/cloud', context);
      context.commit('SET_TAG_CLOUD', response.data.data);
      return response.data.data;
    },
    FETCH_ITEMS_BY_TAG: async (context, payload) => {
      Vue.$log.debug('FETCH_ITEMS_BY_TAG');
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
      const blog = await post('API', '/blog', payload, context);
      return blog.data.data;
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
    FETCH_CMS: async (context, payload) => {
      Vue.$log.debug(`FETCH_CMS ${payload.slug}`);
      if (context.state.cms != null && payload.slug === context.state.cms.info.slug) {
        return; // cached value recycled
      }
      context.commit('SET_CMS', null);
      let cmsData = null;
      if (payload.type === 'content') {
        cmsData = await get('BFF', `/c/${payload.slug}`, context);
      } else {
        cmsData = await get('BFF', `/h/${payload.slug}`, context);
      }
      const cms = cmsData.data.data;
      context.commit('SET_CMS', cms);
    },
    CREATE_CMS: async (context, payload) => {
      Vue.$log.debug('CREATE_CMS');
      const cmsData = await post('API', '/cms', payload, context);
      return cmsData.data.data;
    },
    UPDATE_CMS: async (context, payload) => {
      Vue.$log.debug('UPDATE_CMS');
      const { cmsId } = payload;
      const cmsData = await patch('API', `/cms/${cmsId}/`, payload, context);
      const item = cmsData.data.data;
      context.commit('SET_CMS', item);
      return item;
    },
    DELETE_CMS: async (context, payload) => {
      Vue.$log.debug('DELETE_CMS');
      const { cmsId } = payload;
      return deleteApi('API', `/cms/${cmsId}/`, {}, context);
    },
    FETCH_CMS_LIST: async (context) => {
      Vue.$log.debug('FETCH_CMS_LIST');
      const response = await get('BFF', '/cms-list', context);
      return response.data.data;
    },
    UPLOAD_IMAGE: async (context, payload) => {
      Vue.$log.debug('IMAGE_UPLOAD');
      const response = await post('API', '/uploadImage', payload, context);
      return response.data;
    },
    GET_ITEM_STREAM: async (context, payload) => {
      Vue.$log.debug('GET_ITEM_STREAM');
      const { start, num, tag } = payload;
      const response = await get('API', `/item-stream?start=${start}&num=${num}&tag=${tag}`, context);
      // context.commit('APPEND_STREAM', response.data.data);
      return response.data.data;
    },
  },
});
