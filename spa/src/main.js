import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
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

import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import i18n from './i18n';
import CREDENTIAL from './credential.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(Chartkick.use(Chart));
Vue.use(VueScrollTo);
Vue.use(VueAxios, axios);
Vue.use(VueAuthenticate, {
  tokenName: 'jwt',
  baseUrl: 'https://192.168.68.106/api',
  storageType: 'localStorage',
  providers: {
    facebook: {
      clientId: CREDENTIAL.FACEBOOK.CLIENT_ID,
      redirectUri: CREDENTIAL.FACEBOOK.REDIRECT_URI,
    },
    twitter: {
      clientId: CREDENTIAL.TWITTER.CLIENT_ID,
      redirectUri: CREDENTIAL.TWITTER.REDIRECT_URI,
    },
    google: {
      clientId: CREDENTIAL.GOOGLE.CLIENT_ID,
      redirectUri: CREDENTIAL.GOOGLE.REDIRECT_URI,
    },
  },
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
