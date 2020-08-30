<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <b-row v-if="error">
      <b-col>
        <strong class="text-danger">
          {{ error }}
        </strong>
      </b-col>
    </b-row>
    <b-row v-if="myProfile && !error">
      <b-col>
        <b-button variant="secondary" :to="{ name: 'update-profile'}">
          <BIconPencil aria-hidden="true"></BIconPencil>
          {{ $t('profile.update-button') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <h1 v-if="userProfile">
          {{ userProfile.bio.nickname }}
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <dl v-if="userProfile && !error">
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
      </b-col>
    </b-row>

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
</template>

<script>
import { BIconPencil } from 'bootstrap-vue';
import { ContentLoader } from 'vue-content-loader';

export default {
  name: 'profile',
  components: {
    ContentLoader, BIconPencil,
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
        this.$log.error(err);
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
