/* eslint-disable no-console */

import { register } from 'register-service-worker';
import Vue from 'vue';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    registrationOptions: { scope: './' },
    ready() {
      Vue.$log.debug('Service worker is ready to serve.');
    },
    registered() {
      Vue.$log.debug('Service worker has been registered.');
    },
    cached() {
      Vue.$log.debug('Content has been cached for offline use.');
    },
    updatefound() {
      Vue.$log.info('New version is downloading.');
    },
    updated(registration) {
      Vue.$log.info('New version is available; please refresh.');
      document.dispatchEvent(
        new CustomEvent('swUpdated', { detail: registration })
      )
    },
    offline() {
      Vue.$log.debug('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      Vue.$log.error('Error during service worker registration:', error);
    },
  });
}
