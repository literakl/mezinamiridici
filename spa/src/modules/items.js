import Vue from 'vue';
import { deleteApi, get, patch, post } from '@/utils/api';

export default {
  state: () => ({
    tags: null,
    tagCloud: null,
    itemsByTag: null,
    blog: null,
    itemPictures: [],
    page: null,
  }),
  getters: {
    TAGS: state => state.tags,
    TAG_CLOUD: state => state.tagCloud,
    ITEMS_BY_TAG: state => state.itemsByTag,
    BLOG: state => state.blog,
    ITEM_PICTURES: state => state.itemPictures,
    PAGE: state => state.page,
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
    SET_PAGE: (state, payload) => {
      state.page = payload;
    },
    CLEAR_BLOG: (state) => {
      state.blog = {
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
          context.commit('SET_BLOG', response.data.data);
          return response.data;
        }).catch(err => err.response.data);
      return item;
    },
    FETCH_BLOG: async (context, payload) => {
      Vue.$log.debug('FETCH_BLOG');
      let blog;
      try {
        blog = await get('API', `/posts/${payload.slug}`, context);
      } catch (err) {
        if (err.response.status === 404 && payload.component) {
          await payload.component.$router.push({ name: 'junkyard' });
          return undefined;
        }
      }
      context.commit('SET_BLOG', blog.data.data);
      return blog.data.data;
    },
    DELETE_BLOG: async (context, payload) => {
      Vue.$log.debug('DELETE_BLOG');
      const { blogId } = payload;
      return deleteApi('API', `/posts/${blogId}`, {}, context);
    },
    FETCH_PAGE: async (context, payload) => {
      Vue.$log.debug(`FETCH_PAGE ${payload.slug}`);
      if (context.state.content != null && payload.slug === context.state.content.info.slug) {
        return; // cached value recycled
      }
      context.commit('SET_PAGE', null);
      let response;
      try {
        response = await get('API', `/pages/${payload.slug}`, context);
      } catch (err) {
        if (err.response.status === 404 && payload.component) {
          await payload.component.$router.push({ name: 'junkyard' });
          return;
        }
      }
      const cms = response.data.data;
      context.commit('SET_PAGE', cms);
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
    UPLOAD_IMAGE: async (context, payload) => {
      Vue.$log.debug('IMAGE_UPLOAD');
      const {
        body,
        progress,
      } = payload;
      const response = await post('API', '/images', body, context, undefined, progress);
      return response.data;
    },
    SET_IMAGE_ITEM: async (context, payload) => {
      Vue.$log.debug('IMAGE_UPLOAD');
      // todo pictureId in URL
      const response = await patch('API', '/images', payload, context);
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
    TOGGLE_EDITORIAL: async (context) => {
      Vue.$log.debug('TOGGLE_EDITORIAL');
      const { blog } = context.state;
      let { editorial } = blog.info || false;
      editorial = !editorial;
      const payload = {
        flag: editorial,
        id: blog._id,
      };
      await patch('API', `/posts/${payload.id}/editorial`, payload, context);
      Vue.set(blog.info, 'editorial', editorial);
      // if (response.success === true) {
      context.commit('SET_PAGE', blog);
    },
  },
};
