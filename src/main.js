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
if(window.location.href.includes('localhost') || !window.location.href.includes('curve.fi')) window.domain = 'https://curve.fi'

import '../public/tvisionbase.css'
import '../public/tvision.css'
import './registerServiceWorker'

subscriptionStore.init();

Vue.config.productionTip = false

//adding Sentry as soon as possible

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
