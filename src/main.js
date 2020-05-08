import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueMeta from 'vue-meta'

import * as Sentry from '@sentry/browser';
import { CaptureConsole, Vue as VueIntegration } from '@sentry/integrations';

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})

window.domain = ''
if(window.location.href.includes('localhost')) window.domain = 'https://curve.fi'


import '../public/tvision.css'

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
