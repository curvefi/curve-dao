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

Vue.use(VueRouter)

const routes = [
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
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
