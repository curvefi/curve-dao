import Vue from 'vue'
import VueRouter from 'vue-router'
const PoolApp = () => import('../components/PoolApp.vue')
const Swap = () => import('../components/Swap.vue')
const Deposit = () => import('../components/Deposit.vue')
const Withdraw = () => import('../components/Withdraw.vue')
const WithdrawOld = () => import('../components/WithdrawOld.vue')
const Stats = () => import('../components/Stats.vue')
const FAQ = () => import('../views/FAQ.vue')
const Donate = () => import('../views/Donate.vue')
const Profit = () => import('../components/Profit.vue')
const ProfitRouter = () => import('../components/ProfitRouter.vue')
const RootApp = () => import('../components/root/RootApp.vue')
const Root = () => import('../components/root/Root.vue')
const CombinedStats = () => import('../components/root/CombinedStats.vue')

import Index from '../components/Index.vue'

import init from '../init'
import { getters, contract as currentContract , setCurrencies, changeContract} from '../contract'

Vue.use(VueRouter)

let routes = [
  {
    path: '/',
    name: 'Root',
    component: RootApp,
    children: [
      {
        name: 'RootIndex',
        path: '',
        component: Root
      },
      {
        name: 'CombinedStats',
        path: 'combinedstats',
        component: CombinedStats,
      },
      {
        name: 'Donate',
        path: 'donate',
        component: Donate,
      }
    ]
  },
  {
    path: '/:pool(compound|usdt|y|iearn|busd)/',
    name: 'Index',
    component: PoolApp,
    children: [
      {
        path: '',
        name: 'Swap',
        component: Swap
      },
      {
        path: 'deposit',
        name: 'Deposit',
        component: Deposit
      },
      {
        path: 'withdraw',
        name: 'Withdraw',
        component: Withdraw
      },
      {
        path: 'withdraw_old',
        name: 'WithdrawOld',
        component: WithdrawOld
      },
      {
        path: 'stats',
        name: 'Stats',
        component: Stats
      },
      {
        path: 'faq',
        name: 'FAQ',
        component: FAQ
      },
      {
        path: 'donate',
        name: 'Donate',
        component: Donate
      },
      {
        path: 'profit',
        name: 'Profit',
        component: ProfitRouter
      },
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

const pools = ['compound','usdt','y','iearn','busd']

router.beforeEach(async (to, from, next) => {
  //if(from.path.includes('profit') && to.path.includes('profit')) return window.location.href = to.path
  if(['RootIndex', 'Donate'].includes(to.name)) return next();
  let subdomain;
  if(pools.includes(to.path.split('/')[1])) subdomain = to.path.split('/')[1]
  else subdomain = window.location.hostname.split('.')[0]
/*  if(window.location.hostname.split('.').length > 1) subdomain = window.location.hostname.split('.')[0]
  else subdomain = to.path.split('/')[1]*/
  if(subdomain == 'y') subdomain = 'iearn'
  if(!['compound', 'usdt', 'iearn', 'busd' , 'y'].includes(subdomain)) subdomain = 'compound'

  if((currentContract.currentContract != subdomain && !['Stats', 'FAQ', 'Donate'].includes(to.name)) || ['Stats', 'FAQ', 'Donate'].includes(from.name)) {
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
  else {
    currentContract.currentContract = subdomain;
    return next();
  }
})

router.afterEach(async (to, from, next) => {

})

export default router
