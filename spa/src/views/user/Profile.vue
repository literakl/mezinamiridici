<template>
  <div class="pt-3 m-auto pb-5">
    <ContentLoading v-if="!userProfile" type="profile" />
    <div v-if="userProfile" class="profile-wrap">
      <div class="prof-header-wrap mr-3">
        <div class="prof-header">
           <b-avatar size="3rem"></b-avatar>
          <div class="nickname-row">
           <h2>{{ userProfile.bio.nickname }}</h2>
           <span class="edit-btn"><BIconPencilSquare scale="1.5"></BIconPencilSquare></span>
           </div>
        </div>
        <div class="user-details">
          <div v-if="userProfile.prefs.public && userProfile.bio.region" class="name-regions">
            <BIconGeoAlt scale="1"></BIconGeoAlt>
            <span>{{$t(`profile.regions.${userProfile.bio.region}`)}}</span>
          </div>
          <div v-for="(item, inx) in userProfile.bio.urls" :key="inx" class="links">
            <BIconLink/>
            <a :href="item" rel="nofollow">{{item}}</a>
          </div>
        </div>
      </div>
      <b-tabs content-class="my-3" class="no-padding">
        <b-tab :title="$t('profile.tabs.summary')" active>
          <div class="profile-area-top">
            <div class="rank head-block">
              <BIconAward scale="1"></BIconAward>
              <span class="label">{{ $t('profile.rank-label') }}:</span> <span> {{ $t(`profile.rank.${userProfile.honors.rank}`) }}</span>
            </div>
            <div class="bio-date head-block">
              <BIconPersonCircle scale="1"></BIconPersonCircle>
              <span class="label">{{ $t('profile.member-since-label') }}:</span> <span> <Date :date="userProfile.bio.registered" format="dynamicDate" /></span>
            </div>
          </div>
            <dl v-if="showProfile">
              <template v-if="userProfile.driving">
                <div class="more-details">
                  <div v-if="userProfile.driving.since" class="head-block">
                    <BIconJoystick scale="1"></BIconJoystick>
                    <span class="label">{{ $t('profile.driving-since-label') }}:</span> <span> {{userProfile.driving.since}}</span>
                  </div>

                  <div v-if="vehicles" class="head-block">
                    <BIconTruck scale="1"></BIconTruck>
                    <span class="label">{{ $t('profile.vehicles-label') }}:</span> <span> {{vehicles}}</span>
                  </div>
                </div>
              </template>
                <div class="more-details">
                  <div v-if="userProfile.bio.sex" class="head-block">
                    <BIconPersonFill scale="1"></BIconPersonFill>
                    <span class="label">{{ $t('profile.sex') }}:</span> <span> {{ $t('profile.sexes.' + userProfile.bio.sex) }}</span>
                  </div>
                  <div v-if="userProfile.bio.born" class="head-block">
                    <BIconPersonCheck scale="1"></BIconPersonCheck>
                    <span class="label">{{ $t('profile.born') }}:</span> <span> {{userProfile.bio.born}}</span>
                  </div>
                  <div v-if="userProfile.bio.region" class="head-block">
                    <BIconGeoAlt font-scale="1"></BIconGeoAlt>
                    <span class="label">{{ $t('profile.region') }}:</span> <span> {{ $t('profile.regions.' + userProfile.bio.region) }}</span>
                  </div>
                  <div v-if="userProfile.bio.edu" class="head-block">
                    <BIconPen scale="1"></BIconPen>
                    <span class="label">{{ $t('profile.education') }}:</span> <span> {{ $t('profile.educations.' + userProfile.bio.edu) }}</span>
                  </div>
                </div>
            </dl>
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
import { BTabs, BTab, BAvatar, BIconGeoAlt, BIconLink, BIconAward, BIconPersonCircle, BIconJoystick, BIconTruck, BIconPersonFill, BIconPersonCheck, BIconPen, BIconPencilSquare } from 'bootstrap-vue';

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
    BIconAward,
    BIconPersonCircle,
    BIconJoystick,
    BIconTruck,
    BIconPersonFill,
    BIconPersonCheck,
    BIconPen,
    BIconPencilSquare,
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
<style scoped>
.prof-header-wrap{
  max-width: 25%;
  width: 100%;
}
.profile-wrap{
  display: flex;
  max-width: 1235px;
  margin: 0 auto;
}
.prof-header{
  display: flex;
  align-items: center;
  padding: 0 0 8px 0;
  border-bottom: 2px solid #f3f3f3;
  border-radius: 5px 5px 0 0;
  justify-content: flex-start;
  position: relative;
}
.prof-header div{
  display: flex;
  justify-content:space-between;
  align-items: center;
  width: 100%;
}
.edit-btn svg{
  font-size: 12px;
  display: block;
}
.edit-btn svg:hover{
  cursor: pointer;
  color: #007bff;
}
.prof-header h2{
  font-size: 16px;
  margin: 5px 0 0 10px;
  padding: 0;
}
.user-details {
  width: 100%;
  margin-top: 20px;
}
.user-details svg{
  color: #AEB3B7;
}
.profile-area-top, .more-details{
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 100%;
}
.head-block, .more-details div{
  border:1px solid #f1f1f1;
  background: #fff;
  box-shadow: #c1c1c1 1px 1px 10px;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 400;
  padding: 15px 20px;
}
.head-block span{
  color: var(--text-color-light);
  padding: 5px;
}
.head-block span.label{
  min-width: 150px;
  /* color: var(--link-color); */
  font-weight: 300;
}
.name-regions{
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f3f3f3;
  padding-bottom: 9px;
  align-items: center;
  color: var(--link-color);
}
.name-regions svg{
  width: 40px;
}
.links{
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
  border-bottom: 1px solid #f3f3f3;
  padding-bottom: 9px;
  align-items: center;
  color: var(--link-color);
}
.links svg{
  width: 40px;
}

@media (min-width: 1920px) {
  .head-block span.label{
    min-width: 200px
  }
  .prof-header h2{
    font-size:18px;
  }

}
@media (max-width: 1235px) {
 .profile-wrap {
     padding: 0 15px;
   }
}
@media (max-width: 992px) {
  .profile-wrap {
    flex-direction: column;
  }
  .prof-header h2{
    font-size: 16px;
  }
  .prof-header-wrap{
    max-width: 100%;
  }
  .user-details{
    margin-top: 0;
    display: flex;
    margin-bottom: 20px;
    padding: 10px 0;
  }
  .name-regions, .links{
    margin-top: 0;
    margin-bottom: 0;
    padding-bottom: 0;
    border: 0;
  }
}
@media (max-width: 767px) {
  .user-details{ flex-wrap: wrap;}
  .profile-wrap {
    padding: 0 15px;
  }
}
@media (max-width: 575px) {
  .head-block{
        padding: 25px 0;
  }
  .head-block span{ padding: 0;}
  .head-block, .more-details div{
          height: unset;
            align-items: center;
            flex-direction: column
  }
  .head-block svg{
    display: block;
    margin-bottom: 20px;
}
.head-block span.label {
    text-align: center;
}
}

</style>
