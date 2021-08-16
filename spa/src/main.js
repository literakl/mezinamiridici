import Vue from 'vue';
import { ModalPlugin, VBTooltip } from 'bootstrap-vue';
import log from 'loglevel';
import Chartkick from 'vue-chartkick';
import Chart from 'chart.js';
import {
  ValidationObserver,
  ValidationProvider,
  extend,
} from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';
import VueScrollTo from 'vue-scrollto';
import VueAxios from 'vue-axios';
import axios from 'axios';
import VueAuthenticate from 'vue-authenticate';
// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import i18n from './i18n';

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);
Vue.directive('b-tooltip', VBTooltip);

// VUE_APP_LOG_LEVEL
log.setLevel(window.config.LOG_LEVEL || 'debug');
Vue.$log = log;
Vue.prototype.$log = Vue.$log;

Vue.config.productionTip = window.config.LOG_PRODUCTION_TIP || false;
Vue.use(ModalPlugin);
Vue.use(Chartkick.use(Chart));
Vue.use(VueScrollTo);
Vue.use(VueAxios, axios);
Vue.use(VueAuthenticate, {
  tokenName: 'jwt',
  baseUrl: window.config.API_ENDPOINT,
  storageType: 'localStorage',
  bindRequestInterceptor() {},
  bindResponseInterceptor() {},
  providers: {
    facebook: {
      clientId: window.config.FACEBOOK_CLIENT_ID,
      redirectUri: window.config.FACEBOOK_REDIRECT_URI,
    },
    twitter: {
      clientId: window.config.TWITTER_CLIENT_ID,
      redirectUri: window.config.TWITTER_REDIRECT_URI,
    },
    google: {
      clientId: window.config.GOOGLE_CLIENT_ID,
      redirectUri: window.config.GOOGLE_REDIRECT_URI,
    },
  },
});

router.afterEach((to) => {
  Vue.nextTick(() => {
    document.title = i18n.t(`page-title.${to.name}`).toString();
  });
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
