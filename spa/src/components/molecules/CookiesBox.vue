<template>
  <div class="cookies-box-wrap" v-if="showPrefs">
    <div class="cookies-box-inner">
      <p>
        <strong>Povolíte nám shromažďovat cookies?</strong>
        <b-button size="sm" @click="close" class="closebtn">
          <BIconXCircle scale="1.5"></BIconXCircle>
        </b-button>
      </p>
      <p>
        Hrajeme fér. Potřebujeme vědět, kdo naše stránky navštěvuje, ať už z pohledu
        analýzy návštěvnosti či cílení reklamy. Váš souhlas nám pomůže. Děkujeme.<br>
        <router-link to="/o/soukromi">Zpracování osobních údajů</router-link>,
        <router-link to="/o/podminky">Podmínky užívání</router-link>
      <div class="action-btns">
        <b-button v-b-modal="" class="squared" @click="confirmAll()">Jasně, všechny</b-button>
        <b-button v-b-modal="" class="bordered" @click="denyAll()">Jen nutné</b-button>
        <b-button @click="$bvModal.show('modal-scrollable')" variant="squared" class="bordered">Vytunit</b-button>
      </div>
    </div>
    <b-modal id="modal-scrollable" scrollable>
      <template #modal-header="{ close }" class="mainheader">
        <!-- Emulate built in modal header close button action -->
        <div class="title-tag">
          <img src="/images/icons/logo-black.png" :alt="$t('app.logo-alt')" class="brand">
          <h2>{{ $t('app.name') }}</h2>
        </div>
        <b-button size="sm" @click="close()" class="closebtn">
          <BIconXCircle scale="1.5"></BIconXCircle>
        </b-button>
      </template>

      <template>
        <div class="content-inside">
          <h5>Mezi námi řidiči,</h5>
          <p>
            nechceme potíže s úřady, takže pojďme na papírování. Technologie cookies slouží pro
            ukládání dat do prohlížeče. Zde si můžete vybrat, kterou kategorii cookies povolíte.
            Nám pomůže, když povolíte všechny.
          </p>

          <button class="green text-white mb-4 mt-2" @click="confirmAll()">Povolit vše</button>

          <p>
            Vše je podrobně vysvětleno v dokumentu
            <router-link to="/o/soukromi">Zásady zpracování osobních údajů</router-link>.
            Také byste měli znát
            <router-link to="/o/podminky">Podmínky užívání</router-link>.
          </p>

          <h5>Správa cookies</h5>

          <div class="inner-header my-3">
            <h6>Funkční cookies</h6>
            <b-form-checkbox switch size="lg" v-model="personalization"></b-form-checkbox>
          </div>
          <p>
            Používají se pro ukládání nastavení. Web bude fungovat, ale třeba zapomene,
            co jste nastavili nebo viděli naposledy.
          </p>

          <div class="inner-header my-3">
            <h6>Analytické cookies</h6>
            <b-form-checkbox switch size="lg" v-model="analytics"></b-form-checkbox>
          </div>
          <p>
            Používáme Google Analytics pro měření návštěvnosti. Bez cookies nepoznáme,
            zda jste tu podruhé nebo je to někdo jiný.
          </p>

          <div class="inner-header my-3">
            <h6>Reklamní cookies</h6>
            <b-form-checkbox switch size="lg" v-model="ad"></b-form-checkbox>
          </div>
          <p>
            Pokud inzerenti nebudou vědět, kolik lidí jejich reklamu vidělo, jak často
            a zda na ni kliknuli, nebudou reklamu kupovat. Důsledky pro web si domyslete sami.
          </p>

          <div class="inner-header my-3">
            <h6>Nezbytné cookies</h6>
            <b class="active">Vždy aktivní</b>
          </div>
          <p>
            Tohle jsou cookies používané například k zapamatování přihlášení.
          </p>
        </div>
      </template>

      <template #modal-footer="">
        <!-- Emulate built in modal footer Confirm button actions -->
        <div class="action-btns">
          <b-button size="lg" variant="squared" class="squared text-white" @click="savePreferences()">
            Uložit
          </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { BButton, BIconXCircle, BFormCheckbox } from 'bootstrap-vue';

