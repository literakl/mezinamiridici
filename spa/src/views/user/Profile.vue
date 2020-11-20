<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <b-row v-if="error">
      <b-col>
        <strong class="text-danger">
          {{ error }}
        </strong>
      </b-col>
    </b-row>
    <b-row v-if="userProfile">
      <b-col>
        <b-input-group inline>

          <div class="mr-3">
            <b-avatar :src="userProfile.bio.avatar" size="5rem"></b-avatar>
          </div>

          <b-col cols="10">
            <b-row>
              <h2>
                {{ userProfile.bio.nickname }}
              </h2>
            </b-row>
            <b-row v-if="userProfile.prefs.public">
              <BIconGeoAlt font-scale="2"></BIconGeoAlt>
              <span>{{$t(`profile.regions.${userProfile.bio.region}`)}}</span>
              <div v-for="(item, inx) in userProfile.bio.urls" :key="inx" class="mx-2"> <BIconLink/> <a :href="item">{{item}}</a></div>
            </b-row>
          </b-col>

        </b-input-group>

        <HonorsProgress v-if="myProfile" :user="userProfile"/>
        <div>
          {{ $t('profile.member-since-label') }}: <Date :date="userProfile.bio.registered" format="dynamicDate" />
        </div>

        <div>
          {{ $t('profile.rank-label') }}: {{ $t(`profile.rank.${userProfile.honors.rank}`) }}
        </div>
      </b-col>
    </b-row>
    <b-row v-if="userProfile && !error">
      <b-col>
        <dl v-if="showProfile">
          <template v-if="userProfile.driving">
            <div v-if="userProfile.driving.since">
              {{ $t('profile.driving-since-label') }}: {{userProfile.driving.since}}
            </div>

            <div v-if="vehicles">
              {{ $t('profile.vehicles-label') }}: {{vehicles}}
            </div>
          </template>

          <div v-if="userProfile.bio.sex">
            {{ $t('profile.sex') }}: {{ $t('profile.sexes.' + userProfile.bio.sex) }}
          </div>

          <div v-if="userProfile.bio.born">
            {{ $t('profile.born') }}: {{userProfile.bio.born}}
          </div>

          <div v-if="userProfile.bio.region">
            {{ $t('profile.region') }}: {{ $t('profile.regions.' + userProfile.bio.region) }}
          </div>

          <div v-if="userProfile.bio.edu">
            {{ $t('profile.education') }}: {{ $t('profile.educations.' + userProfile.bio.edu) }}
          </div>
        </dl>
      </b-col>
    </b-row>

    <ContentLoading v-if="!userProfile && !error" type="profile" />

    <UserActivity :timeline-title="title"/>
  </div>
</template>

<script>
import UserActivity from '@/components/atoms/UserActivity.vue';
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import HonorsProgress from '@/components/molecules/HonorsProgress.vue';
import Date from '@/components/atoms/Date.vue';
import { BRow, BCol, BAvatar, BInputGroup, BIconGeoAlt, BIconLink } from 'bootstrap-vue';

export default {
  name: 'profile',
  components: {
    ContentLoading,
    UserActivity,
    HonorsProgress,
    Date,
    BRow,
    BCol,
    BAvatar,
    BInputGroup,
    BIconGeoAlt,
    BIconLink,
  },
  props: {
    id: String,
  },
  data: () => ({
    userProfile: null,
    error: null,
    title: 'User Activity',
  }),
  computed: {
    myProfile() {
      return this.id === this.$store.getters.USER_ID;
    },
    showProfile() {
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
