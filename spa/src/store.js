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
    pollVotes: null,
    pollComments: null,
    userToken: null,
    userId: null,
    userNickname: null,
    signedIn: false,
    signedInUserProfile: null,
    userProfile: null
  },
  getters: {
    POLLS: state => state.polls,
    POLL: state => state.poll,
    POLL_VOTES: state => state.pollVotes,
    POLL_COMMENTS: state => state.pollComments,
    USER_TOKEN: state => state.userToken,
    USER_ID: state => state.userId,
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
    SET_POLL_VOTES: (state, payload) => {
      state.pollVotes = payload;
    },
    SET_POLL_COMMENTS: (state, payload) => {
      state.pollComments = payload;
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
      const pollData = await axios.get(`${API_ENDPOINT}/polls`);
      const polls = [];
    
      pollData.data.forEach(async poll => {
        const userData = await axios.get(`${API_ENDPOINT}/users/${poll.userId}`);
        const pollVotesData = await axios.get(`${API_ENDPOINT}/polls/${poll.pollId}/votes`);
        const pollCommentsData = await axios.get(`${API_ENDPOINT}/polls/${poll.pollId}/comments`);

        poll['votes'] = pollVotesData.data.length
        poll['comments'] = pollCommentsData.data.length
        poll['userData'] = userData.data;
        polls.push(poll);
      });

      context.commit('SET_POLLS', polls);
    },
    GET_POLL: async (context, payload) => {
      context.commit('SET_POLL', null);
      const pollData = await axios.get(`${API_ENDPOINT}/polls/${payload.id}`);
      const userData = await axios.get(`${API_ENDPOINT}/users/${pollData.data.userId}`);
      pollData.data['userData'] = userData.data;
      context.commit('SET_POLL', pollData.data);
    },
    GET_POLL_VOTES: async (context, payload) => {
      context.commit('SET_POLL_VOTES', null);
      const pollData = await axios.get(`${API_ENDPOINT}/polls/${payload.id}/votes`);
      context.commit('SET_POLL_VOTES', pollData.data);
    },
    GET_POLL_COMMENTS: async (context, payload) => {
      context.commit('SET_POLL_COMMENTS', null);
      const pollData = await axios.get(`${API_ENDPOINT}/polls/${payload.id}/comments`);
      context.commit('SET_POLL_COMMENTS', pollData.data);
    },
    FORGOT_PASSWORD: async (context, payload) => {
      try {
        const request = await axios.post(`${API_ENDPOINT}/forgotPassword`, JSON.stringify({
          email: payload.email
        }));

        return request;
      } catch (err) {
        throw err;
      }
    },
    RESET_PASSWORD: async (context, payload) => {
      try {
        const request = await axios.post(`${API_ENDPOINT}/resetPassword`, JSON.stringify({
          passwordResetToken: payload.passwordResetToken,
          password: payload.password
        }));

        return request;
      } catch (err) {
        throw err;
      }
    },
    SIGN_USER_IN: async (context, payload) => {
      context.commit('SET_USER_TOKEN', null);

      try {
        const request = await axios.post(`${API_ENDPOINT}/authorizeUser`, JSON.stringify({
          email: payload.email,
          password: payload.password,
        }));

        const jwtData = jwtDecode(request.data.token);
        
        context.commit('SET_SIGNED_IN', true);
        context.commit('SET_USER_TOKEN', request.data);
        context.commit('SET_USER_ID', jwtData.userId);
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
    GET_USER_ID: async (context, payload) => {
      const jwt = localStorage.getItem('jwt');
      
      if(!jwt) return;

      const jwtData = jwtDecode(jwt);
      context.commit('SET_USER_ID', jwtData.userId);
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
        marketing: payload.marketing,
      }));
    },
    UPDATE_USER_PROFILE: async (context, payload) => {
      await axios.patch(
        `${API_ENDPOINT}/users/${payload.userId}`,
        JSON.stringify({
          nickname: payload.nickname,
          drivingSince: payload.drivingSince,
          vehicle: payload.vehicle,
          sex: payload.sex,
          born: payload.bornInYear,
          locationalRegion: payload.locationalRegion,
          education: payload.education,
          shareProfile: payload.shareProfile,
        }),
        {
          headers: {
            Authorization: `bearer ${payload.jwt.token}`,
          },
        },
      );
    },
    GET_USERS_VOTES: async (context, payload) => {
      const { data } = await axios.get(`${API_ENDPOINT}/users/${payload.userId}/votes`);
      return data.find(vote => vote.pollId === payload.pollId);
    },
    GET_USER_PROFILE_BY_ID: async (context, payload) => {
      const { data } = await axios.get(`${API_ENDPOINT}/users/${payload.id}`);
      context.commit('SET_USER_PROFILE', data);
    },
    VERIFY_USER: async (context, payload) => await axios.get(`${API_ENDPOINT}/verify/${payload.token}`),
    VOTE: async (context, payload) => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return;

      const voteToScore = {
        'No problem': 1,
        'Trivial trouble': 0,
        'I don\'t like it': -1,
        'I hate it': -2,
      };

      return await axios.post(
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
