<template>
  <b-container fluid class="w-75 m-auto pt-5 pb-5">
    <div>
      <div>
        <div v-if="error">
          <strong class="text-danger">
            {{ error }}
          </strong>
        </div>

        <p v-if="myProfile && !error">
          <router-link :to="{ name: 'update-profile'}">{{ $t('profile.update-button') }}</router-link>
        </p>

        <dl v-if="userProfile && !error">
          <b-row>
            <dt class="pl-3">{{ $t('profile.nickname') }}</dt>
            <dl class="pl-5">{{userProfile.bio.nickname}}</dl>
          </b-row>
          <template v-if="publicProfile">
            <template v-if="userProfile.driving">
              <template v-if="userProfile.driving.since">
                <dt>{{ $t('profile.driving-since') }}</dt>
                <dl>{{userProfile.driving.since}}</dl>
              </template>

              <template v-if="vehicles">
                <dt>{{ $t('profile.vehicle') }}</dt>
                <dl>{{vehicles}}</dl>
              </template>
            </template>

            <template v-if="userProfile.bio.sex">
              <dt>{{ $t('profile.sex') }}</dt>
              <dl>{{ $t('profile.sexes.' + userProfile.bio.sex) }}</dl>
            </template>

            <template v-if="userProfile.bio.born">
              <dt>{{ $t('profile.born') }}</dt>
              <dl>{{userProfile.bio.born}}</dl>
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
  </b-container>
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
      if (this.userProfile.driving.vehicles) {
        return this.userProfile.driving.vehicles.reduce((acc, curr) => acc.concat(this.$t(`profile.vehicles.${curr}`), ' '), '');
      }
      return undefined;
    },
  },
  created() {
    this.getProfile(this.id);
  },
  beforeRouteUpdate(to, from, next) {
    this.userProfile = null;
    this.error = null;
    const { params: { id } } = to;
    this.getProfile(id);
    next();
  },
  methods: {
    async getProfile(id) {
      try {
        const response = await this.$store.dispatch('GET_USER_PROFILE_BY_ID', { id });
        this.userProfile = response.data.data;
      } catch (err) {
        // eslint-disable-next-line no-console
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
