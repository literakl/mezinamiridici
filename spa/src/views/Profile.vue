<template>
  <div>
    <div class="profile">
      <div class="profile__wrapper">
        <div v-if="error">
          <strong class="profile__errors-heading">
            {{ error }}
          </strong>
        </div>

        <p v-if="myProfile && !error">
          <router-link :to="{ name: 'update-profile'}">{{ $t('profile.update-button') }}
          </router-link>
          &middot;
          <router-link :to="{ name: 'update-password'}">{{ $t('profile.password-button') }}
          </router-link>
        </p>

        <dl v-if="userProfile && !error">
          <dt>{{ $t('profile.nickname') }}</dt>
          <dl>{{userProfile.bio.nickname}}</dl>

          <template v-if="publicProfile">
            <template v-if="userProfile.bio.sex">
              <dt>{{ $t('profile.sex') }}</dt>
              <dl>{{ $t('profile.sexes.' + userProfile.bio.sex) }}</dl>
            </template>

            <template v-if="userProfile.bio.born">
              <dt>{{ $t('profile.born') }}</dt>
              <dl>{{userProfile.bio.born}}</dl>
            </template>

            <template v-if="userProfile.driving.since">
              <dt>{{ $t('profile.driving-since') }}</dt>
              <dl>{{userProfile.driving.since}}</dl>
            </template>

            <template v-if="vehicles">
              <dt>{{ $t('profile.vehicle') }}</dt>
              <dl>{{vehicles}}</dl>
            </template>

            <template v-if="userProfile.bio.region">
              <dt>{{ $t('profile.region') }}</dt>
              <dl>{{ $t('profile.regions.' + userProfile.bio.region) }}</dl>
            </template>

            <template v-if="userProfile.bio.edu">
              <dt>{{ $t('profile.education') }}</dt>
              <dl>{{ $t('profile.educations.' + userProfile.bio.edu) }}</dl>
            </template>
          </template>
        </dl>

        <content-loader
          :height="100"
          :width="400"
          :speed="2"
          primaryColor="#949494"
          secondaryColor="#606060"
          v-if="!userProfile && !error"
        >
          <rect x="9" y="12" rx="3" ry="3" width="50" height="5"/>
          <rect x="70" y="12" rx="3" ry="3" width="100" height="5"/>

          <rect x="9" y="31" rx="3" ry="3" width="50" height="5"/>
          <rect x="70" y="31" rx="3" ry="3" width="100" height="5"/>

          <rect x="9" y="51" rx="3" ry="3" width="50" height="5"/>
          <rect x="70" y="51" rx="3" ry="3" width="100" height="5"/>

          <rect x="9" y="71" rx="3" ry="3" width="50" height="5"/>
          <rect x="70" y="71" rx="3" ry="3" width="100" height="5"/>

          <rect x="9" y="91" rx="3" ry="3" width="50" height="5"/>
          <rect x="70" y="91" rx="3" ry="3" width="100" height="5"/>
        </content-loader>
      </div>
    </div>
  </div>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';

export default {
  name: 'profile',
  components: {
    ContentLoader,
  },
  props: {
    id: String,
  },
  data: () => ({
    userProfile: null,
    error: null,
  }),
  computed: {
    myProfile() {
      return this.id === this.$store.getters.USER_ID;
    },
    publicProfile() {
      return this.myProfile || this.userProfile.prefs.public === true;
    },
    vehicles() {
      return this.userProfile.driving.vehicles.reduce((acc, curr) => acc.concat(this.$t(`profile.vehicles.${curr}`), ' '), '');
    },
  },
  created() {
    console.log('created');
    this.getProfile(this.id);
  },
  beforeRouteUpdate(to, from, next) {
    const { params: { id } } = to;
    this.getProfile(id);
    next();
  },
  methods: {
    async getProfile(id) {
      try {
        console.log('getProfile');
        const response = await this.$store.dispatch('GET_USER_PROFILE_BY_ID', { id });
        this.userProfile = response.data.data;
      } catch (err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.errors) {
          this.error = this.$t(err.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      }
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
