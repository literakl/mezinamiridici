// TODO; Refactor out the hardcoded strings
<template>
  <div class="pt-3 centerbox m-auto">
    <div class="mb-2 d-flex flex-row-reverse action-btn">
      <b-button-group>
        <b-button v-if="role" :to="{ name: 'create-content'}" variant="btn btn-primary">
          <BIconFileEarmarkBreak scale="1"></BIconFileEarmarkBreak>
          {{ $t('cms.edit.new-cms-heading') }}
        </b-button>
      </b-button-group>
    </div>

    <b-form inline>
      <b-form-input
        id="manage-editorial"
        class="mr-2 mb-2"
        v-model="editorialUrl"
        :state="editorialValid"
        placeholder="Enter link or article name..."
        aria-describedby="input-live-help input-feedback"
        trim
        ></b-form-input>
      <b-button variant="danger" class="mb-2" @click="manageEditorial()">{{ $t('cms.editorial.search-label') }}</b-button>
    </b-form>
    <div id="input-error" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <b-card v-if="selectedBlog" class="mb-2 border border-danger shadow-sm">
      <b-card-body class="editorial">
        <div class="row mx-0 d-flex flex-row">
          <div class="d-flex flex-column col-md-5 mb-2">
            <span><h5>{{ $t('cms.editorial.title') }}</h5></span>
            <span>{{ selectedBlog.info.caption }}</span>
          </div>
          <div class="d-flex flex-column col-md-5 mb-2">
            <span><h5>{{ $t('cms.editorial.url') }}</h5></span>
            <span><a :href="selectedBlogUrl">{{ selectedBlogUrl }}</a></span>
          </div>
          <div class="d-flex flex-column col-md-2 mb-2">
            <span><h5>{{ $t('cms.editorial.editorial-label') }}</h5></span>
            <span>
              <b-form-checkbox class="mb-2 mr-sm-2 mb-sm-0" v-model="isEditorial" @change="toggleEditorial()">
                <b-badge pill variant="success" :class="{ 'success-badge': true, 'badge-visible': badgeVisible }">{{ $t('cms.editorial.saved-label') }}</b-badge>
              </b-form-checkbox>
            </span>
          </div>
        </div>
      </b-card-body>
    </b-card>

    <div v-for="item in cmsList" :key="item._id" class="pagelist-box">
      <b-card tag="article">
        <b-card-body>
          <h3>
            <router-link :to="{ name: 'page', params: { slug: item.info.slug }}">
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
            <b-button v-if="role" :to="{ name: 'edit-content', params: { slug: item.info.slug }}" variant="outline-primary">
              <BIconPencilSquare scale="1"></BIconPencilSquare>
              {{ $t('cms.edit.edit-cms') }}
            </b-button>
            <b-button v-if="role" @click="confirmDelete(item)" variant="outline-primary">
              <BIconTrash scale="1"></BIconTrash>
              {{ $t('cms.edit.delete-cms') }}
            </b-button>
          </b-button-group>
        </b-card-footer>
      </b-card>
    </div>
  </div>
</template>

<script>
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';
import {
  BButtonGroup, BButton, BCard, BCardBody, BCardFooter,
  BIconPersonCircle, BIconClock, BIconPencilSquare,
  BIconTrash, BIconFileEarmarkBreak, BFormInput, BForm, BFormCheckbox, BBadge,
} from 'bootstrap-vue';

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
    BIconFileEarmarkBreak,
    BFormInput,
    BForm,
    BFormCheckbox,
    BBadge,
  },
  data() {
    return {
      cmsList: null,
      editorialUrl: null,
      editorialValid: null,
      errorMessage: '',
      selectedBlog: null,
      isEditorial: false,
      badgeVisible: false,
    };
  },
  computed: {
    role() {
      // todo helper to test if user has a role
      return (this.$store.getters.USER_ROLE) ? this.$store.getters.USER_ROLE[1] === 'admin:pages' : false;
    },
    selectedBlogUrl() {
      return `${document.location.origin}/p/${this.selectedBlog.info.author.id}/b/${this.selectedBlog.info.slug}`;
    },
  },
  watch: {
    selectedBlog(value) {
      this.isEditorial = value && value.info.editorial;
    },
  },
  async mounted() {
    this.cmsList = await this.$store.dispatch('FETCH_PAGES', {});
  },
  methods: {
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(this.$t('cms.edit.delete-message'), {
        title: this.$t('poll.forms.poll-confirm-message-title'),
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
            this.deleteCMS(item);
          }
        })
        .catch((err) => {
          this.$log.error(err);
        });
    },

    async deleteCMS(item) {
      await this.$store.dispatch('DELETE_PAGE', {
        cmsId: item._id,
      });
      this.cmsList = await this.$store.dispatch('FETCH_PAGES', {});
    },

    async manageEditorial() {
      this.errorMessage = '';
      this.editorialValid = null;
      this.selectedBlog = null;
      if (!this.editorialUrl) return;

      const splitUrl = this.editorialUrl.split('/');
      const slug = splitUrl[splitUrl.length - 1] ? splitUrl[splitUrl.length - 1].toLowerCase() : splitUrl[splitUrl.length - 2].toLowerCase();

      let blog;
      try {
        blog = await this.$store.dispatch('FETCH_PAGE', { slug });
      } catch (error) {
        if (error.response.status === 404) {
          this.errorMessage = 'Entered item not found!';
          this.editorialValid = false;
          return;
        }
      }
      if (blog.type !== 'blog') {
        this.errorMessage = 'Entered item is not a blog!';
        this.editorialValid = false;
        return;
      }
      this.selectedBlog = blog;
    },

    async toggleEditorial() {
      const payload = {
        flag: this.isEditorial,
        id: this.selectedBlog._id,
      };

      const response = await this.$store.dispatch('TOGGLE_EDITORIAL', payload);

      if (response.success === true) {
        this.displaySuccessBadge();
      }
    },

    displaySuccessBadge() {
      this.badgeVisible = true;
      setTimeout(() => {
        this.badgeVisible = false;
      }, 1000);
    },
  },
};
</script>

<style scoped>

.centerbox {
  max-width: 1235px;
  margin: 0 auto;
}

#manage-editorial {
  width: 40vw;
  min-width: 175px;
}

#input-error {
  color: red;
  font-size: 0.9rem;
}

.border-danger {
  border-width: 2px !important;;
}

.success-badge {
  opacity: 0;
  transition: opacity 0.5s ease-out;
}

.badge-visible {
  opacity: 1;
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
.pagelist-box .card-body .card-body{
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

  .editorial {
    padding-left: 0;
    padding-right: 0;
  }
}

@media (max-width: 660px) {
  .pagelist-box .card-footer {
    align-items: flex-start;
  }
}

@media (max-width: 540px) {
  #manage-editorial {
    width: 100%;
    margin-right: 0 !important;
  }

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
