import Vue from 'vue';
import {
  BootstrapVue, BIcon, BIconPersonFill, BIconInfo, BIconPencil,
} from 'bootstrap-vue';
import Chartkick from 'vue-chartkick';
import Chart from 'chart.js';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import i18n from './i18n';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.component('BIcon', BIcon);
Vue.component('BIconPersonFill', BIconPersonFill);
Vue.component('BIconInfo', BIconInfo);
Vue.component('BIconPencil', BIconPencil);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
Vue.use(Chartkick.use(Chart));
