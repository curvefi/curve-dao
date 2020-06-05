import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueMeta from 'vue-meta'

import * as Sentry from '@sentry/browser';
import { CaptureConsole, Vue as VueIntegration } from '@sentry/integrations';

import * as subscriptionStore from './components/common/subscriptionStore'
import * as helpers from './utils/helpers'

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})

window.domain = ''
if(window.location.href.includes('localhost')) window.domain = 'https://curve.fi'


import '../public/tvision.css'
import './registerServiceWorker'


navigator.serviceWorker.ready
.then(function(registration) {
  // Use the PushManager to get the user's subscription to the push service.
  return registration.pushManager.getSubscription()
  .then(async function(subscription) {
    // If a subscription was found, return it.
    if (subscription) {
      return subscription;
    }

    // Get the server's public key
    const response = await fetch('https://pushservice.curve.fi/vapidPublicKey');
    const vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    const convertedVapidKey = helpers.urlBase64ToUint8Array(vapidPublicKey);

    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  });
}).then(function(subscription) {
  subscriptionStore.setSubscription(subscription)
  console.log(subscriptionStore.subscription)
  // Send the subscription details to the server using the Fetch API.
  fetch('https://pushservice.curve.fi/register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      subscription: subscription
    }),
  });


});


Vue.config.productionTip = false

//adding Sentry as soon as possible
process.env.NODE_ENV == 'production' && Sentry.init({ 
  dsn: 'https://5494f535e0244513a301f2912f5d899f@sentry.io/4169463',
  integrations: [
    new CaptureConsole({
      levels: ['warn', 'error', 'debug', 'assert']
    }),
    new VueIntegration({Vue, attachProps: true})
  ],
});


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
