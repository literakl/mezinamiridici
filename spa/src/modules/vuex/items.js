/* eslint-disable prefer-destructuring */
import Vue from 'vue';
import { deleteApi, get, patch, post, getSync } from '@/utils/api';

export default {
  state: () => ({
    tags: null,
    tagCloud: null,
    itemsByTag: null,
    content: null,
    itemPictures: [],
  }),
  getters: {
    TAGS: state => state.tags,
    TAG_CLOUD: state => state.tagCloud,
    ITEMS_BY_TAG: state => state.itemsByTag,
    CONTENT: state => state.content,
    ITEM_PICTURES: state => state.itemPictures,
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
    SET_CONTENT: (state, payload) => {
      state.content = payload;
    },
    SET_ITEM_PICTURES: (state, payload) => {
      state.itemPictures = payload;
    },
    CLEAR_CONTENT: (state) => {
      console.log('CLEAR_CONTENT');
      state.content = {
        comments: {},
        data: {},
        info: {
          author: {},
        },
        type: '',
      };
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
    FETCH_STREAM_PICTURES: async (context) => {
      Vue.$log.debug('FETCH_STREAM_PICTURES');
      const response = await get('API', '/items/pictures', context);
      context.commit('SET_ITEM_PICTURES', response.data.data);
      return response.data.data;
    },
    CREATE_BLOG: async (context, payload) => {
      Vue.$log.debug('CREATE_BLOG');
      const blog = await post('API', '/posts', payload, context)
        .then(response => response.data)
        .catch(err => err.response.data);
      return blog;
    },
    UPDATE_BLOG: async (context, payload) => {
      Vue.$log.debug('UPDATE_BLOG');
      const { blogId } = payload;
      const item = await patch('API', `/posts/${blogId}/`, payload, context)
        .then((response) => {
          context.commit('SET_CONTENT', response.data.data);
          return response.data;
        }).catch(err => err.response.data);
      return item;
    },
    DELETE_BLOG: async (context, payload) => {
      Vue.$log.debug('DELETE_BLOG');
      const { blogId } = payload;
      return deleteApi('API', `/posts/${blogId}`, {}, context);
    },
    FETCH_CONTENT: async (context, payload) => {
      Vue.$log.debug(`FETCH_CONTENT ${payload.slug}`);
/*
      if (context.state.content != null && payload.slug === context.state.content.info.slug) {
        Vue.$log.debug(`Slug is in the cache`);
        return; // cached value recycled
      }
      context.commit('SET_CONTENT', null);
*/
      let response;
      try {
        response = await get('API', `/content/${payload.slug}`, context);
      } catch (err) {
        if (err.response.status === 404 && payload.component) {
          await payload.component.$router.push({ name: 'junkyard' });
          return;
        }
      }
      context.commit('SET_CONTENT', response.data.data);
      return response.data.data;
    },
    FETCH_PAGES: async (context) => {
      Vue.$log.debug('FETCH_PAGES');
      const response = await get('API', '/pages', context);
      return response.data.data;
    },
    CREATE_PAGE: async (context, payload) => {
      Vue.$log.debug('CREATE_PAGE');
      const cmsData = await post('API', '/pages', payload, context);
      return cmsData.data.data;
    },
    UPDATE_PAGE: async (context, payload) => {
      Vue.$log.debug('UPDATE_PAGE');
      const { pageId } = payload;
      const cmsData = await patch('API', `/pages/${pageId}/`, payload, context);
      const item = cmsData.data.data;
      context.commit('SET_PAGE', item);
      return item;
    },
    DELETE_PAGE: async (context, payload) => {
      Vue.$log.debug('DELETE_PAGE');
      const { cmsId } = payload;
      return deleteApi('API', `/pages/${cmsId}/`, {}, context);
    },
    DELETE_ARTICLE: async (context, payload) => {
      Vue.$log.debug('DELETE_ARTICLE');
      const { blogId } = payload;
      return deleteApi('API', `/articles/${blogId}`, {}, context);
    },
    FETCH_ARTICLES: async (context) => {
      Vue.$log.debug('FETCH_ARTICLES');
      const response = await get('BFF', '/articles', context);
      return response.data.data;
    },
    UPLOAD_IMAGE: async (context, payload) => {
      Vue.$log.debug('IMAGE_UPLOAD');
      const {
        body,
        progress,
      } = payload;
      const response = await post('API', '/images', body, context, undefined, progress);
      return response.data;
    },
    GET_ITEM_STREAM: async (context, payload) => {
      Vue.$log.debug('GET_ITEM_STREAM');
      const { start, size, tag } = payload;
      let url = `/item-stream?start=${start}&ps=${size}`;
      if (tag) {
        url = `${url}&tag=${tag}`;
      }
      const response = await get('API', url, context);
      return response.data.data;
    },
    TOGGLE_PUBLISHED: async (context) => {
      Vue.$log.debug('TOGGLE_PUBLISHED');
      const { content } = context.state;
      let published = content.info.state === 'published';
      published = !published;
      const payload = {
        flag: published,
      };
      await patch('API', `/articles/${content._id}/published`, payload, context);
      Vue.set(content.info, 'state', published ? 'published' : 'draft');
      context.commit('SET_PAGE', content);
    },
    TOGGLE_HIDDEN: async (context) => {
      Vue.$log.debug('TOGGLE_HIDDEN');
      const { content } = context.state;
      let hidden = content.info.state === 'hidden';
      hidden = !hidden;
      const payload = {
        flag: hidden,
      };
      await patch('API', `/posts/${content._id}/hidden`, payload, context);
      Vue.set(content.info, 'state', hidden ? 'hidden' : 'published');
    },
  },
};
