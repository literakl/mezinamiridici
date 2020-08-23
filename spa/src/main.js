import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
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
import Editor from 'vue-editor-js';
// import VueCompositionApi from '@vue/composition-api';

import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import i18n from './i18n';

// TODO is this neccessary? We import CSS in App.vue
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

// VUE_APP_LOG_LEVEL
log.setLevel(process.env.LOG_LEVEL || 'debug');
Vue.$log = log;
Vue.prototype.$log = Vue.$log;

Vue.config.productionTip = process.env.VUE_APP_LOG_PRODUCTION_TIP || false;
Vue.use(BootstrapVue);
Vue.use(Chartkick.use(Chart));
Vue.use(VueScrollTo);
Vue.use(VueAxios, axios);
Vue.use(Editor);
// Vue.use(VueCompositionApi);
Vue.use(VueAuthenticate, {
  tokenName: 'jwt',
  baseUrl: 'http://localhost:3000/api',
  storageType: 'localStorage',
  providers: {
    facebook: {
      clientId: process.env.VUE_APP_FACEBOOK_CLIENT_ID,
      redirectUri: process.env.VUE_APP_FACEBOOK_REDIRECT_URI,
    },
    twitter: {
      clientId: process.env.VUE_APP_TWITTER_CLIENT_ID,
      redirectUri: process.env.VUE_APP_TWITTER_REDIRECT_URI,
    },
    google: {
      clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
      redirectUri: process.env.VUE_APP_GOOGLE_REDIRECT_URI,
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
