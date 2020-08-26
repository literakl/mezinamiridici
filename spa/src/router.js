import Vue from 'vue';
import Router from 'vue-router';
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
      path: '/registrace',
      name: 'sign-up',
      component: () => import('./views/user/SignUp.vue'),
      beforeEnter: requireUnauth,
    },
    {
      path: '/prihlaseni',
      name: 'sign-in',
      component: () => import('./views/user/SignIn.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/aktivace-uzivatele',
      name: 'activate',
      component: () => import('./views/user/Confirm.vue'),
    },
    {
      path: '/overeni-uzivatele/:token',
      name: 'verify',
      component: () => import('./views/user/Verify.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/zapomenute-heslo',
      name: 'forgotten',
      component: () => import('./views/user/ForgottenPassword'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/nastaveni-hesla/:resetPasswordToken',
      name: 'reset',
      component: () => import('./views/user/ResetPassword.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/zmena-hesla',
      name: 'update-password',
      component: () => import('./views/user/ChangePassword'),
      beforeEnter: requireAuth,
    },
    {
      path: '/profil/:id',
      name: 'user-profile',
      component: () => import('./views/user/Profile.vue'),
      props: true,
    },
    {
      path: '/uprava-profilu',
      name: 'update-profile',
      component: () => import('./views/user/UpdateProfile.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/ankety/',
      name: 'polls',
      component: () => import('./views/poll/Polls.vue'),
    },
    {
      path: '/ankety/:slug',
      name: 'poll',
      component: () => import('./views/poll/Poll.vue'),
      props: true,
    },
    {
      path: '/ankety/:slug/grafy/:type',
      name: 'analyse-poll',
      component: () => import('./views/poll/AnalyzeVotes'),
      props: true,
    },
    {
      path: '/uprava-ankety/:slug',
      name: 'edit-poll',
      component: () => import('./views/poll/EditPoll.vue'),
      props: true,
    },
    {
      path: '/nova-anketa/',
      name: 'create-poll',
      component: () => import('./views/poll/CreatePoll'),
      props: true,
    },
    {
      path: '/napoveda',
      name: 'help',
      component: () => import('./views/site/Help.vue'),
    },
    {
      path: '/mise',
      name: 'mission',
      component: () => import('./views/site/Mission.vue'),
    },
    {
      path: '/kontakt',
      name: 'contact',
      component: () => import('./views/site/Contact.vue'),
    },
    {
      path: '/reklama',
      name: 'advertisement',
      component: () => import('./views/site/Advertisement.vue'),
    },
    {
      path: '/stitky',
      name: 'tags',
      component: () => import('./views/item/Tag.vue'),
    },
    {
      path: '/stitky/:tag',
      name: 'tag',
      component: () => import('./views/item/Tag.vue'),
      props: true,
    },
    {
      path: '/prispevky/novy',
      name: 'create-blog',
      component: () => import('./views/item/WriteBlog.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/prispevky/:slug/uprava',
      name: 'update-blog',
      component: () => import('./views/item/WriteBlog.vue'),
      beforeEnter: requireAuth,
      props: true,
    },
    {
      path: '/prispevky/:slug',
      name: 'blog',
      component: () => import('./views/item/Blog.vue'),
      props: true,
    },
    {
      path: '*',
      name: 'not-found',
      component: () => import('./views/site/404.vue'),
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
