<template>
  <div class="pt-3 centerbox m-auto">
    <div class="head-area">
      <h2>{{ $t('page-title.pages') }}</h2>
    </div>

    <div class="mb-2 d-flex flex-row-reverse action-btn">
      <b-button-group>
        <b-button v-if="role" :to="{ name: 'create-page'}" variant="outline-primary">
          <BIconFileEarmarkPlusFill scale="1" />
          {{ $t('pages.new-page-button') }}
        </b-button>
      </b-button-group>
    </div>

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
              <span>
                {{ $t(`generic.content.state.${item.info.state}`) }}
              </span>
            </span>
            <span>
              <BIconPersonCircle scale="1"></BIconPersonCircle>
              <ProfileLink :profile="item.info.author"/>
            </span>
          </div>
          <b-button-group>
            <!--TODO publish button-->
            <b-button v-if="role" :to="{ name: 'edit-page', params: { slug: item.info.slug }}" variant="outline-primary">
              <BIconPencilSquare scale="1"></BIconPencilSquare>
              {{ $t('generic.edit-button') }}
            </b-button>
            <b-button v-if="role" @click="confirmDelete(item)" variant="outline-primary">
              <BIconTrash scale="1"></BIconTrash>
              {{ $t('generic.delete-button') }}
            </b-button>
          </b-button-group>
        </b-card-footer>
      </b-card>
    </div>
  </div>
</template>

<script>
import {
  BButtonGroup, BButton, BCard, BCardBody, BCardFooter,
  BIconPersonCircle, BIconClock, BIconPencilSquare,
  BIconTrash, BIconFileEarmarkPlusFill,
} from 'bootstrap-vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';

export default {
  name: 'Pages',
  components: {
    BButtonGroup,
    BButton,
    BCard,
    BCardBody,
    BCardFooter,
    BIconClock,
    BIconFileEarmarkPlusFill,
    BIconPencilSquare,
    BIconPersonCircle,
    BIconTrash,
    Date,
    ProfileLink,
  },
  data() {
    return {
      cmsList: null,
    };
  },
  computed: {
    role() {
      // todo helper to test if user has a role
      return this.$store.getters.USER_ROLES.includes('admin:pages');
    },
  },
  async mounted() {
    this.cmsList = await this.$store.dispatch('FETCH_PAGES', {});
  },
  methods: {
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(this.$t('pages.delete-message'), {
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
            this.deletePage(item);
          }
        })
        .catch((err) => {
          this.$log.error(err);
        });
    },

    async deletePage(item) {
      await this.$store.dispatch('DELETE_PAGE', {
        cmsId: item._id,
      });
      this.cmsList = await this.$store.dispatch('FETCH_PAGES', {});
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
