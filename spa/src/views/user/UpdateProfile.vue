<template>
  <div class="mt-5 border rounded update-profile">
    <div class="head-area">
      <h2>{{ $t('edit-profile.heading') }}</h2>
      <p>{{ $t('edit-profile.body') }}</p>
    </div>
    <ContentLoading v-if="!userProfile && !error" type="profile" />
    <ValidationObserver ref="form" v-slot="{ passes, invalid }" v-if="userProfile">
      <b-form @submit.prevent="passes(submitForm)" v-if="success === false || success === null">
        <ProfileForm :formData="profileForm" @update="updateProfileForm"/>
        <div v-if="error" class="text-danger">
          {{ error }}
        </div>
        <div class="col-sm-12 col-md-4 m-auto">
          <Button
            class="w-100 green"
            :disabled="invalid"
            :value="$t('edit-profile.save-button')"
            @clicked="submitForm()"/>
        </div>
      </b-form>
    </ValidationObserver>

    <div id="sign-up-form-success" v-if="success === true">
      <p>{{ $t('sign-up.success-message') }}</p>
    </div>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import ContentLoading from '@/components/atoms/ContentLoading.vue';
import ProfileForm from '@/components/molecules/ProfileForm.vue';
import Button from '@/components/atoms/Button.vue';
import i18n from '@/i18n';
import { BForm } from 'bootstrap-vue';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

function setVehicles(vehicles) {
  if (this.profileForm.bike) vehicles.push('bike');
  if (this.profileForm.car) vehicles.push('car');
  if (this.profileForm.bus) vehicles.push('bus');
  if (this.profileForm.van) vehicles.push('van');
  if (this.profileForm.truck) vehicles.push('truck');
  if (this.profileForm.tramway) vehicles.push('tramway');
}

function convertErrors(jsonErrors) {
  const veeErrors = {};
  jsonErrors.errors.forEach((error) => {
    if (error.field) {
      veeErrors[error.field] = [];
      veeErrors[error.field].push(this.$t(error.messageKey));
    } else {
      this.error = this.$t(error.messageKey);
    }
  });
  return veeErrors;
}

export default {
  name: 'UpdateProfile',
  components: {
    ContentLoading,
    ProfileForm,
    Button,
    BForm,
  },
  data: () => ({
    userProfile: null,
    error: null,
    success: null,
    profileForm: {
      drivingSince: null,
      bike: false,
      car: false,
      bus: false,
      van: false,
      truck: false,
      tramway: false,
      sex: null,
      bornInYear: null,
      region: '',
      education: '',
      share: 'public',
      urls: ['', '', ''],
    },
  }),
  created() {
    this.getProfile(this.$store.getters.USER_ID);
  },
  methods: {
    async getProfile(id) {
      try {
        const response = await this.$store.dispatch('GET_USER_PROFILE_BY_ID', { id });
        this.userProfile = response.data.data;
        if (this.userProfile.driving) {
          if (this.userProfile.driving.since) {
            this.profileForm.drivingSince = new Date(this.userProfile.driving.since, 0, 1);
          }
          if (this.userProfile.driving.vehicles) {
            this.profileForm.bike = this.userProfile.driving.vehicles.includes('bike');
            this.profileForm.car = this.userProfile.driving.vehicles.includes('car');
            this.profileForm.bus = this.userProfile.driving.vehicles.includes('bus');
            this.profileForm.van = this.userProfile.driving.vehicles.includes('van');
            this.profileForm.truck = this.userProfile.driving.vehicles.includes('truck');
            this.profileForm.tramway = this.userProfile.driving.vehicles.includes('tramway');
          }
        }

        this.profileForm.sex = this.userProfile.bio.sex;
        if (this.userProfile.bio.born) {
          this.profileForm.bornInYear = new Date(this.userProfile.bio.born, 0, 1);
        }
        this.profileForm.region = this.userProfile.bio.region;
        this.profileForm.education = this.userProfile.bio.edu;
        this.profileForm.share = this.userProfile.prefs.public ? 'public' : 'private';

        this.profileForm.urls = this.userProfile.bio.urls;
        if (this.profileForm.urls) {
          this.profileForm.urls = this.profileForm.urls.map(x => encodeURI(x));
        }
        if (!this.profileForm.urls || this.profileForm.urls.length === 0) {
          this.profileForm.urls = ['', '', ''];
        } else if (this.profileForm.urls.length === 1) {
          this.profileForm.urls.push('', '');
        } else if (this.profileForm.urls.length === 2) {
          this.profileForm.urls.push('');
        }
      } catch (err) {
        this.$log.error(err);
        if (err.response && err.response.data && err.response.data.errors) {
          this.error = this.$t(err.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      }
    },
    async submitForm() {
      try {
        const vehicles = [];
        setVehicles.call(this, vehicles);
        await this.$store.dispatch('UPDATE_USER_PROFILE', {
          jwt: this.$store.getters.USER_TOKEN,
          userId: this.userProfile._id,
          drivingSince: (this.profileForm.drivingSince) ? new Date(this.profileForm.drivingSince).getFullYear() : null,
          vehicle: vehicles,
          sex: this.profileForm.sex,
          bornInYear: (this.profileForm.bornInYear) ? new Date(this.profileForm.bornInYear).getFullYear() : null,
          region: this.profileForm.region,
          education: this.profileForm.education,
          publicProfile: this.profileForm.share,
          urls: this.profileForm.urls,
        });
        await this.$router.push({ name: 'user-profile', params: { id: this.userProfile._id } });
      } catch (error) {
        this.$log.error(error);
        this.success = false;
        if (error.response) {
          const veeErrors = convertErrors.call(this, error.response.data);
          this.$refs.form.setErrors(veeErrors);
        } else {
          this.error = this.$t('sign-up.something-went-wrong');
        }
      }
    },
    updateProfileForm(obj) {
      // eslint-disable-next-line
      for (const property in this.profileForm) {
      // eslint-disable-next-line
        if (obj.hasOwnProperty(property)) {
          this.profileForm[property] = obj[property];
        }
      }
    },
  },
};
</script>
<style scoped>
.update-profile{
  max-width:700px;
  margin: 0 auto;
  padding: 25px 35px;
  width: 100%;
  border-radius: 4px;
}
.update-profile .centerbox{ padding: 0}
.head-area{
  padding-bottom:10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.head-area button{
  background: transparent;
  padding: 10px;
  border: 0;
  width: 100px;
  font-size: 14px;
}
.head-area h2{
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  width:100%;
  padding: 0 0 15px 0;
}
.green{
  background: var(--color-green);
  border: 0; color: #fff;
}
@media (max-width: 700px) {
  .update-profile{
    margin-right:35px;
    margin-left:35px;
    width:auto;
    padding: 25px 20px
  }
}

</style>
