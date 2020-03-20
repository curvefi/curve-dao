import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueMeta from 'vue-meta'

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})


import '../public/tvision.css'

Vue.config.productionTip = false

console.log(process.env)


//adding Sentry as soon as possible
/*Sentry.init({ 
  dsn: 'https://5494f535e0244513a301f2912f5d899f@sentry.io/4169463',
  integrations: [
    new Sentry.Integrations.CaptureConsole({
      levels: ['warn', 'error', 'debug', 'assert']
    })
  ],
});
*/


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
