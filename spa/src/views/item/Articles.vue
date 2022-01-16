<template>
  <div class="pt-3 centerbox m-auto">
    <div class="head-area">
      <h2>{{ $t('page-title.articles') }}</h2>
    </div>

    <div v-if="!isAuthorized">
      {{ $t('articles.not-authorized') }}
    </div>

    <template v-else>
      <ContentLoading v-if="!articles" type="items"/>

      <div v-if="noArticlesFound">{{ $t('articles.empty') }}</div>

      <div class="mb-2 d-flex flex-row-reverse action-btn">
        <b-button-group>
          <b-button :to="{ name: 'create-article'}" variant="outline-primary">
            <BIconFileEarmarkPlusFill scale="1" />
            {{ $t('articles.new-article-button') }}
          </b-button>
        </b-button-group>
      </div>

      <div v-for="item in articles" :key="item._id" class="pagelist-box">
        <b-card tag="article">
          <b-card-body>
            <h3>
              <router-link :to="{ name: 'article', params: { slug: item.info.slug }}">
                {{ item.info.caption }}
              </router-link>
            </h3>
          </b-card-body>
          <b-card-footer>
            <div>
              <span>
                <BIconCalendarCheck v-if="isWaiting(item)" scale="1" />
                <BIconClock v-else scale="1" />
                <Date :date="item.info.date" format="dynamicDate"/>
                <span v-if="item.info.state === 'draft'">
                  {{ $t(`generic.content.state.draft`) }}
                </span>
                <span v-if="isWaiting(item)">
                  {{ $t(`articles.scheduled-article`) }}
                </span>
              </span>
              <span>
                <BIconPersonCircle scale="1"></BIconPersonCircle>
                <ProfileLink :profile="item.info.author"/>
              </span>
            </div>
            <b-button-group>
              <b-button v-if="canEdit(item)" :to="{ name: 'update-article', params: { slug: item.info.slug }}" variant="outline-primary">
                <BIconPencilSquare scale="1"></BIconPencilSquare>
                {{ $t('generic.edit-button') }}
              </b-button>
              <b-button v-if="isEditor" :to="{ name: 'code-article', params: { slug: item.info.slug }}" variant="outline-primary">
                <BIconCodeSlash scale="1"></BIconCodeSlash>
                {{ $t('generic.edit-html-button') }}
              </b-button>
              <b-button v-if="item.info.state === 'draft'" @click="togglePublished(item)" variant="outline-primary" style="margin-right: 10px">
                <BIconToggle2Off scale="1"></BIconToggle2Off>
                {{ $t('articles.publish.mark') }}
              </b-button>
              <b-button v-else @click="togglePublished(item)" variant="outline-primary" style="margin-right: 10px">
                <BIconToggle2On scale="1"></BIconToggle2On>
                {{ $t('articles.publish.unmark') }}
              </b-button>
              <b-button v-if="canDelete(item)" @click="confirmDelete(item)" variant="outline-primary">
                <BIconTrash scale="1"></BIconTrash>
                {{ $t('generic.delete-button') }}
              </b-button>
            </b-button-group>
          </b-card-footer>
        </b-card>
      </div>
    </template>
  </div>
</template>

<script>
import {
  BButtonGroup,
  BButton,
  BCard,
  BCardBody,
  BCardFooter,
  BIconCalendarCheck,
  BIconClock,
  BIconCodeSlash,
  BIconFileEarmarkPlusFill,
  BIconPencilSquare,
  BIconPersonCircle,
  BIconToggle2On,
  BIconToggle2Off,
  BIconTrash,
} from 'bootstrap-vue';
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import { isInFuture } from '@/utils/dateUtils';

