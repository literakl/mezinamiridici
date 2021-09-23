<template>
  <div v-if="blog" class="blog-posts pt-3 m-auto">
    <div class="post-details-wrap">
      <div>
        <div class="hero-details">
          <h1>{{ title }}</h1>
        </div>
        <div class="post-details">
          <div class="post-author">
            <BIconPersonCircle scale="1"></BIconPersonCircle>
            <ProfileLink :profile="blog.info.author"/>
          </div>
          <div class="post-time">
            <BIconCalendarRange scale="1"></BIconCalendarRange>
            <Date :date="blog.info.date" format="dynamicDate"/>
          </div>
          <div class="post-comments">
            <BIconChatTextFill scale="1"></BIconChatTextFill>
            <b-link v-on:click="toComments">
              {{ blog.comments.count }}
            </b-link>
          </div>
          <div v-if="isAuthor" class="post-edit">
            <BIconPencilSquare scale="1"></BIconPencilSquare>
            <router-link :to="{name: 'update-blog', params: { id: blog._id } }">
              {{ $t('generic.edit-button') }}
            </router-link>
          </div>
          <div class="post-editorial" v-if="isAdmin">
            <b-link v-if="!editorial" v-on:click="toggleEditorial">
              <BIconShieldPlus scale="1"></BIconShieldPlus>
              {{ $t('blog.editorial.mark') }}
            </b-link>
            <b-link v-if="editorial" v-on:click="toggleEditorial">
              <BIconShieldMinus scale="1"></BIconShieldMinus>
              {{ $t('blog.editorial.unmark') }}
            </b-link>
            <b-link v-if="!hidden" v-on:click="toggleEditorial">
              <BIconShieldPlus scale="1"></BIconShieldPlus>
              {{ $t('blog.hidden.mark') }}
            </b-link>
            <b-link v-if="hidden" v-on:click="toggleHidden">
              <BIconShieldMinus scale="1"></BIconShieldMinus>
              {{ $t('blog.hidden.unmark') }}
            </b-link>
          </div>
          <div v-if="isAuthor || isAdmin" class="post-delete">
            <b-link v-b-modal.confirm>
              <BIconXCircle scale="1"></BIconXCircle>
              {{ $t('generic.delete-button') }}
            </b-link>
          </div>
          <b-modal id="confirm" :title="$t('generic.confirm-title-title')" hide-footer>
            <p class="my-4">{{ $t('blog.confirm-delete') }}</p>
            <b-button class="mt-3 mr-2" @click="$bvModal.hide('confirm')">{{ this.$t('generic.cancel-button') }}</b-button>
            <b-button class="mt-3" variant="danger" @click="deleteBlog(); $bvModal.hide('confirm');">{{ this.$t('generic.ok-button') }}</b-button>
          </b-modal>
        </div>
        <div class="errors">
          <b-alert variant="danger" dismissible :show="error !== undefined">
            {{ error }}
          </b-alert>
        </div>

        <div class="post-content p3" v-html="blogHtml"></div>
        <div class="content-wrap">
          <ShareLink :item="blog"/>
          <Comments :itemId="blog._id"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BIconPersonCircle, BIconCalendarRange, BIconChatTextFill, BIconPencilSquare,
  BIconShieldPlus, BIconShieldMinus, BLink, BIconXCircle, BAlert, BButton } from 'bootstrap-vue';
import Comments from '@/components/organisms/Comments.vue';
import ShareLink from '@/components/molecules/ShareLink.vue';
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';

