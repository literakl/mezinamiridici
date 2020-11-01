import Vue from 'vue';
import { deleteApi, get, patch, post } from '@/utils/api';

export default {
  state: () => ({
    poll: null,
    latestPoll: null,
  }),
  getters: {
    POLL: state => state.poll,
    LATEST_POLL: state => state.latestPoll,
  },
  mutations: {
    SET_POLL: (state, payload) => {
      state.poll = payload;
    },
    SET_LATEST_POLL: (state, payload) => {
      state.latestPoll = payload;
    },
  },
  actions: {
    GET_POLL: async (context, payload) => {
      Vue.$log.debug(`GET_POLL ${payload.slug}`);
      if (context.state.poll != null && payload.slug === context.state.poll.info.slug) {
        return; // cached value recycled
      }
      context.commit('SET_POLL', null);
      const pollData = await get('BFF', `/polls/${payload.slug}`, context);
      const item = pollData.data.data;
      context.commit('SET_POLL', item);
    },
    GET_POLLS: async (context, payload) => {
      Vue.$log.debug('GET_POLLS');
      let url = '/polls';
      if (payload.lastSeen) {
        url += `?lr=id:${payload.lastSeen}`;
      }
      const response = await get('BFF', url, context);
      return response.data.data;
    },
    CREATE_POLL: async (context, payload) => {
      Vue.$log.debug('CREATE_POLL');
      const pollData = await post('API', '/polls', payload, context);
      return pollData.data.data;
    },
    UPDATE_POLL: async (context, payload) => {
      Vue.$log.debug('UPDATE_POLL');
      const { pollId } = payload;
      const pollData = await patch('API', `/polls/${pollId}/`, payload, context);
      const item = pollData.data.data;
      context.commit('SET_POLL', item);
      return item;
    },
    DELETE_POLL: async (context, payload) => {
      Vue.$log.debug('DELETE_POLL');
      const { pollId } = payload;
      return deleteApi('API', `/polls/${pollId}/`, {}, context);
    },
    POLL_VOTE: async (context, payload) => {
      Vue.$log.debug('POLL_VOTE');
      const body = { vote: payload.vote };
      const pollData = await post('BFF', `/polls/${payload.id}/votes`, body, context);
      const item = pollData.data.data;
      context.commit('SET_POLL', item);
      if (context.state.latestPoll && context.state.latestPoll._id === item._id) {
        context.commit('SET_LATEST_POLL', item);
      }
    },
    GET_POLL_VOTES: async (context, payload) => {
      Vue.$log.debug(`GET_POLL_VOTES ${payload.id} ${payload.query}`);
      return get('BFF', `/polls/${payload.id}/votes?${payload.query}`);
    },
    GET_LATEST_POLL: async (context) => {
      Vue.$log.debug('GET_LATEST_POLL');
      const pollData = await get('BFF', '/polls/last', context);
      const poll = pollData.data.data;
      context.commit('SET_LATEST_POLL', poll);
      context.commit('SET_POLL', poll);
    },
  },
};
