import Vue from 'vue';
import Chartkick from 'vue-chartkick';
import Chart from 'chart.js';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import i18n from './i18n';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
Vue.use(Chartkick.use(Chart));