export default {
  name: 'Articles',
  components: {
    BButtonGroup,
    BButton,
    BCard,
    BCardBody,
    BCardFooter,
    BIconCalendarCheck,
    BIconCodeSlash,
    BIconClock,
    BIconFileEarmarkPlusFill,
    BIconPencilSquare,
    BIconPersonCircle,
    BIconToggle2On,
    BIconToggle2Off,
    BIconTrash,
    ContentLoading,
    Date,
    ProfileLink,
  },
  data() {
    return {
      articles: null,
      noArticlesFound: undefined,
    };
  },
  computed: {
    isAuthorized() {
      if (this.$store.getters.USER_ID === null || !this.$store.getters.HAS_ROLES) {
        return false;
      }
      if (this.$store.getters.USER_ROLES.includes('admin:editor')) {
        return true;
      } else if (this.$store.getters.USER_ROLES.includes('user:staffer')) {
        return true;
      }
      return false;
    },
    isEditor() {
      return this.$store.getters.USER_ROLES.includes('admin:editor');
    },
  },
  async mounted() {
    this.articles = await this.$store.dispatch('FETCH_ARTICLES', {});
    this.noArticlesFound = this.articles.length === 0;
  },
  methods: {
    isWaiting(item) {
      return item.info.state === 'published' && isInFuture(item.info.date);
    },
    canEdit(item) {
      if (this.$store.getters.USER_ROLES.includes('admin:editor')) {
        return true;
      }
      return item.info.state === 'draft';
    },
    canDelete(item) {
      if (this.$store.getters.USER_ROLES.includes('admin:editor')) {
        return true;
      }
      return item.info.state === 'draft';
    },
    async togglePublished(item) {
      await this.$store.dispatch('TOGGLE_PUBLISHED', item);
    },
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(this.$t('articles.delete-message'), {
        title: this.$t('generic.confirm-title'),
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: this.$t('generic.ok-button'),
        cancelTitle: this.$t('generic.cancel-button'),
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      })
        .then((value) => {
          if (value) {
            this.deleteArticle(item);
          }
        })
        .catch((err) => {
          this.$log.error(err);
        });
    },

    async deleteArticle(item) {
      await this.$store.dispatch('DELETE_ARTICLE', {
        itemId: item._id,
      });
      this.articles = await this.$store.dispatch('FETCH_ARTICLES', {});
    },
  },
};
</script>

<style scoped>
.centerbox {
  max-width: 1235px;
  margin: 0 auto;
}

.action-btn a {
  font-size: 14px;
}

.pagelist-box {
  margin-bottom: 10px;
}

.pagelist-box .card {
  border-color: #ddd;
}

.pagelist-box .card-body {
  padding: 10px;
}

.pagelist-box .card-body .card-body {
  padding: 0;
}

.pagelist-box h3 {
  font-size: 18px;
}

.pagelist-box .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 0 solid #ddd;
  background: rgba(134, 134, 134, 0.1);
  padding: 8px 15px;
}

.pagelist-box .card-footer svg {
  margin-right: 5px;
}

.pagelist-box .card-footer span span {
  margin-right: 15px;
  font-size: 14px;
}

.pagelist-box .card-footer .btn-group button {
  font-size: 14px;
  padding: 0;
  border: 0;
  font-weight: 300;
}

.pagelist-box .card-footer .btn-group button:hover, .pagelist-box .card-footer .btn-group button:focus {
  background: transparent;
  color: var(--text-color);
}

.pagelist-box .card-footer .btn-group a:hover, .pagelist-box .card-footer .btn-group a:focus {
  background: transparent;
  color: var(--text-color);
}

.pagelist-box .card-footer .btn-group a {
  font-size: 14px;
  margin-right: 10px;
  padding: 0;
  border: 0;
  font-weight: 300;
}

@media (max-width: 1235px) {
  .centerbox {
    max-width: 1235px;
    margin: 0 35px !important;
  }
}

@media (max-width: 660px) {
  .pagelist-box .card-footer {
    align-items: flex-start;
  }
}

@media (max-width: 540px) {
  .pagelist-box .card-footer span {
    display: flex;
    flex-direction: column;
    margin: 0 4px 0 0;
  }

  .pagelist-box .card-footer span span {
    margin-right: 0;
  }

  .pagelist-box .card-footer div {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .pagelist-box .card-footer svg {
    display: block;
    text-align: center;
    justify-content: center;
    margin: 0 auto;
  }
}
</style>
