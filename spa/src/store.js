import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

Vue.use(Vuex);

const API_ENDPOINT = 'https://api.betweenusdrivers.jacobclark.dev/v1';

export default new Vuex.Store({
  state: {
    polls: null,
    poll: null,
    userToken: null,
    userNickname: null,
    signedIn: false,
    signedInUserProfile: null,
    userProfile: null
  },
  getters: {
    POLLS: state => state.polls,
    POLL: state => state.poll,
    USER_TOKEN: state => state.userToken,
    USER_NICKNAME: state => state.userNickname,
    SIGNED_IN: state => state.signedIn,
    SIGNED_IN_USER_PROFILE: state => state.signedInUserProfile,
    USER_PROFILE: state => state.userProfile
  },
  mutations: {
    SET_POLLS: (state, payload) => {
      state.polls = payload;
    },
    SET_POLL: (state, payload) => {
      state.poll = payload;
    },
    SET_USER_TOKEN: (state, payload) => {
      state.userToken = payload;
    },
    SET_USER_NICKNAME: (state, payload) => {
      state.userNickname = payload;
    },
    SET_SIGNED_IN: (state, payload) => {
      state.signedIn = payload
    },
    SET_SIGNED_IN_USER_PROFILE: (state, payload) => {
      state.signedInUserProfile = payload;
    },
    SET_USER_PROFILE: (state, payload) => {
      state.userProfile = payload;
    }
  },
  actions: {
    GET_POLLS: async (context, payload) => {
      const { data } = await axios.get(`${API_ENDPOINT}/polls`);
      context.commit('SET_POLLS', data);
    },
    GET_POLL: async (context, payload) => {
      context.commit('SET_POLL', null);
      const pollData = await axios.get(`${API_ENDPOINT}/polls/${payload.id}`);
      const userData = await axios.get(`${API_ENDPOINT}/users/${pollData.data.userId}`);
      pollData.data['userData'] = userData.data;
      context.commit('SET_POLL', pollData.data);
    },
    GET_USER_TOKEN: async (context, payload) => {
      context.commit('SET_USER_TOKEN', null);

      try {
        const request = await axios.post(`${API_ENDPOINT}/authorizeUser`, JSON.stringify({
          email: payload.email,
          password: payload.password,
        }));

        context.commit('SET_SIGNED_IN', true);
        context.commit('SET_USER_TOKEN', request.data);
        return request;
      } catch (err) {
        context.commit('SET_SIGNED_IN', false);
        throw err;
      }
    },
    GET_USER_NICKNAME: async (context, payload) => {
      const jwt = localStorage.getItem('jwt');
      
      if(!jwt) return;

      const jwtData = jwtDecode(jwt);
      context.commit('SET_USER_NICKNAME', jwtData.nickname);
    },
    GET_SIGNED_IN: async (context, payload) => {
      const jwt = localStorage.getItem('jwt');
      
      if(jwt) {
        context.commit('SET_SIGNED_IN', true);
      } else {
        context.commit('SET_SIGNED_IN', false);
      }
    },
    GET_SIGNED_IN_USER_PROFILE: async (context, payload) => {

      const jwt = localStorage.getItem('jwt');
      if(!jwt) return 

      const jwtData = jwtDecode(jwt);

      const { data } = await axios.get(`${API_ENDPOINT}/users/${jwtData.userId}`);
      context.commit('SET_SIGNED_IN_USER_PROFILE', data);
    },
    CREATE_USER_PROFILE: async (context, payload) => {
      return await axios.post(`${API_ENDPOINT}/users`, JSON.stringify({
        email: payload.email,
        password: payload.password,
        tandcs: payload.tandcs, 
        dataProcessing : payload.dataProcessing, 
        marketing: payload.marketing 
      }));
    },
    UPDATE_USER_PROFILE: async (context, payload) => {
      const request = await axios.post(
        `${API_ENDPOINT}/users/${payload.userId}`, 
        JSON.stringify({
          nickname: payload.nickname,
          drivingSince: payload.drivingSince,
          vehicle: payload.vehicle,
          sex: payload.sex,
          born: payload.bornInYear,
          locationalRegion: payload.region,
          education: payload.education,
          shareProfile: payload.share
        }),
        {
          headers: {'Authorization': "bearer " + payload.jwt.token}
        }
      );
    },
    GET_USER_PROFILE_BY_ID: async (context, payload) => {
      const { data } = await axios.get(`${API_ENDPOINT}/users/${payload.id}`);
      context.commit('SET_USER_PROFILE', data);
    },
  }
});
