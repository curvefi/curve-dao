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
    path: '/:pool/',
    name: 'Index',
    component: Swap
  },
  {
    path: '/:pool/deposit',
    name: 'Deposit',
    component: Deposit
  },
  {
    path: '/:pool/withdraw',
    name: 'Withdraw',
    component: Withdraw
  },
  {
    path: '/:pool/withdraw_old',
    name: 'WithdrawOld',
    component: WithdrawOld
  },
  {
    path: '/:pool/stats',
    name: 'Stats',
    component: Stats
  },
  {
    path: '/:pool/faq',
    name: 'FAQ',
    component: FAQ
  },
  {
    path: '/:pool/donate',
    name: 'Donate',
    component: Donate
  },
  {
    path: '/:pool/profit',
    name: 'Profit',
    component: Profit
  },
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

const pools = ['compound','usdt','y','iearn','busd']

router.beforeEach(async (to, from, next) => {
  console.log(to)
  let subdomain;
  if(pools.includes(to.path.split('/')[1])) subdomain = to.path.split('/')[1]
  else subdomain = window.location.hostname.split('.')[0]
  console.log(subdomain, "SUBDOMAIN")
/*  if(window.location.hostname.split('.').length > 1) subdomain = window.location.hostname.split('.')[0]
  else subdomain = to.path.split('/')[1]*/
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
