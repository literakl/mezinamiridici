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
      path: '/prihlaseni',
      name: 'sign-in',
      component: () => import('./views/SignIn.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/registrace',
      name: 'sign-up',
      component: () => import('./views/SignUp.vue'),
      beforeEnter: requireUnauth,
    },
    {
      path: '/zapomenute-heslo',
      name: 'forgotten',
      component: () => import('./views/ForgottenPassword'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/nastaveni-hesla/:resetPasswordToken',
      name: 'reset',
      component: () => import('./views/ResetPassword.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/zmena-hesla',
      name: 'update-password',
      component: () => import('./views/ChangePassword'),
      beforeEnter: requireAuth,
    },
    {
      path: '/profil/:id',
      name: 'user-profile',
      component: () => import('./views/Profile.vue'),
      props: true,
    },
    {
      path: '/anketa/:slug',
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
      path: '/uprava-profilu',
      name: 'update-profile',
      component: () => import('./views/UpdateProfile.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/overeni-uzivatele/:token',
      name: 'verify',
      component: () => import('./views/Verify.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/napoveda',
      name: 'help',
      component: () => import('./views/Help.vue'),
    },
    {
      path: '/mise',
      name: 'mission',
      component: () => import('./views/Mission.vue'),
    },
    {
      path: '/kontakt',
      name: 'contact',
      component: () => import('./views/Contact.vue'),
    },
    {
      path: '/reklama',
      name: 'advertisement',
      component: () => import('./views/Advertisement.vue'),
    },
    {
      path: '/archiv',
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
