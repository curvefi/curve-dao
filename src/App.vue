<template>
  <div id="app">
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div id='poolsdropdown'>
        <a href='https://www.curve.fi'>[{{currentPool}}]</a>
        <div class='dropdown'>
            <a @click="changePools('compound')">Compound</a>
            <a @click="changePools('usdt')">USDT</a>
            <a @click="changePools('iearn')">Y</a>
            <a @click="changePools('busd')">bUSD</a>
        </div>
      </div>

      <router-link to="/">Buy and sell</router-link>
      <router-link to="/deposit">Deposit</router-link>
      <router-link to="/withdraw">Withdraw</router-link>
      <router-link to="/withdraw_old">Withdraw old</router-link>
      <router-link to="/stats">Stats</router-link>
      <router-link to="/profit">Profit</router-link>
      <router-link to="/faq">FAQ</router-link>
      <router-link to="/donate">Donate</router-link>
      <router-link to="https://github.com/curvefi/curve-contract/tree/pool_compound">git@</router-link>
    </div>
    <div id="screen">
        <div class="blue window">
            <h1><img src="./assets/logo.svg" alt="🌀 Curve" height="50"></h1>
        </div>
        <div class="error window half-width info" id="error-window"></div>
        <router-view/>
    </div>
    <balances-info/>
  </div>
</template>

<script>
  import BalancesInfo from './components/BalancesInfo.vue'
  import { getters, contract as currentContract, changeContract } from './contract'

  export default {
    components: {
      BalancesInfo,
    },
    computed: {
      ...getters,
    },
    methods: {
      changePools(pool) {
        changeContract(pool)
      }
    },
  }
</script>