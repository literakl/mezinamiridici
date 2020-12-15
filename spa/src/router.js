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
      path: '/p/overeni/:token',
      name: 'verify',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/Verify.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/p/zapomenute-heslo',
      name: 'forgotten',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/ForgottenPassword'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/p/nastaveni-hesla/:resetPasswordToken',
      name: 'reset',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/ResetPassword.vue'),
      beforeEnter: requireUnauth,
      props: true,
    },
    {
      path: '/p/:id',
      name: 'user-profile',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/Profile.vue'),
      props: true,
    },
    {
      path: '/p/:id/uprava',
      name: 'update-profile',
      component: () => import(/* webpackChunkName: "user-chunk" */ './views/user/UpdateProfile.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/p/:id/b/novy',
      name: 'create-blog',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/item/WriteBlog.vue'),
      beforeEnter: requireAuth,
      props: true,
    },
    {
      path: '/p/:id/b/:slug',
      name: 'blog',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/item/Blog.vue'),
      props: true,
    },
    {
      path: '/p/:id/b/:slug/uprava',
      name: 'update-blog',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/item/WriteBlog.vue'),
      beforeEnter: requireAuth,
      props: true,
    },
    {
      path: '/ankety/',
      name: 'polls',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/poll/Polls.vue'),
    },
    {
      path: '/ankety/nova',
      name: 'create-poll',
      component: () => import(/* webpackChunkName: "admin-chunk" */ './views/poll/CreatePoll.vue'),
      props: true,
    },
    {
      path: '/ankety/:slug',
      name: 'poll',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/poll/Poll.vue'),
      props: true,
    },
    {
      path: '/ankety/:slug/uprava',
      name: 'edit-poll',
      component: () => import(/* webpackChunkName: "admin-chunk" */ './views/poll/EditPoll.vue'),
      props: true,
    },
    {
      path: '/ankety/:slug/grafy/:type',
      name: 'analyse-poll',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/poll/AnalyzeVotes'),
      props: true,
    },
    {
      path: '/o/',
      name: 'cms',
      component: () => import(/* webpackChunkName: "admin-chunk" */ './views/item/Pages'),
    },
    {
      path: '/o/:slug',
      name: 'page',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/item/Page'),
      props: true,
    },
    {
      path: '/o/novy',
      name: 'create-content',
      component: () => import(/* webpackChunkName: "admin-chunk" */ './views/item/CreatePage'),
      props: true,
    },
    {
      path: '/o/:slug/uprava',
      name: 'edit-content',
      component: () => import(/* webpackChunkName: "admin-chunk" */ './views/item/EditPage'),
      props: true,
    },
    {
      path: '/stitky',
      name: 'tags',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/item/Tag.vue'),
    },
    {
      path: '/stitky/:tag',
      name: 'tag',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/item/Tag.vue'),
      props: true,
    },
    {
      path: '/vrakoviste',
      name: 'junkyard',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/site/404.vue'),
    },
    {
      path: '*',
      name: 'not-found',
      component: () => import(/* webpackChunkName: "content-chunk" */ './views/site/404.vue'),
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
