import Vue from 'vue';
import jwtDecode from 'jwt-decode';
import { get, patch, post } from '@/utils/api';


export default {

  state: () => ({
    authorized: false,
    userToken: null,
    userId: null,
    userNickname: null,
    userRole: null,
    userEmail: null,
  }),
  getters: {
    IS_AUTHORIZED: state => state.authorized,
    USER_TOKEN: state => state.userToken,
    USER_ID: state => state.userId,
    USER_NICKNAME: state => state.userNickname,
    USER_ROLE: state => state.userRole,
    USER_EMAIL: state => state.userEmail,
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
    SET_USER_EMAIL: (state, payload) => {
      state.userEmail = payload;
    },
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
      const result = await post('API', '/forgotPassword', body);
      return result;
    },
    RESET_PASSWORD: (context, payload) => {
      const body = {
        resetPasswordToken: payload.resetPasswordToken,
        password: payload.password,
      };
      return post('API', '/resetPassword', body);
    },
    SET_SOCIAL: async (context, payload) => {
      const jwt = payload.access_token;
      const jwtData = jwtDecode(jwt);
      localStorage.setItem('jwt', jwt);

      context.commit('SET_USER_TOKEN', jwt);
      context.commit('SET_AUTHORIZED', true);
      context.commit('SET_USER_ID', jwtData.userId);
      context.commit('SET_USER_NICKNAME', jwtData.nickname);
      context.commit('SET_USER_EMAIL', payload.email);
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
    CREATE_USER_PROFILE: async (context, payload) => {
      const body = {
        email: payload.email,
        password: payload.password,
        nickname: payload.nickname,
        termsAndConditions: payload.termsAndConditions,
        dataProcessing: payload.dataProcessing,
        emails: payload.marketing,
      };
      const result = await post('API', '/users', body);
      return result;
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
    VERIFY_USER: (context, payload) => post('API', `/verify/${payload.token}`),
    GET_USER_PROFILE_BY_ID: async (context, payload) => get('API', `/users/${payload.id}`, context),

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


};
