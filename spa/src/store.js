import Vue from 'vue';
import Vuex from 'vuex';
import jwtDecode from 'jwt-decode';

const axios = require('axios').default;

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';

Vue.use(Vuex);

const {
  VUE_APP_API_ENDPOINT, VUE_APP_BFF_ENDPOINT,
  REPLY_LIMIT,
} = process.env;
const API_ENDPOINT = VUE_APP_API_ENDPOINT;
const BFF_ENDPOINT = VUE_APP_BFF_ENDPOINT;

function getAuthHeader(context, jwt = undefined) {
  const config = { headers: { } };
  if (jwt || context.state.userToken) {
    config.headers.Authorization = `bearer ${jwt || context.state.userToken}`;
  }
  return config;
}

export default new Vuex.Store({
  state: {
    authorized: false,
    userToken: null,
    userId: null,
    userNickname: null,
    poll: null,
    latestPoll: null,
    stream: null,
    comments: null,
    // replies: null; https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143/51
    // users: null, https://github.com/paularmstrong/normalizr
  },
  getters: {
    IS_AUTHORIZED: state => state.authorized,
    USER_TOKEN: state => state.userToken,
    USER_ID: state => state.userId,
    USER_NICKNAME: state => state.userNickname,
    POLL: state => state.poll,
    LATEST_POLL: state => state.latestPoll,
    STREAM: state => state.stream,
    COMMENTS: state => state.comments,
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
    SET_COMMENTS: (state, payload) => {
      state.pollComments = payload;
    },
    SET_COMMENT_REPLIES: (state, commentId, replies) => {
      const comment = state.comments.find(x => x._id === commentId);
      if (comment !== undefined) {
        comment.allReplies = comment.allReplies.concat(replies);
        comment.showAll = true;
        comment.replies = comment.allReplies;
      } else {
        console.log(`Comment ${commentId} not found`);
      }
    },
  },
  actions: {
    CHANGE_PASSWORD: async (context, payload) => {
      await axios.patch(
        `${API_ENDPOINT}/users/${context.state.userId}/password`, {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        }, getAuthHeader(context),
      );
      await context.dispatch('SIGN_USER_OUT');
    },
    FORGOT_PASSWORD: (context, payload) => axios.post(`${API_ENDPOINT}/forgotPassword`, {
      email: payload.email,
    }),
    RESET_PASSWORD: (context, payload) => axios.post(`${API_ENDPOINT}/resetPassword`, {
      resetPasswordToken: payload.resetPasswordToken,
      password: payload.password,
    }),
    SET_SOCIAL: async (context, payload) => {
      const jwt = payload.access_token;
      const jwtData = jwtDecode(jwt);
      localStorage.setItem('jwt', jwt);

      context.commit('SET_USER_TOKEN', jwt);
      context.commit('SET_AUTHORIZED', true);
      context.commit('SET_USER_ID', jwtData.userId);
      context.commit('SET_USER_NICKNAME', jwtData.nickname);
    },
    SIGN_USER_IN: async (context, payload) => {
      context.commit('SET_POLL', null);
      context.commit('SET_LATEST_POLL', null);
      context.commit('SET_USER_TOKEN', null);
      context.commit('SET_AUTHORIZED', false);
      context.commit('SET_USER_ID', null);
      context.commit('SET_USER_NICKNAME', null);

      const axiosResponse = await axios.post(`${API_ENDPOINT}/authorizeUser`, {
        email: payload.email,
        password: payload.password,
      });

      const jwt = axiosResponse.data.data;
      const jwtData = jwtDecode(jwt);
      localStorage.setItem('jwt', jwt);

      context.commit('SET_USER_TOKEN', jwt);
      context.commit('SET_AUTHORIZED', true);
      context.commit('SET_USER_ID', jwtData.userId);
      context.commit('SET_USER_NICKNAME', jwtData.nickname);
      return true;
    },
    SIGN_USER_OUT: (context) => {
      localStorage.removeItem('jwt');
      context.commit('SET_USER_TOKEN', null);
      context.commit('SET_AUTHORIZED', false);
      context.commit('SET_USER_ID', null);
      context.commit('SET_USER_NICKNAME', null);
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

          if (Date.now() > 1000 * (jwtData.iat + 24 * 3600)) {
            const axiosResponse = await axios.post(`${API_ENDPOINT}/users/${jwtData.userId}/validateToken`,
              { },
              getAuthHeader(context));
            jwt = axiosResponse.data.data;
            localStorage.setItem('jwt', jwt);
            context.commit('SET_USER_TOKEN', jwt);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('Validate token failed', e);
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
    CREATE_USER_PROFILE: (context, payload) => axios.post(`${API_ENDPOINT}/users`, {
      email: payload.email,
      password: payload.password,
      nickname: payload.nickname,
      termsAndConditions: payload.termsAndConditions,
      dataProcessing: payload.dataProcessing,
      emails: payload.marketing,
    }),
    UPDATE_USER_PROFILE: (context, payload) => axios.patch(`${API_ENDPOINT}/users/${payload.userId}`, {
      drivingSince: payload.drivingSince,
      vehicles: payload.vehicle,
      sex: payload.sex,
      born: payload.bornInYear,
      region: payload.region,
      education: payload.education,
      publicProfile: payload.publicProfile,
    }, getAuthHeader(context, payload.jwt)),
    VERIFY_USER: (context, payload) => axios.post(`${API_ENDPOINT}/verify/${payload.token}`),
    // eslint-disable-next-line arrow-body-style
    GET_USER_PROFILE_BY_ID: async (context, payload) => {
      if (context.state.userId === payload.id) {
        return axios.get(`${API_ENDPOINT}/users/${payload.id}`, getAuthHeader(context));
      }
      return axios.get(`${API_ENDPOINT}/users/${payload.id}`);
    },
    GET_POLL: async (context, payload) => {
      console.log(`GET_POLL ${payload.slug}`);
      if (context.state.poll != null && payload.slug === context.state.poll.info.slug) {
        return; // cached value recycled
      }
      context.commit('SET_POLL', null);
      const pollData = await axios.get(`${BFF_ENDPOINT}/polls/${payload.slug}`, getAuthHeader(context));
      const item = pollData.data.data;
      context.commit('SET_POLL', item);
      await context.dispatch('GET_POLL_COMMENTS', { id: item._id, page: VUE_APP_DEFAULT_POLL_COMMENT_PAGE, limit: VUE_APP_DEFAULT_POLL_COMMENT_LIMIT });
    },
    POLL_VOTE: async (context, payload) => {
      console.log('POLL_VOTE');
      const pollData = await axios.post(`${BFF_ENDPOINT}/polls/${payload.id}/votes`, { vote: payload.vote }, getAuthHeader(context));
      const item = pollData.data.data;
      context.commit('SET_POLL', item);
      if (context.state.latestPoll && context.state.latestPoll._id === item._id) {
        context.commit('SET_LATEST_POLL', item);
      }
    },
    GET_POLL_VOTES: async (context, payload) => {
      console.log(`GET_POLL_VOTES ${payload.id} ${payload.query}`);
      return axios.get(`${BFF_ENDPOINT}/polls/${payload.id}/votes?${payload.query}`);
    },
    INIT_STREAM: async (context) => {
      console.log('INIT_STREAM');
      const pollRequest = axios.get(`${BFF_ENDPOINT}/polls/last`, getAuthHeader(context));
      const streamRequest = axios.get(`${API_ENDPOINT}/polls/?obd=date`, getAuthHeader(context));
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
    GET_COMMENTS: async (context, payload) => {
      if (payload.reset) {
        context.commit('SET_POLL_COMMENTS', null);
      }
      let url = `${BFF_ENDPOINT}/polls/${payload.itemId}/comments`;
      if (payload.lastSeen) {
        url += `?lr=id:${payload.lastSeen}`;
      }
      const response = await axios.get(url);
      console.log(response.data); // todo remove
      if (context.getters.COMMENTS !== null && context.getters.POLL_COMMENTS.comments !== undefined) {
        response.data.data.comments = context.getters.COMMENTS.comments.concat(response.data.data.comments);
      }
      context.commit('SET_POLL_COMMENTS', response.data.data);
    },
    GET_REPLIES: async (context, payload) => {
      let url = `${BFF_ENDPOINT}/polls/${payload.itemId}/comments/${payload.commentId}/replies`;
      if (payload.lastSeen) {
        url += `?lr=id:${payload.lastSeen}`;
      }
      const response = await axios.get(url);
      console.log(response.data); // todo remove
      if (response.data.success) {
        context.commit('SET_COMMENT_REPLIES', payload.commentId, response.data.data.replies);
      }
    },
    ADD_COMMENT: async (context, payload) => {
      console.log('test', context, payload);
      return axios.post(`${API_ENDPOINT}/items/${payload.id}/comments`,
        { text: payload.text, parentId: payload.parent }, getAuthHeader(context));
    },
    COMMENT_VOTE: async (context, payload) => {
      console.log('test', context, payload);
      return axios.post(`${API_ENDPOINT}/comments/${payload.commentId}/votes`,
        { itemId: payload.itemId, vote: payload.vote }, getAuthHeader(context));
    },
  },
});
