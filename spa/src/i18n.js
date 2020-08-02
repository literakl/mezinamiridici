import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from 'vee-validate/dist/locale/en.json';
import cs from 'vee-validate/dist/locale/cs.json';
import { localize } from 'vee-validate';

localize({
  cs, en,
});
localize('cs');

Vue.use(VueI18n);

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      locales(key).validation = cs.messages;
      messages[locale] = locales(key);
    }
  });
  return messages;
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'cs',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'cs',
  messages: loadLocaleMessages(),
});
