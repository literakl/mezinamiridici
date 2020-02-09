<template>
    <div>
        <div class="profile">
            <div class="profile__wrapper">
                <div v-if="error">
                  <strong class="profile__errors-heading">
                    {{ error }}
                  </strong>
                </div>

                <dl v-if="userProfile && !error">
                    <dt>{{ $t('profile.nickname') }}</dt>
                    <dl>{{userProfile.bio.nickname}}</dl>

                    <dt v-if="publicProfile">{{ $t('profile.driving-for') }}</dt>
                    <dl v-if="publicProfile">{{drivingSince}}</dl>

                    <dt v-if="publicProfile">{{ $t('profile.vehicle') }}</dt>
                    <dl v-if="publicProfile">{{vehicles}}</dl>

                    <dt v-if="publicProfile">{{ $t('profile.region') }}</dt>
                    <dl v-if="publicProfile">{{userProfile.region}}</dl>

                    <dt v-if="publicProfile">{{ $t('profile.education') }}</dt>
                    <dl v-if="publicProfile">{{userProfile.bio.edu}}</dl>

                    <dt v-if="publicProfile">{{ $t('profile.sex') }}</dt>
                    <dl v-if="publicProfile">{{userProfile.bio.sex}}</dl>
                </dl>

                <p v-if="myProfile && !error">
                  <router-link :to="{ name: 'update-profile'}">Update your profile</router-link>
                  &middot;
                  <router-link :to="{ name: 'update-password'}">Change your password</router-link>
                </p>

                 <content-loader
                  :height="100"
                  :width="400"
                  :speed="2"
                  primaryColor="#949494"
                  secondaryColor="#606060"
                  v-if="!userProfile && !error"
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
    profilePromise: null,
    userProfile: null,
    error: null,
  }),
  computed: {
    myProfile() {
      // todo check anonymous viewer
      return this.id === this.$store.getters.USER_ID;
    },
    publicProfile() {
      return this.myProfile || this.userProfile.prefs.public === true;
    },
    drivingSince() {
      const length = new Date().getFullYear() - parseInt(this.userProfile.driving.since, 10);

      if (length === 1) {
        return '1 year';
      }

      if (length > 1) {
        return `${length} years`;
      }

      return '0 years';
    },
    vehicles() {
      return this.userProfile.driving.vehicles.join(' ');
    },
  },
  created() {
    if (this.myProfile) {
      // todo check case when the method is called before user is fetched
      this.userProfile = this.$store.getters.SIGNED_IN_USER_PROFILE;
      console.log(`my profile: ${this.userProfile}`);
    } else {
      this.profilePromise = this.$store.dispatch('GET_USER_PROFILE_BY_ID', { id: this.id });
      console.log(`promise: ${this.profilePromise}`);
    }
  },
  async mounted() {
    if (!this.userProfile) {
      try {
        const response = await this.profilePromise;
        console.log(response);
        this.userProfile = response.data.data;
      } catch (err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.errors) {
          this.error = this.$t(err.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      }
    }
    return this.userProfile;
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
