import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

Vue.use(Vuex);

const API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT;

export default new Vuex.Store({
  state: {
    polls: null,
    poll: null,
    latestPollId: null,
    pollVotes: null,
    pollComments: null,
    authorized: false,
    userToken: null,
    userId: null,
    userNickname: null,
  },
  getters: {
    POLLS: state => state.polls,
    POLL: state => state.poll,
    LATEST_POLL: state => state.latestPollId,
    POLL_VOTES: state => state.pollVotes,
    POLL_COMMENTS: state => state.pollComments,
    IS_AUTHORIZED: state => state.authorized,
    USER_TOKEN: state => state.userToken,
    USER_ID: state => state.userId,
    USER_NICKNAME: state => state.userNickname,
  },
  mutations: {
    SET_POLLS: (state, payload) => {
      state.polls = payload;
    },
    SET_POLL: (state, payload) => {
      state.poll = payload;
    },
    SET_LATEST_POLL: (state, payload) => {
      state.latestPollId = payload;
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
    SET_AUTHORIZED: (state, payload) => {
      state.authorized = payload;
    },
  },
  actions: {
    GET_POLLS: async (context, payload) => {
      console.log('[GET_POLLS]');
      console.log('payload');
      console.log(payload);
      let pollData;
      if (payload !== undefined && payload.userId !== undefined) {
        const { userId } = payload;
        console.log('[fetching user specific poll]');
        pollData = await axios.get(`${API_ENDPOINT}/polls?userId=${userId}`);
      } else {
        console.log('[fetching all poll]');
        pollData = await axios.get(`${API_ENDPOINT}/polls`);
      }
      const polls = [];

      // console.log(JSON.stringify(pollData.data));
      const uniqueUserId = [];
      let latestPollTime = -1;
      let latestPollId = null;
      const userData = {};
      pollData.data.forEach(async (poll) => {
        console.log('[pollId]', poll.pollId, '[userId]', poll.userId);
        if (poll.created > latestPollTime) {
          latestPollTime = poll.created;
          latestPollId = poll.pollId;
        }
        if (uniqueUserId.indexOf(poll.userId) < 0) {
          uniqueUserId.push(poll.userId);
          const user = await axios.get(`${API_ENDPOINT}/users/${poll.userId}`);
          // console.log(JSON.stringify(user.data));
          userData[poll.userId] = user.data;
        }
        const pollVotesData = await axios.get(`${API_ENDPOINT}/polls/${poll.pollId}/votes`);
        const pollCommentsData = await axios.get(`${API_ENDPOINT}/polls/${poll.pollId}/comments`);

        // eslint-disable-next-line no-param-reassign
        poll.votes = pollVotesData.data.length;
        // eslint-disable-next-line no-param-reassign
        poll.comments = pollCommentsData.data.length;
        // eslint-disable-next-line no-param-reassign
        poll.userData = userData[poll.userId];
        polls.push(poll);
      });
      console.log('[latestPollId] ', latestPollId);
      context.commit('SET_LATEST_POLL', latestPollId);
      // console.log(this.$store.getters.LATEST_POLL);
      context.commit('SET_POLLS', polls);
    },
    GET_POLL: async (context, payload) => {
      context.commit('SET_POLL', null);
      const pollData = await axios.get(`${API_ENDPOINT}/polls/${payload.id}`);
      const userData = await axios.get(`${API_ENDPOINT}/users/${pollData.data.userId}`);
      pollData.data.userData = userData.data;
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
      const comments = [];

      pollData.data.forEach(async (comment) => {
        const userData = await axios.get(`${API_ENDPOINT}/users/${comment.userId}`);
        // eslint-disable-next-line no-param-reassign
        comment.nickname = userData.data.nickname;
        comments.push(comment);
      });

      context.commit('SET_POLL_COMMENTS', comments);
    },
    FORGOT_PASSWORD: async (context, payload) => {
      try {
        const request = await axios.post(`${API_ENDPOINT}/forgotPassword`, JSON.stringify({
          email: payload.email,
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
          password: payload.password,
        }));

        return request;
      } catch (err) {
        throw err;
      }
    },
    SIGN_USER_IN: async (context, payload) => {
      try {
        console.log('SIGN_USER_IN');
        const axiosResponse = await axios.post(`${API_ENDPOINT}/authorizeUser`, JSON.stringify({
          email: payload.email,
          password: payload.password,
        }));

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
      console.log('LOAD_USER');
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        const jwtData = jwtDecode(jwt);
        context.commit('SET_USER_ID', jwtData.userId);
        context.commit('SET_USER_NICKNAME', jwtData.nickname);
        context.commit('SET_AUTHORIZED', true);
        context.commit('SET_USER_TOKEN', jwt);
        // todo check JWT token
      } else {
        context.commit('SET_USER_TOKEN', null);
        context.commit('SET_AUTHORIZED', false);
        context.commit('SET_USER_ID', null);
      }
    },
    CREATE_USER_PROFILE: async (context, payload) => axios.post(`${API_ENDPOINT}/users`, JSON.stringify({
      email: payload.email,
      password: payload.password,
      nickname: payload.nickname,
      termsAndConditions: payload.termsAndConditions,
      dataProcessing: payload.dataProcessing,
      marketing: payload.marketing,
    })),
    UPDATE_USER_PROFILE: async (context, payload) => {
      await axios.patch(
        `${API_ENDPOINT}/users/${payload.userId}`,
        JSON.stringify({
          drivingSince: payload.drivingSince,
          vehicles: payload.vehicle,
          sex: payload.sex,
          born: payload.bornInYear,
          region: payload.region,
          education: payload.education,
          publicProfile: payload.publicProfile,
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
    // eslint-disable-next-line arrow-body-style
    GET_USER_PROFILE_BY_ID: async (context, payload) => {
      // const jwt = localStorage.getItem('jwt');
      return axios.get(`${API_ENDPOINT}/users/${payload.id}`);
    },
    VERIFY_USER: async (context, payload) => {
      await axios.get(`${API_ENDPOINT}/verify/${payload.token}`);
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
    COMMENT: async (context, payload) => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return;

      // eslint-disable-next-line consistent-return
      return axios.post(
        `${API_ENDPOINT}/polls/${payload.id}/comments`,
        {
          text: payload.text,
          parent: payload.parent,
        },
        {
          headers: {
            Authorization: `bearer ${jwt}`,
          },
        },
      );
    },
    COMMENT_VOTE: async (context, payload) => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return;

      // eslint-disable-next-line consistent-return
      return axios.post(
        `${API_ENDPOINT}/polls/${payload.pollId}/comment/${payload.commentId}/vote`,
        {
          vote: payload.vote,
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
