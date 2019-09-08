import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Poll from './views/Poll.vue';
import Polls from './views/Polls.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('./views/SignUp.vue'),
    },
    {
      path: '/poll/:id',
      name: 'poll',
      component: Poll,
      props: true
    },
    {
      path: '/polls',
      name: 'polls',
      component: Polls,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
});
