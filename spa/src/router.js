import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import store from './store';

Vue.use(Router);

const requireUnauth = (to, from, next) => {
  if (store.getters.IS_AUTHORIZED) {
    next({ name: 'home' });
    return;
  }

  next();
};

const requireAuth = (to, from, next) => {
  if (store.getters.IS_AUTHORIZED) {
    next();
    return;
  }

  next({ name: 'sign-in' });
};

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
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('./views/SignUp.vue'),
      beforeEnter: requireUnauth,
    },
    {
      path: '/forgotten-password',
      name: 'forgotten',
      component: () => import('./views/ForgottenPassword'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/reset-password/:resetPasswordToken',
      name: 'reset',
      component: () => import('./views/ResetPassword.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/update-password',
      name: 'update-password',
      component: () => import('./views/ChangePassword'),
      beforeEnter: requireAuth,
    },
    {
      path: '/profile/:id',
      name: 'user-profile',
      component: () => import('./views/Profile.vue'),
      props: true,
    },
    {
      path: '/poll/:slug',
      name: 'poll',
      component: () => import('./views/Poll.vue'),
      props: true,
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
      beforeEnter: requireAuth,
    },
    {
      path: '/verify/:token',
      name: 'verify',
      component: () => import('./views/Verify.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('./views/Help.vue'),
    },
    {
      path: '/mission',
      name: 'mission',
      component: () => import('./views/Mission.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('./views/Contact.vue'),
    },
    {
      path: '/advertisement',
      name: 'advertisement',
      component: () => import('./views/Advertisement.vue'),
    },
    {
      path: '/archive',
      name: 'archive',
      component: () => import('./views/Archive.vue'),
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
