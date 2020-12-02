<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <ContentLoading v-if="!userProfile" type="profile" />
    <div v-if="userProfile">
      <div class="mb-3">
        <div class="mr-3">
          <b-avatar size="5rem"></b-avatar>
        </div>

        <div>
          <h2>{{ userProfile.bio.nickname }}</h2>

          <div v-if="userProfile.prefs.public && userProfile.bio.region">
            <BIconGeoAlt font-scale="2"></BIconGeoAlt>
            <span>{{$t(`profile.regions.${userProfile.bio.region}`)}}</span>
          </div>

          <div v-for="(item, inx) in userProfile.bio.urls" :key="inx" class="mx-2">
            <BIconLink/>
            <a :href="item" rel="nofollow">{{item}}</a>
          </div>
        </div>
      </div>

      <b-tabs content-class="mt-3">
        <b-tab :title="$t('profile.tabs.summary')" active>
          <div>
            <div>
              {{ $t('profile.rank-label') }}: {{ $t(`profile.rank.${userProfile.honors.rank}`) }}
            </div>
            <div>
              {{ $t('profile.member-since-label') }}: <Date :date="userProfile.bio.registered" format="dynamicDate" />
            </div>
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
          </div>
        </b-tab>

        <b-tab :title="$t('profile.tabs.activity')">
          <UserActivity :userId="userProfile._id"/>
        </b-tab>

        <b-tab v-if="myProfile" :title="$t('profile.tabs.honors')">
          <HonorsProgress v-if="myProfile" :user="userProfile"/>
        </b-tab>

        <b-tab v-if="myProfile" :title="$t('profile.tabs.settings')">
          <ChangePassword />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import Date from '@/components/atoms/Date.vue';
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import HonorsProgress from '@/components/molecules/HonorsProgress.vue';
import UserActivity from '@/components/organisms/UserActivity.vue';
import ChangePassword from '@/components/organisms/ChangePassword.vue';
import { BTabs, BTab, BAvatar, BIconGeoAlt, BIconLink } from 'bootstrap-vue';

export default {
  name: 'profile',
  components: {
    ContentLoading,
    UserActivity,
    HonorsProgress,
    ChangePassword,
    Date,
    BTabs,
    BTab,
    BAvatar,
    BIconGeoAlt,
    BIconLink,
  },
  props: {
    id: String,
  },
  data: () => ({
    userProfile: null,
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
    this.fetchProfile(this.id);
  },
  beforeRouteUpdate(to, from, next) {
    this.userProfile = null;
    const { params: { id } } = to;
    this.fetchProfile(id);
    next();
  },
  methods: {
    async fetchProfile(id) {
      try {
        const response = await this.$store.dispatch('GET_USER_PROFILE_BY_ID', { id });
        this.userProfile = response.data.data;
      } catch (err) {
        this.$log.error(err);
        await this.$router.push({ name: 'junkyard' });
      }
    },
  },
};

</script>
