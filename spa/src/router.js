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
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/SignUp.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/prihlaseni',
      name: 'sign-in',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/SignIn.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/aktivace-uzivatele',
      name: 'activate',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/Confirm.vue'),
    },
    {
      path: '/overeni-uzivatele/:token',
      name: 'verify',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/Verify.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/zapomenute-heslo',
      name: 'forgotten',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/ForgottenPassword'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/nastaveni-hesla/:resetPasswordToken',
      name: 'reset',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/ResetPassword.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/zmena-hesla',
      name: 'update-password',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/ChangePassword'),
      beforeEnter: requireAuth,
    },
    {
      path: '/profil/:id',
      name: 'user-profile',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/Profile.vue'),
      props: true,
    },
    {
      path: '/uprava-profilu',
      name: 'update-profile',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/UpdateProfile.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/ankety/',
      name: 'polls',
      component: () => import(/* webpackChunkName: "poll-chunk" */ './views/poll/Polls.vue'),
    },
    {
      path: '/ankety/:slug',
      name: 'poll',
      component: () => import(/* webpackChunkName: "poll-chunk" */ './views/poll/Poll.vue'),
      props: true,
    },
    {
      path: '/ankety/:slug/grafy/:type',
      name: 'analyse-poll',
      component: () => import(/* webpackChunkName: "poll-chunk" */ './views/poll/AnalyzeVotes'),
      props: true,
    },
    {
      path: '/uprava-ankety/:slug',
      name: 'edit-poll',
      component: () => import(/* webpackChunkName: "poll-chunk" */ './views/poll/EditPoll.vue'),
      props: true,
    },
    {
      path: '/nova-anketa/',
      name: 'create-poll',
      component: () => import(/* webpackChunkName: "poll-chunk" */ './views/poll/CreatePoll.vue'),
      props: true,
    },
    {
      path: '/cms/',
      name: 'cms',
      component: () => import(/* webpackChunkName: "cms-chunk" */ './views/item/CMS.vue'),
    },
    {
      path: '/c/:slug',
      name: 'content',
      component: () => import(/* webpackChunkName: "cms-chunk" */ './views/item/Content.vue'),
      props: true,
    },
    {
      path: '/novy-obsah/',
      name: 'create-content',
      component: () => import(/* webpackChunkName: "cms-chunk" */ './views/item/CreateContent.vue'),
      props: true,
    },
    {
      path: '/uprava-obsahu/:slug',
      name: 'edit-content',
      component: () => import(/* webpackChunkName: "cms-chunk" */ './views/item/EditContent.vue'),
      props: true,
    },
    {
      path: '/stitky',
      name: 'tags',
      component: () => import(/* webpackChunkName: "cms-chunk" */ './views/item/Tag.vue'),
    },
    {
      path: '/stitky/:tag',
      name: 'tag',
      component: () => import(/* webpackChunkName: "site-chunk" */ './views/item/Tag.vue'),
      props: true,
    },
    {
      path: '/prispevky/novy',
      name: 'create-blog',
      component: () => import(/* webpackChunkName: "blog-chunk" */ './views/item/WriteBlog.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/prispevky/:slug/uprava',
      name: 'update-blog',
      component: () => import(/* webpackChunkName: "blog-chunk" */ './views/item/WriteBlog.vue'),
      beforeEnter: requireAuth,
      props: true,
    },
    {
      path: '/prispevky/:slug',
      name: 'blog',
      component: () => import(/* webpackChunkName: "blog-chunk" */ './views/item/Blog.vue'),
      props: true,
    },
    {
      path: '*',
      name: 'not-found',
      component: () => import(/* webpackChunkName: "site-chunk" */ './views/site/404.vue'),
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
