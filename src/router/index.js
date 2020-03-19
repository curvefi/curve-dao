import Vue from 'vue'
import VueRouter from 'vue-router'
import Swap from '../components/Swap.vue'
import Deposit from '../components/Deposit.vue'
import Withdraw from '../components/Withdraw.vue'
import WithdrawOld from '../components/WithdrawOld.vue'
import Stats from '../components/Stats.vue'
import FAQ from '../views/FAQ.vue'
import Donate from '../views/Donate.vue'
import Profit from '../components/Profit.vue'
import init from '../init'
import { getters, contract as currentContract , setCurrencies, changeContract} from '../contract'

Vue.use(VueRouter)

let routes = [
  {
    path: '/',
    name: 'Index',
    component: Swap
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: Deposit
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: Withdraw
  },
  {
    path: '/withdraw_old',
    name: 'WithdrawOld',
    component: WithdrawOld
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ
  },
  {
    path: '/donate',
    name: 'Donate',
    component: Donate
  },
  {
    path: '/profit',
    name: 'Profit',
    component: Profit
  },
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  let subdomain = window.location.hostname.split('.')[0]
  if(subdomain == 'y') subdomain = 'iearn'
  if(!['compound', 'usdt', 'iearn', 'busd' , 'y'].includes(subdomain)) subdomain = 'compound'

  if(currentContract.currentContract != subdomain && !['Stats', 'FAQ', 'Donate'].includes(to.name)) {
    changeContract(subdomain)
    currentContract.currentContract = subdomain
    next();
  }
  else if(!['Stats', 'FAQ', 'Donate'].includes(to.name)) {
    next();
    if(!currentContract.initializedContracts) {
      await init();
    }
  }
  else next();
})

router.afterEach(async (to, from, next) => {

})

export default router
