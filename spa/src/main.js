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

import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import i18n from './i18n';

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

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