export default {
  name: 'blog',
  components: {
    BLink,
    BIconCalendarRange,
    BIconChatTextFill,
    BIconPencilSquare,
    BIconShieldPlus,
    BIconShieldMinus,
    BIconPersonCircle,
    BIconXCircle,
    Comments,
    Date,
    ProfileLink,
    ShareLink,
    BAlert,
    BButton,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      blogHtml: '',
      error: undefined,
    };
  },
  watch: {
    blog() {
      this.blogHtml = this.blog.data.content;
      document.title = this.blog.info.caption;
    },
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
    title() {
      let txt = '';
      if (this.blog !== null) {
        txt = this.blog.info.caption;
      }
      return txt;
    },
    editorial() {
      return this.blog.info.editorial;
    },
    hidden() {
      return this.blog.info.hidden;
    },
    isAuthor() {
      return this.blog.info.author.id === this.$store.getters.USER_ID;
    },
    isAdmin() {
      return this.$store.getters.USER_ROLE && this.$store.getters.USER_ROLE.includes('admin:blog');
    },
  },
  created() {
    this.$store.dispatch('FETCH_BLOG', { slug: this.slug, component: this });
  },
  mounted() {
    document.onmouseover = () => {
      window.innerDocClick = true;
    };
    document.onmouseleave = () => {
      window.innerDocClick = false;
    };

    window.onpopstate = () => {
      if (!window.innerDocClick) {
        this.$store.commit('CLEAR_BLOG');
      }
    };
  },
  methods: {
    async toggleEditorial() {
      await this.$store.dispatch('TOGGLE_EDITORIAL');
    },
    async toggleHidden() {
      await this.$store.dispatch('TOGGLE_HIDDEN');
    },
    async toComments() {
      this.$scrollTo(document.getElementById('comments'), 500, { easing: 'ease' });
    },
    async deleteBlog() {
      this.error = undefined;
      try {
        await this.$store.dispatch('DELETE_BLOG', { blogId: this.blog._id });
        await this.$router.push('/');
      } catch (error) {
        this.$log.error(error);
        this.$log.error(error.response);
        if (error.response && error.response.data && error.response.data.errors && error.response.data.errors[0].messageKey) {
          this.$log.error(error.response.data.errors[0]);
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.operation-failed');
        }
      }
    },
  },
};
</script>
<style scoped>
.blog-posts {
  max-width: 1235px;
  margin: 0 auto;
}

.post-details-wrap {
  display: flex;
  width: 100%;
  flex-direction: column;
  flex-flow: column-reverse;
  position: relative;
}

.post-details-wrap h1 {
  font-size: 21px;
  text-decoration: none;
  color: var(--dark-color);
  margin: 0 0 10px;
}

.post-details-wrap .post-details, .post-details-wrap .hero-details {
  width: 100%;
  margin: 0 auto;
  display: flex;
  font-size: 14px;
  border-radius: 0;
}

.post-details-wrap .post-content {
  width: 100%;
  margin: 0 auto;
}

.post-content img {
  width: 100%;
}

.post-details {
  border-bottom: 1px solid #dee0e1;
  margin-bottom: 20px !important;
  padding: 0 0 5px;
}

.post-details span:last-child {
  border: 0;
}

.post-time, .post-author, .post-comments, .post-edit, .post-editorial, .post-delete {
  display: flex;
  align-items: center;
  font-weight: 400;
  margin-right: 15px;
  color: #777A7C;
}

.post-details div svg {
  margin-right: 8px;
}

blockquote {
  display: block;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 40px;
  background-color: whitesmoke;
  padding: 20px;
  font-style: italic;
  overflow-wrap: anywhere;
}

blockquote p {
  font-style: normal;
  font-weight: bold;
}

.post-content table thead:first-child tr {
  background: #fafbf2;
}

.post-content table thead tr {
  background: transparent
}

.post-content table:before {
  content: '';
  overflow-x: auto;
}

.post-content table {
  font-size: 14px;
}

.post-content h2, .post-content h3 {
  font-size: 18px;
  color: var(--text-color);
}

.post-content table {
  border: 1px solid #DBDBE2;
  border-radius: 3px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
}

.post-content table tr th {
  vertical-align: middle;
}

.post-content table tr td {
  border: 1px solid #DBDBE2;
  vertical-align: middle;
}

td div {
  padding: 10px;
}

.tc-table__inp {
  outline: none;
  flex-grow: 100;
  min-height: 1.5em;
  height: 100%;
  overflow: hidden;
}

tbody tr:first-child td {
  border-top: none;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr td:last-child {
  border-right: none;
}

tbody tr td:first-child {
  border-left: none;
}

.errors {
  margin-top: 1rem;
}
.errors .alert li{
  margin-top: 1rem;
}

@media (max-width: 1235px) {
  .post-details-wrap {
    padding: 0 35px;
  }
}
</style>
