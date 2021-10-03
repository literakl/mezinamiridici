<template>
  <div class="pt-3 centerbox m-auto">
    <div class="head-area">
      <h2>{{ $t('blog.articles.heading') }}</h2>
    </div>

    <div v-if="!isAuthorized">
      {{ $t('blog.articles.not-authorized') }}
    </div>

    <template v-else>
      <div v-for="item in articles" :key="item._id" class="pagelist-box">
        <b-card tag="article">
          <b-card-body>
            <h3>
              <router-link :to="{ name: 'blog', params: { slug: item.info.slug, id: item.info.author.id }}">
                {{ item.info.caption }}
              </router-link>
            </h3>
          </b-card-body>
          <b-card-footer>
            <div>
            <span>
              <BIconClock scale="1"></BIconClock>
              <Date :date="item.info.date" format="dynamicDate"/>
            </span>
              <span>
              <BIconPersonCircle scale="1"></BIconPersonCircle>
              <ProfileLink :profile="item.info.author"/>
            </span>
              <span v-if="! item.info.published">
                &bull; {{ $t('generic.not-published') }}
            </span>
            </div>
            <b-button-group>
              <b-button v-if="canEdit" :to="{ name: 'update-blog', params: { slug: item.info.slug, id: item.info.author.id }}" variant="outline-primary">
                <BIconPencilSquare scale="1"></BIconPencilSquare>
                {{ $t('generic.edit-button') }}
              </b-button>
              <b-button v-if="canDelete" @click="confirmDelete(item)" variant="outline-primary">
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
  BButtonGroup, BButton, BCard, BCardBody, BCardFooter,
  BIconPersonCircle, BIconClock, BIconPencilSquare, BIconTrash,
} from 'bootstrap-vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';

export default {
  name: 'Pages',
  components: {
    ProfileLink,
    Date,
    BButtonGroup,
    BButton,
    BCard,
    BCardBody,
    BCardFooter,
    BIconPersonCircle,
    BIconClock,
    BIconPencilSquare,
    BIconTrash,
  },
  data() {
    return {
      articles: null,
    };
  },
  computed: {
    isAuthorized() {
      if (this.$store.getters.USER_ID === null || this.$store.getters.HAS_ROLES) {
        return false;
      }
      if (this.$store.getters.USER_ROLES.includes('admin:editor')) {
        return true;
      } else if (this.$store.getters.USER_ROLES.includes('user:staffer')) {
        return true;
      }
      return false;
    },
    canEdit() {
      if (this.$store.getters.USER_ROLES.includes('admin:editor')) {
        return true;
      }
      return !this.blog.info.published;
    },
    canDelete() {
      return this.$store.getters.USER_ROLES.includes('admin:editor');
    },
  },
  async mounted() {
    this.articles = await this.$store.dispatch('FETCH_ARTICLES', {});
  },
  methods: {
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(this.$t('cms.delete-message'), {
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
            this.deleteBlog(item);
          }
        })
        .catch((err) => {
          this.$log.error(err);
        });
    },

    async deleteBlog(item) {
      await this.$store.dispatch('DELETE_BLOG', {
        blogId: item._id,
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

.action-btn a svg {
  color: #fff;
}

.pagelist-box {
  margin-bottom: 10px;
}
.pagelist-box .card{
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