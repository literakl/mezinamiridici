<template>
  <div v-if="article._id" class="blog-posts pt-3 m-auto">
    <div class="post-details-wrap">
      <div>
        <div class="hero-details">
          <h1>{{ title }}</h1>
        </div>
        <div class="post-details">
          <div class="post-author">
            <BIconPersonCircle scale="1"></BIconPersonCircle>
            <ProfileLink :profile="article.info.author"/>
          </div>
          <div class="post-time">
            <BIconCalendarCheck v-if="isWaiting(article)" scale="1" />
            <BIconClock v-else scale="1" />
            <Date :date="article.info.date" format="dynamicDate"/>
            <span v-if="article.info.state === 'draft'" style="margin-left: 5px">
              {{ $t(`generic.content.state.draft`) }}
            </span>
            <span v-if="isWaiting(article)" style="margin-left: 5px">
              {{ $t(`articles.scheduled-article`) }}
            </span>
          </div>
          <div class="post-comments">
            <BIconChatTextFill scale="1"></BIconChatTextFill>
            <b-link v-on:click="toComments">
              {{ article.comments.count }}
            </b-link>
          </div>
          <div v-if="canEdit" class="post-edit">
            <BIconPencilSquare scale="1"></BIconPencilSquare>
            <router-link :to="{name: 'update-article', params: { id: article._id } }">
              {{ $t('generic.edit-button') }}
            </router-link>
          </div>
        </div>
        <div class="errors">
          <b-alert variant="danger" dismissible :show="error !== undefined">
            {{ error }}
          </b-alert>
        </div>

        <div class="post-content p3" v-html="generatedHtml"></div>

        <div class="content-wrap">
          <ShareLink :item="article"/>
          <Comments :itemId="article._id"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BAlert,
  BIconCalendarCheck,
  BIconChatTextFill,
  BIconClock,
  BIconPencilSquare,
  BIconPersonCircle,
  BLink,
} from 'bootstrap-vue';
import Comments from '@/components/organisms/Comments.vue';
import ShareLink from '@/components/molecules/ShareLink.vue';
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import { isInFuture } from '@/utils/dateUtils';

export default {
  name: 'Article',
  components: {
    BAlert,
    BIconCalendarCheck,
    BIconClock,
    BIconChatTextFill,
    BIconPencilSquare,
    BIconPersonCircle,
    BLink,
    Comments,
    Date,
    ProfileLink,
    ShareLink,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      generatedHtml: '',
      error: undefined,
    };
  },
  watch: {
    article() {
      if (this.article) {
        this.generatedHtml = this.applySnippets();
        document.title = this.article.info.caption;
      }
    },
  },
  computed: {
    article() {
      return this.$store.getters.CONTENT;
    },
    title() {
      let txt = '';
      if (this.article !== null) {
        txt = this.article.info.caption;
      }
      return txt;
    },
    canEdit() {
      if (!this.$store.getters.IS_AUTHORIZED) {
        return false;
      }
      if (this.$store.getters.USER_ROLES && this.$store.getters.USER_ROLES.includes('admin:editor')) {
        return true;
      }
      return this.article.info.author.id === this.$store.getters.USER_ID && this.article.info.state === 'draft';
    },
  },
  created() {
    this.$store.commit('CLEAR_CONTENT');
    this.$store.dispatch('FETCH_CONTENT', { slug: this.slug, component: this });
  },
  mounted() {
    document.onmouseover = () => {
      window.innerDocClick = true;
    };
    document.onmouseleave = () => {
      window.innerDocClick = false;
    };
  },
  methods: {
    isWaiting(item) {
      return item.info.state === 'published' && isInFuture(item.info.date);
    },
    // find snippet pattern [code="animated_chart"] and replace it with its content
    applySnippets() {
      const html = this.article.data.content;
      if (!this.article.snippets || this.article.snippets.length === 0) {
        return html;
      }
      const regex = /\[code="([\w]+)"\]/gm;
      const replacer = (match, foundCode) => {
        const snippet = this.article.snippets.find(({ code }) => code === foundCode);
        return snippet.content;
      };
      return html.replace(regex, replacer);
    },
    async toComments() {
      this.$scrollTo(document.getElementById('comments'), 500, { easing: 'ease' });
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

.post-time, .post-author, .post-comments {
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
