import Vue from 'vue';
import Vuex from 'vuex';
import jwtDecode from 'jwt-decode';

const axios = require('axios').default;

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';

Vue.use(Vuex);

const API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT;
const BFF_ENDPOINT = process.env.VUE_APP_BFF_ENDPOINT;

function getAuthHeader(context, jwt = undefined) {
  const config = { headers: { } };
  if (jwt) {
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
  },
  getters: {
    IS_AUTHORIZED: state => state.authorized,
    USER_TOKEN: state => state.userToken,
    USER_ID: state => state.userId,
    USER_NICKNAME: state => state.userNickname,
    POLL: state => state.poll,
    LATEST_POLL: state => state.latestPoll,
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
    SIGN_USER_IN: async (context, payload) => {
      try {
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
      } catch (e) {
        context.commit('SET_USER_TOKEN', null);
        context.commit('SET_AUTHORIZED', false);
        context.commit('SET_USER_ID', null);
        context.commit('SET_USER_NICKNAME', null);
        throw e;
      }
    },
    SIGN_USER_OUT: (context) => {
      localStorage.removeItem('jwt');
      context.commit('SET_USER_TOKEN', null);
      context.commit('SET_AUTHORIZED', false);
      context.commit('SET_USER_ID', null);
      context.commit('SET_USER_NICKNAME', null);
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
      marketing: payload.marketing,
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
      console.log('GET_POLL');
      context.commit('SET_POLL', null);
      const pollData = await axios.get(`${BFF_ENDPOINT}/polls/${payload.slug}`, getAuthHeader(context));
      const item = pollData.data;
      item.poll.votes.total = item.poll.votes.neutral + item.poll.votes.trivial + item.poll.votes.dislike + item.poll.votes.hate;
      console.log(item);
      context.commit('SET_POLL', item);
    },
    GET_LATEST_POLL: async (context) => {
      console.log('GET_LATEST_POLL');
      context.commit('SET_LATEST_POLL', null);
      const pollData = await axios.get(`${BFF_ENDPOINT}/polls/last`, getAuthHeader(context));
      const item = pollData.data.data;
      console.log(item);
      context.commit('SET_LATEST_POLL', item);
    },
    VOTE: async (context, payload) => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return;

      const voteToScore = {
        'No problem': 1,
        'Trivial trouble': 0,
        'I don\'t like it': -1,
        'I hate it': -2,
      };

      // eslint-disable-next-line consistent-return
      return axios.post(
        `${API_ENDPOINT}/polls/${payload.id}/votes`,
        {
          score: voteToScore[payload.vote],
        },
        {
          headers: {
            Authorization: `bearer ${jwt}`,
          },
        },
      );
    },
  },
});
