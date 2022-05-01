import Vue from 'vue';
import { get } from '@/utils/api';

export default {
  state: () => ({
  }),
  getters: {
  },
  mutations: {
  },
  actions: {
    GET_ACCIDENTS_SUMMARY: async() => {
      Vue.$log.debug('GET_ACCIDENTS_SUMMARY');
      const response = await get('API', '/accidents/last');
      return response.data.data;
    },
    GET_ACCIDENTS: async (context, payload) => {
      Vue.$log.debug(`GET_ACCIDENTS ${payload.day}`);
      return await get('API', `/accidents/${payload.day}`, context);
    },
  }
};
