import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import i18n from './i18n'

Vue.config.productionTip = false;

Vue.mixin({
  data: function () {
    return {
      get apiEndpoint() {
        return 'https://4b3uw59rt9.execute-api.eu-west-1.amazonaws.com/production/v1';
      }
    }
  }
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');
