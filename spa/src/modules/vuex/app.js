export default {
  state: () => ({
    showCookiesDialog: false,
  }),
  getters: {
    SHOW_COOKIES_DIALOG: state => state.showCookiesDialog,
  },
  mutations: {
    SHOW_COOKIES_DIALOG: (state, payload) => {
      state.showCookiesDialog = payload;
    },
  },
};