export default {
  name: 'CookiesBox',
  components: {
    BButton,
    BIconXCircle,
    BFormCheckbox,
  },
  data() {
    return {
      ad: false,
      analytics: false,
      personalization: false,
    };
  },
  computed: {
    showPrefs() {
      return this.$store.getters.SHOW_COOKIES_DIALOG;
    }
  },
  methods: {
    confirmAll() {
      this.ad = true;
      this.analytics = true;
      this.personalization = true;
      this.savePreferences();
    },
    denyAll() {
      this.ad = false;
      this.analytics = false;
      this.personalization = false;
      this.savePreferences();
    },
    close() {
      this.$store.commit('SHOW_COOKIES_DIALOG', false);
    },
    savePreferences() {
      const options = { ad: this.ad, analytics: this.analytics, personalization: this.personalization, confirmed: new Date() };
      this.$store.dispatch('SAVE_COOKIE_PREFERENCES', { options, component: this });
      this.$store.commit('SHOW_COOKIES_DIALOG', false);
    },
  },
  async mounted() {
    const options = await this.$store.dispatch('LOAD_COOKIE_PREFERENCES');
    if (options) {
      this.ad = options.ad;
      this.analytics = options.analytics;
      this.personalization = options.personalization;
      this.$store.commit('SHOW_COOKIES_DIALOG', false);
    } else {
      this.$store.commit('SHOW_COOKIES_DIALOG', true);
    }
  },
};
</script>

<style scoped>
.title-tag {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.title-tag h2 {
    color: var(--dislike-status-hover);
}
.title-tag img {
    width: 50px;
}
.cookies-box-wrap::after {
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
.cookies-box-inner {
    display: flex;
    justify-content: space-evenly;
    flex-direction: column;
    z-index: 1;
}
.cookies-box-inner p {
    font-size: 12px;
    text-align: justify;
}
.cookies-box-inner p span a {
    cursor: pointer;
    color: var(--link-blue) !important;
    text-decoration: underline;
    display: inline-block;
}
.content-inside p {
  text-align: justify;
}
.content-inside p a {
    font-size: 14px;
    cursor: pointer;
    color: var(--link-blue) !important;
    text-decoration: underline;
    display: inline-block;
}
.active {
    color: var(--link-blue)!important;
    font-size: 14px;
}
.cookies-box-wrap {
    max-width: 350px;
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
.action-btns {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}
.action-btns button {
    font-size: 12px;
    background: var(--no-problem-status);
    border: 0;
    border-radius: 4px;
}
.action-btns button:hover {
    background: var(--no-problem-status-hover);
}
.action-btns button.bordered {
    border: 1px solid var(--theme-primary);
    background: transparent;
    color: var(--text-color);
}
.green {
    font-size: 14px;
    background: var(--no-problem-status);
    border: 0;
    border-radius: 4px;
    padding:10px 28px;
}
.green:hover {
    background: var(--no-problem-status-hover);
}
.closebtn {
    background: transparent;
    border: 0;
}
.closebtn:hover {
    background: transparent;
}
.inner-header {
    display: flex;
    justify-content: space-between;
    align-items: center
}
.inner-header h6 {
    margin: 0;
    padding: 0;
}
.inner-header .custom-control{
    padding: 0;
    margin: 0;
}
.custom-control-input:checked ~ .custom-control-label::before {
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
.custom-switch.b-custom-control-lg .custom-control-label::after {
    left: calc( -2.8125rem + 2px );
}
.custom-switch.b-custom-control-lg .custom-control-input:checked ~ .custom-control-label::after {
    left: calc( -2.1125rem + 2px );
}
</style>
