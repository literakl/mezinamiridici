import Vue from 'vue';
import Vuex from 'vuex';
import jwtDecode from 'jwt-decode';

import { deleteApi, get, patch, post } from './utils/api';
import comments from './modules/comments';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    comments,
  },
  state: {
    authorized: false,
    userToken: null,
    userId: null,
    userNickname: null,
    userRole: null,
    poll: null,
    latestPoll: null,
    stream: null,
  },
  getters: {
    IS_AUTHORIZED: state => state.authorized,
    USER_TOKEN: state => state.userToken,
    USER_ID: state => state.userId,
    USER_NICKNAME: state => state.userNickname,
    USER_ROLE: state => state.userRole,
    POLL: state => state.poll,
    LATEST_POLL: state => state.latestPoll,
    STREAM: state => state.stream,
  },
  mutations: {
    SET_AUTHORIZED: (state, payload) => {
      state.authorized = payload;
    },
    SET_USER_TOKEN: (state, payload) => {
      state.userToken = payload;
    },
    SET_USER_ID: (state, payload) => {
      state.userId = payload;
    },
    SET_USER_NICKNAME: (state, payload) => {
      state.userNickname = payload;
    },
    SET_USER_ROLE: (state, payload) => {
      state.userRole = payload;
    },
    SET_POLL: (state, payload) => {
      state.poll = payload;
    },
    SET_LATEST_POLL: (state, payload) => {
      state.latestPoll = payload;
    },
    SET_STREAM: (state, payload) => {
      state.stream = payload;
    },
    // APPEND_STREAM: (state, payload) => {
    //   state.stream = payload;
    // },
  },
  actions: {
    CHANGE_PASSWORD: async (context, payload) => {
      const body = {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      };
      await patch('API', `/users/${context.state.userId}/password`, body, context);
      await context.dispatch('SIGN_USER_OUT');
    },
    FORGOT_PASSWORD: async (context, payload) => {
      const body = {
        email: payload.email,
      };
      await post('API', '/forgotPassword', body);
    },
    RESET_PASSWORD: (context, payload) => {
      const body = {
        resetPasswordToken: payload.resetPasswordToken,
        password: payload.password,
      };
      return post('API', '/resetPassword', body);
    },
    SIGN_SOCIAL_USER: (context, payload) => {
      context.commit('SET_POLL', null);
      context.commit('SET_LATEST_POLL', null);
      context.commit('SET_USER_TOKEN', null);
      context.commit('SET_AUTHORIZED', false);
      context.commit('SET_USER_ID', null);
      context.commit('SET_USER_ROLE', null);
      context.commit('SET_USER_NICKNAME', null);


      // const response = await get('API', `/auth/${payload}`);

      const jwt = payload;
      const jwtData = jwtDecode(jwt);

      Vue.$log.debug(jwtData);

      if (jwtData.auth.verified) {
        context.commit('SET_USER_TOKEN', jwt);
        context.commit('SET_AUTHORIZED', true);
        context.commit('SET_USER_ID', jwtData.userId);
        context.commit('SET_USER_NICKNAME', jwtData.nickname);
        context.commit('SET_USER_ROLE', jwtData.roles);
        localStorage.setItem('jwt', jwt);
        return true;
      }

      if (jwtData.auth.socialUser) {
        return jwtData;
      }
      return false;
    },
    SIGN_USER_IN: async (context, payload) => {
      context.commit('SET_POLL', null);
      context.commit('SET_LATEST_POLL', null);
      context.commit('SET_USER_TOKEN', null);
      context.commit('SET_AUTHORIZED', false);
      context.commit('SET_USER_ID', null);
      context.commit('SET_USER_ROLE', null);
      context.commit('SET_USER_NICKNAME', null);

      const body = {
        email: payload.email,
        password: payload.password,
      };
      const response = await post('API', '/authorizeUser', body);

      // must implement for error message process.

      const jwt = response.data.data;
      const jwtData = jwtDecode(jwt);
      localStorage.setItem('jwt', jwt);

      context.commit('SET_USER_TOKEN', jwt);
      context.commit('SET_AUTHORIZED', true);
      context.commit('SET_USER_ID', jwtData.userId);
      context.commit('SET_USER_NICKNAME', jwtData.nickname);
      context.commit('SET_USER_ROLE', jwtData.roles);
      return true;
    },
    SIGN_USER_OUT: (context) => {
      localStorage.removeItem('jwt');
      context.commit('SET_USER_TOKEN', null);
      context.commit('SET_AUTHORIZED', false);
      context.commit('SET_USER_ID', null);
      context.commit('SET_USER_NICKNAME', null);
      context.commit('SET_USER_ROLE', null);
      context.commit('SET_LATEST_POLL', null);
      context.commit('SET_POLL', null);
    },
    GET_DECODED_JWT: () => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return;
      const jwtData = jwtDecode(jwt);
      // eslint-disable-next-line consistent-return
      return {
        decoded: jwtData,
        encoded: { token: jwt },
      };
    },
    LOAD_USER: async (context) => {
      let jwt = localStorage.getItem('jwt');
      let clean = false;
      if (jwt) {
        try {
          const jwtData = jwtDecode(jwt);
          context.commit('SET_USER_ID', jwtData.userId);
          context.commit('SET_USER_NICKNAME', jwtData.nickname);
          context.commit('SET_AUTHORIZED', true);
          context.commit('SET_USER_TOKEN', jwt);
          context.commit('SET_USER_ROLE', jwtData.roles);

          if (Date.now() > 1000 * (jwtData.iat + 24 * 3600)) {
            const response = await post('API', `/users/${jwtData.userId}/validateToken`, { }, context);
            jwt = response.data.data;
            localStorage.setItem('jwt', jwt);
            context.commit('SET_USER_TOKEN', jwt);
          }
        } catch (e) {
          Vue.$log.error('Validate token failed', e);
          clean = true;
        }
      } else {
        clean = true;
      }
      if (clean) {
        localStorage.removeItem('jwt');
        context.commit('SET_USER_TOKEN', null);
        context.commit('SET_AUTHORIZED', false);
        context.commit('SET_USER_ID', null);
      }
    },
    CREATE_USER_PROFILE: (context, payload) => {
      const body = {
        email: payload.email,
        password: payload.password,
        nickname: payload.nickname,
        termsAndConditions: payload.termsAndConditions,
        dataProcessing: payload.dataProcessing,
        emails: payload.marketing,
      };
      return post('API', '/users', body);
    },
    UPDATE_USER_PROFILE: (context, payload) => {
      const body = {
        drivingSince: payload.drivingSince,
        vehicles: payload.vehicle,
        sex: payload.sex,
        born: payload.bornInYear,
        region: payload.region,
        education: payload.education,
        publicProfile: payload.publicProfile,
      };
      return patch('API', `/users/${payload.userId}`, body, context, payload.jwt);
    },
    UPDATE_SOCIAL_USER: async (context, payload) => {
      const body = {
        email: payload.email,
        nickname: payload.nickname,
        password: payload.password,
        termsAndConditions: payload.termsAndConditions,
        dataProcessing: payload.personalDataProcessing,
        emails: payload.emailNotifications,
      };
      const response = await patch('API', `/socialusers/${payload.userId}`, body, context, payload.jwt);

      const jwt = response.data.data;
      const jwtData = jwtDecode(jwt);
      localStorage.setItem('jwt', jwt);
      context.commit('SET_USER_TOKEN', jwt);
      context.commit('SET_AUTHORIZED', true);
      context.commit('SET_USER_ID', jwtData.userId);
      context.commit('SET_USER_NICKNAME', jwtData.nickname);
      context.commit('SET_USER_ROLE', jwtData.roles);

      return true;
    },
    VERIFY_USER: (context, payload) => post('API', `/verify/${payload.token}`),
    GET_USER_PROFILE_BY_ID: async (context, payload) => get('API', `/users/${payload.id}`, context),
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
    INIT_STREAM: async (context) => {
      Vue.$log.debug('INIT_STREAM');
      const pollRequest = get('BFF', '/polls/last', context);
      const streamRequest = get('BFF', '/polls/?obd=date', context);
      Promise.all([pollRequest, streamRequest])
        .then(([pollData, streamData]) => {
          const poll = pollData.data.data;
          context.commit('SET_LATEST_POLL', poll);
          context.commit('SET_POLL', poll);

          let items = streamData.data.data;
          items = items.filter(item => item._id !== poll._id);
          context.commit('SET_STREAM', items);
        });
    },
    VERIFY_MAIL: async (context, payload) => {
      const body = {
        email: payload.email,
      };
      const response = await post('API', '/check/email', body);
      return response;
    },
    VERIFY_NICKNAME: async (context, payload) => {
      const body = {
        nickname: payload.nickname,
      };
      const response = await post('API', '/check/nickname', body);
      return response;
    },
  },
});
