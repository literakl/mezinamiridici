import { get, post } from '@/utils/api';

const {
  REPLY_LIMIT,
} = process.env;

export default {
  state: () => ({
    dizcussion: {
      incomplete: true,
      comments: [
        {
          commentId: 'abcd',
          text: 'ahoj lidi',
          author: {},
          up: 1,
          down: 0,
          votes: [],
          showAllReplies: true,
          replies: [
            {
              commentId: 'cdef',
              parentId: 'abcd',
              text: 'ahoj lidi',
              author: {},
              up: 1,
              down: 0,
              votes: [],
            },
          ],
        },
      ],
    },
    discussion: null,
    // replies: null; https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143/51
    // users: null, https://github.com/paularmstrong/normalizr
  }),

  mutations: {
    SET_COMMENTS: (state, payload) => {
      const { comments, incomplete, append } = payload;
      comments.forEach((comment) => {
        comment.showAllReplies = (comment.replies) ? (comment.replies.length < REPLY_LIMIT) : false;
      });
      if (state.discussion === null) {
        state.discussion = { incomplete, comments: [] };
      } else if (incomplete !== null) {
        state.discussion.incomplete = incomplete;
      }
      const currentComments = state.discussion.comments;
      if (append) {
        state.discussion.comments = currentComments.concat(comments);
      } else {
        state.discussion.comments = comments.concat(currentComments);
      }
    },
    SET_COMMENT_REPLIES: (state, payload) => {
      const { commentId, replies, replace } = payload;
      const comment = state.discussion.comments.find(x => x._id === commentId);
      if (comment) {
        if (!comment.replies || comment.replies.length === 0 || replace) {
          console.log('setting replies');
          comment.replies = replies;
        } else {
          console.log('appending replies');
          comment.replies = comment.replies.concat(replies);
        }
        comment.size = comment.replies.length;
        comment.showAll = true;
      } else {
        console.log(`Comment ${commentId} not found`);
      }
    },
  },

  getters: {
    DISCUSSION: state => state.discussion,
    GET_REPLIES: state => id => state.discussion.comments.find(thread => thread.commentId === id),
  },

  actions: {
    // pokryt stavy: nacteni nove diskuse, dalsi stranka, nacist nove komentare
    FETCH_COMMENTS: async (context, payload) => {
      console.log(`FETCH_COMMENTS ${payload}`);
      if (payload.reset) {
        // asi v created
        context.commit('SET_COMMENTS', null);
      }
      let url = `/items/${payload.itemId}/comments`;
      if (payload.lastSeen) {
        url += `?lr=id:${payload.lastSeen}`;
      }
      const response = await get('BFF', url, context);
      console.log(response.data); // todo remove
      const body = { comments: response.data.data.comments, incomplete: response.data.data.incomplete, append: true };
      context.commit('SET_COMMENTS', body);
    },
    FETCH_REPLIES: async (context, payload) => {
      console.log(`FETCH_REPLIES ${payload}`);
      let url = `/items/${payload.itemId}/comments/${payload.commentId}/replies`;
      if (payload.lastSeen) {
        url += `?lr=id:${payload.lastSeen}`;
      }
      const response = await get('BFF', url, context);
      console.log(response.data); // todo remove
      if (response.data.success) {
        const body = { commentId: payload.commentId, replies: response.data.data.replies };
        context.commit('SET_COMMENT_REPLIES', body);
      }
    },
    ADD_COMMENT: async (context, payload) => {
      console.log('ADD_COMMENT', payload);
      const response = await post('API', `/items/${payload.itemId}/comments`,
        { text: payload.text, parentId: payload.parent }, context);
      console.log(response.data); // todo remove
      if (response.data.success) {
        let body = {
          comments: [response.data.data.comment],
          incomplete: null,
          append: false,
        };
        context.commit('SET_COMMENTS', body);
        if (payload.parent) {
          body = {
            commentId: payload.parent,
            replies: response.data.data.replies,
            replace: true,
          };
          context.commit('SET_COMMENT_REPLIES', body);
        }
      }
    },
    COMMENT_VOTE: async (context, payload) => {
      console.log('COMMENT_VOTE', payload);
      return post('API', `/comments/${payload.commentId}/votes`,
        { itemId: payload.itemId, vote: payload.vote }, context);
    },
  },
};
