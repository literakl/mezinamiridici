<template>
  <div class="cookies-box-wrap" v-if="!preferencesChosen">
    <div class="cookies-box-inner">
        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took <span><router-link to="o/privacy"> More info</router-link></span></p>
        <!-- Using value -->
        <div class="action-btns">
            <b-button v-b-modal="" class="squared" @click="confirmAll()">Accept All</b-button>
            <b-button @click="$bvModal.show('modal-scrollable')" varient="squared" class="bordered">Settings</b-button>
        </div>
    </div>
    <b-modal id="modal-scrollable" scrollable>
      <template #modal-header="{ close }" class="mainheader">
        <!-- Emulate built in modal header close button action -->
        <div class="title-tag">
          <img src="/images/icons/logo-black.png" :alt="$t('app.logo-alt')"  class="brand">
          <h2>{{ $t('app.name') }}</h2>
        </div>
        <b-button size="sm" @click="close()" class="closebtn">
          <BIconXCircle scale="1.5"></BIconXCircle>
        </b-button>
      </template>

      <template>
        <div class="content-inside">
          <h5>We value your privacy</h5>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took</p>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took <router-link to="o/privacy">More information</router-link></p>
          <button class="green text-white mb-4 mt-2" @click="confirmAll()">Allow All</button>
          <h5>Manage Consent Preference</h5>
          <div class="inner-header my-3">
            <h6>Statistical</h6>
            <b-form-checkbox switch size="lg" v-model="statistical"></b-form-checkbox>
          </div>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took</p>
          <div class="inner-header my-3">
            <h6>Marketing</h6>
            <b-form-checkbox switch size="lg" v-model="marketing"></b-form-checkbox>
          </div>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took</p>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took</p>
          <div class="inner-header my-3">
            <h6>Strictly Necessary Cookies</h6>
            <b class="active">Always Active</b>
          </div>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took</p>
        </div>
      </template>

      <template #modal-footer="">
        <!-- Emulate built in modal footer Confirm button actions -->
        <div class="action-btns">
          <b-button size="lg" variant="squared" class="squared text-white" @click="savePreferences()">
            CONFIRM MY CHOICES
          </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { BButton, BIconXCircle, BFormCheckbox } from 'bootstrap-vue';

export default {
  name: 'cookiesbox',
  components: {
    BButton,
    BIconXCircle,
    BFormCheckbox,
  },
  data() {
    return {
      statistical: false,
      marketing: false,
      preferencesChosen: false,
    };
  },
  methods: {
    confirmAll() {
      this.statistical = true;
      this.marketing = true;
      this.savePreferences();
    },
    savePreferences() {
      const confirmDate = new Date();
      const options = { statistical: this.statistical, marketing: this.marketing, confirmDate };

      localStorage.setItem('cookieSettings', JSON.stringify(options));

      this.emitEvent(options);
      this.preferencesChosen = true;
    },
    emitEvent(options) {
      this.$emit('cookiePreferenceChange', options);
    },
    loadCookiePreferences() {
      let options;
      try {
        options = JSON.parse(localStorage.getItem('cookieSettings'));

        if (!options || !options.confirmDate) {
          this.resetCookiePreferences();
          return;
        }
        this.statistical = options.statistical;
        this.marketing = options.marketing;
        this.preferencesChosen = true;
        this.emitEvent(options);
      } catch (err) {
        this.resetCookiePreferences();
      }
    },
    resetCookiePreferences() {
      this.statistical = false;
      this.marketing = false;
      this.preferencesChosen = false;

      const options = { statistical: false, marketing: false, confirmDate: null };
      localStorage.setItem('cookieSettings', JSON.stringify(options));

      this.emitEvent(options);
    },
  },
  mounted() {
    this.loadCookiePreferences();
  },
};
</script>

<style scoped>
.title-tag{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.title-tag h2 {
    color: var(--dislike-status-hover);
}
.title-tag img{
    width: 50px;
}
.cookies-box-wrap::after{
    content: '';
    background-image: url(/images/icons/cookies.svg);
    background-size: cover;
    width: 30%;
    height: 30%;
    display: block;
    background-position: 0 0;
    position: absolute;
    overflow: hidden;
    margin: 0 auto;
    left: 0;
    top: -64px;
    right: 0;
    opacity: 0.03;
    z-index: -5;
}
.cookies-box-inner{
    display: flex;
    justify-content: space-evenly;
    flex-direction: column;
    z-index: 1;
}
.cookies-box-inner p{
    font-size: 12px;
    text-align: left;
}
.cookies-box-inner p span a{
    cursor: pointer;
    color: var(--link-blue) !important;
    text-decoration: underline;
    display: inline-block;
}
.content-inside p a{
    font-size: 14px;
    cursor: pointer;
    color: var(--link-blue) !important;
    text-decoration: underline;
    display: inline-block;
}
.active{
    color: var(--link-blue)!important;
    font-size: 14px;
}
.cookies-box-wrap{
    max-width: 220px;
    padding: 20px 15px;
    position: fixed;
    right: 25px;
    bottom: 0;
    background: #fff;
    width: 100%;
    text-align: center;
    -webkit-box-shadow: #c1c1c1 1px 1px 10px;
    box-shadow: #c1c1c1 1px 1px 10px;
    font-weight: 400;
    border-radius: 6px 6px 0 0;
}
.action-btns{
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}
.action-btns button{
    font-size: 12px;
    background: var(--no-problem-status);
    border: 0;
    border-radius: 4px;
}
.action-btns button:hover{
    background: var(--no-problem-status-hover);
}
.action-btns button.bordered{
    border: 1px solid var(--theme-primary);
    background: transparent;
    color: var(--text-color);
}
.green{
    font-size: 14px;
    background: var(--no-problem-status);
    border: 0;
    border-radius: 4px;
    padding:10px 28px;
}
.green:hover{
    background: var(--no-problem-status-hover);
}
.closebtn{
    background: transparent;
    border: 0;
}
.closebtn:hover{
    background: transparent;
}
.inner-header{
    display: flex;
    justify-content: space-between;
    align-items: center
}
.inner-header h6{
    margin: 0;
    padding: 0;
}
.inner-header .custom-control{
    padding: 0;
    margin: 0;
}
.custom-control-input:checked ~ .custom-control-label::before{
    color: #fff;
    border-color: var(--theme-primary);
    background-color: var(--dislike-status-hover);
}

.custom-switch.b-custom-control-lg .custom-control-label::after, .input-group-lg .custom-switch .custom-control-label::after {
    top: calc( 0.3125rem + 2px );
    left: calc( -2.1125rem + 2px );
    width: calc( 1.6rem - 4px );
    height: calc( 1.65rem - 4px );
    border-radius: 999px;
    background-size: 50% 50%;
}

.custom-switch.b-custom-control-lg .custom-control-label::before, .input-group-lg .custom-switch .custom-control-label::before {
    top: 0.3125rem;
    height: 1.65rem;
    left: -2.8125rem;
    width: 3.1875rem;
    border-radius: 999px;
}

.custom-switch.b-custom-control-lg .custom-control-label::after{
    left: calc( -2.8125rem + 2px );
}
.custom-switch.b-custom-control-lg .custom-control-input:checked ~ .custom-control-label::after{
    left: calc( -2.1125rem + 2px );
}
</style>
