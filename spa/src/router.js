import Vue from 'vue';
import Router from 'vue-router';
import i18n from './i18n';
import Home from './views/Home.vue';
import store from './store';

Vue.use(Router);

const requireUnauth = (to, from, next) => {
  store.dispatch('LOAD_USER');
  if (store.getters.IS_AUTHORIZED) {
    next({ name: 'home' });
    return;
  }

  next();
};

const requireAuth = (to, from, next) => {
  store.dispatch('LOAD_USER');
  if (store.getters.IS_AUTHORIZED) {
    next();
    return;
  }

  next({ name: 'sign-in' });
};

const _t = key => i18n.t(`page-title.${key}`);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/registrace',
      name: 'sign-up',
      component: () => import('./views/user/SignUp.vue'),
      beforeEnter: requireUnauth,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/prihlaseni',
      name: 'sign-in',
      component: () => import('./views/user/SignIn.vue'),
      beforeEnter: requireUnauth,
      props: true,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/aktivace-uzivatele',
      name: 'activate',
      component: () => import('./views/user/Confirm.vue'),
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/overeni-uzivatele/:token',
      name: 'verify',
      component: () => import('./views/user/Verify.vue'),
      beforeEnter: requireUnauth,
      props: true,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/zapomenute-heslo',
      name: 'forgotten',
      component: () => import('./views/user/ForgottenPassword'),
      beforeEnter: requireUnauth,
      props: true,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/nastaveni-hesla/:resetPasswordToken',
      name: 'reset',
      component: () => import('./views/user/ResetPassword.vue'),
      beforeEnter: requireUnauth,
      props: true,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/zmena-hesla',
      name: 'update-password',
      component: () => import('./views/user/ChangePassword'),
      beforeEnter: requireAuth,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/profil/:id',
      name: 'user-profile',
      component: () => import('./views/user/Profile.vue'),
      props: true,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/uprava-profilu',
      name: 'update-profile',
      component: () => import('./views/user/UpdateProfile.vue'),
      beforeEnter: requireAuth,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/ankety/',
      name: 'polls',
      component: () => import('./views/poll/Polls.vue'),
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/anketa/:slug',
      name: 'poll',
      component: () => import('./views/poll/Poll.vue'),
      props: true,
      meta: { title: route => `${_t(route.name)}\xa0\xa0-\xa0\xa0` },
    },
    {
      path: '/uprava-ankety/:slug',
      name: 'edit-poll',
      component: () => import('./views/poll/EditPoll.vue'),
      props: true,
      meta: { title: route => `${_t(route.name)}` },
    },
    {
      path: '/nova-anketa/',
      name: 'create-poll',
      component: () => import('./views/poll/CreatePoll'),
      props: true,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/anketa/:slug/grafy/:type',
      name: 'analyse-poll',
      component: () => import('./views/poll/AnalyzeVotes'),
      props: true,
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/analyze-votes/:id',
      name: 'analyze-votes',
      component: () => import('./views/poll/AnalyzeVotes.vue'),
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/napoveda',
      name: 'help',
      component: () => import('./views/site/Help.vue'),
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/mise',
      name: 'mission',
      component: () => import('./views/site/Mission.vue'),
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/kontakt',
      name: 'contact',
      component: () => import('./views/site/Contact.vue'),
      meta: { title: route => _t(route.name) },
    },
    {
      path: '/reklama',
      name: 'advertisement',
      component: () => import('./views/site/Advertisement.vue'),
      meta: { title: route => _t(route.name) },
    },
    {
      path: '*',
      name: 'not-found',
      component: () => import('./views/site/404.vue'),
      meta: { title: route => _t(route.name) },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return {
        selector: to.hash,
      };
    }
    return { x: 0, y: 0 };
  },
});
