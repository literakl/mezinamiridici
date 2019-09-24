import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

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
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('./views/SignIn.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('./views/SignUp.vue'),
    },
    {
      path: '/poll/:id',
      name: 'poll',
      component: () => import('./views/Poll.vue'),
      props: true,
    },
    {
      path: '/polls',
      name: 'polls',
      component: () => import('./views/Polls.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('./views/Profile.vue'),
    },
    {
      path: '/analyze-votes/:id',
      name: 'analyze-votes',
      component: () => import('./views/AnalyzeVotes.vue'),
    },
    {
      path: '/complete-profile',
      name: 'complete-profile',
      component: () => import('./views/CompleteProfile.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { x: 0, y: 0 };
  },
});
