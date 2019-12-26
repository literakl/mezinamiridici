import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import store from './store.js';

Vue.use(Router);

const requireUnauth = (to, from, next) => {
  store.dispatch('GET_SIGNED_IN');
  if(store.getters.SIGNED_IN){
    next({ name: "home" });
    return;
  }

  next();
}

const requireAuth = (to, from, next) => {
  store.dispatch('GET_SIGNED_IN');
  if(store.getters.SIGNED_IN){
    next();
    return
  }

  next({ name: "sign-in" });
}

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
      beforeEnter: requireUnauth
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('./views/SignUp.vue'),
      beforeEnter: requireUnauth
    },
    {
      path: '/poll/:id/:text',
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
      beforeEnter: requireAuth
    },
    {
      path: '/profile/:id',
      name: 'user-profile',
      component: () => import('./views/ProfileVisitor.vue'),
      props: true
    },
    {
      path: '/analyze-votes/:id',
      name: 'analyze-votes',
      component: () => import('./views/AnalyzeVotes.vue'),
    },
    {
      path: '/update-profile',
      name: 'update-profile',
      component: () => import('./views/UpdateProfile.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/verify/:token',
      name: 'verify',
      component: () => import('./views/Verify.vue'),
      beforeEnter: requireUnauth,
      props: true
    },
    {
      path: '/reset/:passwordResetToken',
      name: 'reset',
      component: () => import('./views/Reset.vue'),
      beforeEnter: requireUnauth,
      props: true
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('./views/Help.vue')
    },
    {
      path: '/mission',
      name: 'mission',
      component: () => import('./views/Mission.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('./views/Contact.vue')
    },
    {
      path: '/advertisement',
      name: 'advertisement',
      component: () => import('./views/Advertisement.vue')
    },
    {
      path: '/archive',
      name: 'archive',
      component: () => import('./views/Archive.vue')
    },
    {
      path: '*',
      name: 'not-found',
      component: () => import('./views/404.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { x: 0, y: 0 };
  },
});
