<template>
    <div>
        <div class="profile">
            <div class="profile__wrapper">
                <dl v-if="profile">
                    <dt>{{ $t('profile.nickname') }}</dt>
                    <dl>{{profile.nickname}}</dl>

                    <dt v-if="!nicknameOnly">{{ $t('profile.driving-for') }}</dt>
                    <dl v-if="!nicknameOnly">{{drivingSince}}</dl>

                    <dt v-if="!nicknameOnly">{{ $t('profile.vehicle') }}</dt>
                    <dl v-if="!nicknameOnly">{{vehicles}}</dl>

                    <dt v-if="!nicknameOnly">{{ $t('profile.region') }}</dt>
                    <dl v-if="!nicknameOnly">{{profile.locationalRegion}}</dl>

                    <dt v-if="!nicknameOnly">{{ $t('profile.education') }}</dt>
                    <dl v-if="!nicknameOnly">{{profile.education}}</dl>

                    <dt v-if="!nicknameOnly">{{ $t('profile.sex') }}</dt>
                    <dl v-if="!nicknameOnly">{{profile.sex}}</dl>
                </dl>


                 <content-loader
                  :height="100"
                  :width="400"
                  :speed="2"
                  primaryColor="#949494"
                  secondaryColor="#606060"
                  v-if="!profile"
                >
                  <rect x="9" y="12" rx="3" ry="3" width="50" height="5" />
                  <rect x="70" y="12" rx="3" ry="3" width="100" height="5" />

                  <rect x="9" y="31" rx="3" ry="3" width="50" height="5" />
                  <rect x="70" y="31" rx="3" ry="3" width="100" height="5" />

                  <rect x="9" y="51" rx="3" ry="3" width="50" height="5" />
                  <rect x="70" y="51" rx="3" ry="3" width="100" height="5" />

                  <rect x="9" y="71" rx="3" ry="3" width="50" height="5" />
                  <rect x="70" y="71" rx="3" ry="3" width="100" height="5" />

                  <rect x="9" y="91" rx="3" ry="3" width="50" height="5" />
                  <rect x="70" y="91" rx="3" ry="3" width="100" height="5" />
                </content-loader>
            </div>
        </div>
        <PaginatedTopPolls />
    </div>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';
import PaginatedTopPolls from '@/components/organisms/PaginatedTopPolls.vue';

export default {
  name: 'profile',
  components: {
    PaginatedTopPolls,
    ContentLoader,
  },
  props: {
    id: String,
  },
  computed: {
    profile() {
      if (this.id) {
        return this.$store.getters.USER_PROFILE;
      }
      return this.$store.getters.SIGNED_IN_USER_PROFILE;
    },
    nicknameOnly() {
      return this.profile.shareProfile === 'share-nickname' && this.id !== undefined && this.id !== null;
    },
    drivingSince() {
      const length = new Date().getFullYear() - parseInt(this.profile.drivingSince, 10);

      if (length === 1) {
        return '1 year';
      }

      if (length > 1) {
        return `${length} years`;
      }

      return '0 years';
    },
    vehicles() {
      return (this.profile.vehicle) ? this.profile.vehicle.join(' ') : '';
    },
  },
  created() {
    if (this.id !== undefined && this.id !== null) {
      this.$store.dispatch('GET_USER_PROFILE_BY_ID', {
        id: this.id,
      });
    } else {
      this.$store.dispatch('GET_SIGNED_IN_USER_PROFILE');
    }
  },
  data: () => ({
    page: 0,
  }),
  methods: {
    clicked() {
      console.log('Loading more...');
      this.page += 1;
    },
  },
};
</script>

<style>
.profile {
    background: #f6f6f6;
    margin-top: -16px;
    padding-top: 30px;
    height: 100%;
}

.profile__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
    height: 100%;
}

.polls {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

dl {
  display: grid;
  grid-template-columns: max-content auto;
  margin: 0px;
}

dt {
  grid-column-start: 1;
  font-weight: bolder;
  padding-right: 50px;
  padding-bottom: 20px;
}

dd {
  grid-column-start: 2;
}
</style>
