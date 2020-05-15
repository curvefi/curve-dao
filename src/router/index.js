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
const StatsDaily = () => import('../components/root/StatsDaily.vue')
const ChartGraph = () => import('../components/graphs/Chart.vue')
const BasicTrade = () => import('../components/graphs/BasicTrade.vue')
const RootFAQ = () => import('../components/root/RootFAQ.vue')
const Audits = () => import('../views/Audits.vue')
const Contracts = () => import('../views/Contracts.vue')
const CurvePay = () => import('../components/CurvePay.vue')
const Events = () => import('../components/Events.vue')
const VolumePerCoin = () => import('../components/VolumePerCoin.vue')

const ycTokens = () => import('../components/ycTokens/Index.vue')

import Index from '../components/Index.vue'

import init from '../init'
import { getters, contract as currentContract , setCurrencies, changeContract} from '../contract'
import * as common from '../utils/common.js'

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
        path: '/basictrade',
        name: 'BasicTrade',
        component: BasicTrade,
      },
      {
        path: '/exchange/:params(.*)?',
        name: 'Exchange',
        component: ChartGraph,
      },
      {
        path: '/trade/:params(.*)?',
        name: 'Trade',
        component: ChartGraph,
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
      },
      {
        name: 'StatsDaily',
        path: 'dailystats',
        component: StatsDaily,
      },
      {
        name: 'Audits',
        path: 'audits',
        component: Audits,
      },
      {
        name: 'RootFAQ',
        path: '/rootfaq',
        component: RootFAQ,
      },
      {
        name: 'Contracts',
        path: '/contracts',
        component: Contracts,
      },
      {
        path: 'curvepay/:pool?',
        name: 'CurvePay',
        component: CurvePay,
      },
      {
        path: 'events/:params(.*)?',
        name: 'Events',
        component: Events,
      },
      {
        path: 'volumepercoin',
        name: 'VolumePerCoin',
        component: VolumePerCoin,
      },
      {
        path: 'yctokens',
        name: 'ycTokens',
        component: ycTokens,
      }
    ]
  },
  {
    path: '/compound/withdraw_old',
    component: PoolApp,
    children: [
      {
        path: '',
        name: 'WithdrawOld',
        component: WithdrawOld
      },
    ]
  },
  {
    path:'/susd',
    name: 'Index',
    component: PoolApp,
    children: [
      {
        path: '',
        name: 'Withdraw',
        component: Withdraw
      },
      {
        path: '*',
        name: 'Withdraw',
        component: Withdraw
      }
    ]
  },
  {
    path: '/:pool(compound|usdt|y|iearn|busd|susdv2|pax|tbtc|ren)/',
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
        beforeEnter: (to, from, next) => {
          if(to.params.pool == 'susd') return next()
          return next('/' + to.params.pool + '/withdraw')
        }
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
        path: 'profit/:address?',
        name: 'Profit',
        component: ProfitRouter
      },
      {
        path: 'audits',
        name: 'Audits',
        component: Audits,
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

const pools = ['compound','usdt','y','iearn','busd','susd', 'susdv2','pax','tbtc','ren']

router.beforeEach(async (to, from, next) => {
  if(from.path.includes('/compound/withdraw_old')) await common.update_fee_info()
  //if(from.path.includes('profit') && to.path.includes('profit')) return window.location.href = to.path
  if(['Donate', 'StatsDaily', 'Audits'].includes(to.name)) return next();
  if(to.name == 'RootIndex') {
    init('compound');
    return next();
  }
  let subdomain;
  if(pools.includes(to.path.split('/')[1])) subdomain = to.path.split('/')[1]
  else subdomain = window.location.hostname.split('.')[0]
/*  if(window.location.hostname.split('.').length > 1) subdomain = window.location.hostname.split('.')[0]
  else subdomain = to.path.split('/')[1]*/
  if(subdomain == 'y') subdomain = 'iearn'
  if(!pools.includes(subdomain)) subdomain = 'compound'

  if((currentContract.currentContract != subdomain && !['Stats', 'FAQ', 'Donate'].includes(to.name)) || ['Stats', 'FAQ', 'Donate'].includes(from.name)) {
    changeContract(subdomain)
    currentContract.currentContract = subdomain
    next();
  }
  else if(!['Stats', 'FAQ', 'Donate'].includes(to.name)) {
    next();
    if(!currentContract.initializedContracts) {
      await init(subdomain);
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
