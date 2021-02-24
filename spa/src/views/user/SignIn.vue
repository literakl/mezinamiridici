<template>
  <ValidationObserver ref="form" v-slot="{ passes, invalid }">
    <b-form @submit.prevent="passes(signIn)">
      <div class="mt-5 border rounded centerbox">
        <b-row class="w-85 m-auto pb-1">
          <b-col>
            <div class="head-area">
              <h2>{{ $t('sign-in.sign-in-heading') }}</h2>
              <div>{{ message }}</div>
            </div>
            <div class="field-area">
            <TextInput
              v-model="email"
              rules="required|email"
              class="w-100"
              :label="$t('profile.email')"
              :placeholder="$t('sign-in.email-placeholder')"
              name="email"
              type="email"
            />
            </div>
            <div class="field-area">
            <TextInput
              v-model="password"
              rules="required"
              class="w-100"
              :label="$t('profile.password')"
              :placeholder="$t('sign-in.password-placeholder')"
              name="password"
              type="password"
            />
            </div>

            <div class="w-100 d-flex flex-row-reverse mb-3 forgot-link">
              <router-link :to="{ name: 'forgotten' }">
                {{ $t('sign-in.forgot-password-link')}}
              </router-link>
            </div>

            <div v-if="error" class="text-danger">
              <strong>
                {{ error }}
              </strong>
            </div>
          </b-col>
        </b-row>
        <b-row class="w-85 m-auto pb-2">
          <b-col>
            <Button
              class="w-100 btn blue"
              :disabled="invalid"
              :value="$t('sign-in.sign-in-button')"
              @clicked="signIn"/>
          </b-col>
          <b-col>
            <Button
              class="btn btn-block green"
              :value="$t('sign-in.sign-up-button')"
              id="signin__sign-up-button"
              @clicked="redirectToSignUp"/>
          </b-col>
        </b-row>
        <b-row class="w-85 m-auto pb-2">
          <b-col>
            <div class="d-flex justify-content-center text-uppercase">{{ $t('sign-in.or') }}</div>
          </b-col>
        </b-row>
        <b-row class="w-85 m-auto pb-2">
          <b-col>
            <Button
              class="w-100 btn btn-block btn-facebook"
              :value="$t('sign-in.sign-in-facebook')"
              @clicked="auth('facebook')"/>

            <Button
              class="w-100 btn btn-block btn-twitter"
              :value="$t('sign-in.sign-in-twitter')"
              @clicked="auth('twitter')"/>

            <Button
              class="w-100 btn btn-block btn-google-plus"
              :value="$t('sign-in.sign-in-google')"
              @clicked="auth('google')"/>
          </b-col>
        </b-row>
      </div>
    </b-form>
  </ValidationObserver>
</template>

<script>
import { configure } from 'vee-validate';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import { BForm, BRow, BCol } from 'bootstrap-vue';
import i18n from '../../i18n';

configure({
  defaultMessage: (field, values) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    values._field_ = i18n.t(`profile.${field}`);
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

export default {
  name: 'signin',
  components: {
    BForm,
    BRow,
    BCol,
    Button,
    TextInput,
  },
  props: {
    message: String,
    redirectUrl: String,
  },
  data: () => ({
    page: 0,
    email: null,
    password: null,
    signingIn: false,
    error: null,
  }),
  methods: {
    redirectToSignUp() {
      this.$router.push({ name: 'sign-up', params: { presetEmail: this.email, presetPassword: this.password } });
    },
    async signIn() {
      this.signingIn = true;
      try {
        await this.$store.dispatch('SIGN_USER_IN', {
          email: this.email,
          password: this.password,
        });
        await this.$router.push(this.redirectUrl || '/');
      } catch (error) {
        this.$log.error(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('sign-in.auth-error');
        }
        this.signingIn = false;
      }
    },
    async auth(provider) {
      if (this.$auth.isAuthenticated()) {
        this.$auth.logout();
      }
      const response = await this.$auth.authenticate(provider);
      if (response.data.socialId) {
        this.$auth.logout();
        const params = { presetEmail: response.data.email, presetNickname: response.data.name, socialId: response.data.socialId };
        await this.$router.push({ name: 'sign-up', params });
      } else {
        await this.$store.dispatch('SET_SOCIAL', response.data);
        await this.$router.push('/');
      }
    },
  },
};
</script>
<style>
.centerbox{
  max-width: 700px;
  width: 100%;
  margin: 0 auto 20px;
  padding: 25px 20px;
  border-radius: 4px;
}
.head-area{
  padding-bottom:0px;
  margin-bottom:10px;
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
.field-area{
  margin-bottom: 10px;
}
.forgot-link{
  font-size: 14px;
}
.btn {
   font-weight: 500;
    font-size: 14px;
  border-radius: 2px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, .26);
}
.btn-facebook {
  color: #fff;
  background-color: #3b5998;
  border: 0px solid #335190;
}
.btn-facebook:hover,
.btn-facebook:focus {
  color: #fff;
  background-color: #294786;
  border: 0;
}
.btn-twitter {
  color: #fff;
  background-color: #00aced;
  border: 0px solid #009fdb;
}
.btn-twitter:hover,
.btn-twitter:focus {
  color: #fff;
  background-color: #0090c7;
}

.btn-google-plus {
  color: #fff;
  background-color: #dd4b39;
  border: 1px solid #d54331;
  border: 0;
}
.btn-google-plus:hover,
.btn-google-plus:focus {
  color: #fff;
  background-color: #cb3927;
  border: 0;
}
.blue{
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  font-weight: 400;
  font-size: 14px;
}
.blue:hover{
  color: #fff;
  background-color: #0069d9;
  border-color: #0062cc;
}

.green{
  background: var(--color-green);
  border: 0;
  color: #fff;
  font-weight: 400;
  font-size: 14px;
}
.green:hover{
  color: #fff;
  background-color: #218838;
  border-color: #1e7e34;
}
@media (max-width: 700px) {
  .centerbox{
    margin:0 35px;
    width:auto;
    padding:25px 5px;
  }
}

</style>
