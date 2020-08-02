import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
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

// VUE_APP_LOG_LEVEL
log.setLevel(process.env.LOG_LEVEL || 'debug');
Vue.$log = log;
Vue.prototype.$log = Vue.$log;

Vue.config.productionTip = process.env.VUE_APP_LOG_PRODUCTION_TIP || false;
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(Chartkick.use(Chart));
Vue.use(VueScrollTo);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
