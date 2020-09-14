<template>
  <div class="pt-3 w-75 m-auto">
    <div class="mb-2 d-flex flex-row-reverse">
      <b-button-group>
        <b-button v-if="role" :to="{ name: 'create-cms'}" variant="outline-primary">
          {{ $t('cms.edit.new-cms-heading') }}
        </b-button>
      </b-button-group>
    </div>

    <div v-for="item in cmsList" :key="item._id">
      <b-card tag="article">
        <b-card-body>
          <h3>
            <router-link :to="{ name: 'cms', params: { slug: item.info.slug }}">
              {{item.info.caption}}
            </router-link>
          </h3>
        </b-card-body>
        <b-card-footer class="d-flex justify-content-between">
          <div>
            <Date :date="item.info.date" format="dynamicDate" /> &bull;
            <ProfileLink :profile="item.info.author"/>
            <span v-if="! item.info.published">
                &bull;{{ $t('generic.not-published') }}
            </span>
          </div>
          <b-button-group>
            <b-button v-if="role" :to="{ name: 'edit-cms', params: { slug: item.info.slug, type:item.type }}" variant="outline-primary">
              {{ $t('cms.edit.edit-cms') }}
            </b-button>
            <b-button v-if="role" @click="confirmDelete(item)" variant="outline-primary">
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

export default {
  components: {
    ProfileLink, Date,
  },
  data() {
    return {
      cmsList: null,
    };
  },
  computed: {
    role() {
      return (this.$store.getters.USER_ROLE) ? this.$store.getters.USER_ROLE[1] === 'admin:cms' : false;
    },
  },
  async mounted() {
    this.cmsList = await this.$store.dispatch('FETCH_CMS_LIST', {});
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
      await this.$store.dispatch('DELETE_CMS', {
        cmsId: item._id,
      });
      this.cmsList = await this.$store.dispatch('FETCH_CMS_LIST', {});
    },
  },
};
</script>
