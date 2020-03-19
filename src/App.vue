<template>
  <div id="app">
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div id='poolsdropdown'>
        <button class='simplebutton' :class="{'loading line': !initializedContracts}">[{{poolMenu[currentPool]}}]</button>
        <div class='dropdown'>
           <!--  <a :href="'//compound.localhost:8080'+$route.path" :class="{selected: currentPool == 'compound'}" @click="changePools('compound')">Compound</a>
            <a :href="'//usdt.localhost:8080'+$route.path" :class="{selected: currentPool == 'usdt'}" @click="changePools('usdt')">USDT</a>
            <a :href="'//y.localhost:8080'+$route.path" :class="{selected: currentPool == 'iearn'}" @click="changePools('iearn')">Y</a>
            <a :href="'//busd.localhost:8080'+$route.path" :class="{selected: currentPool == 'busd'}" @click="changePools('busd')">bUSD</a> -->

            <router-link :to="'/compound/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'compound'}">Compound</router-link>
            <router-link :to="'/usdt/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'usdt'}">USDT</router-link>
            <router-link :to="'/iearn/' + ($route.path.split('/')[2] || '') " :class="{selected: currentPool == 'iearn'}">Y</router-link>
            <router-link :to="'/busd/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'busd'}">bUSD</router-link>
        </div>
      </div>

      <router-link :to="'/'+currentPool">Buy and sell</router-link>
      <router-link :to="'/' + currentPool + '/deposit'">Deposit</router-link>
      <router-link :to="'/' + currentPool + '/withdraw'">Withdraw</router-link>
      <router-link :to="'/' + currentPool + '/withdraw_old'" v-show="currentPool == 'compound'">Withdraw old</router-link>
      <router-link :to="'/' + currentPool + '/stats'">Stats</router-link>
      <router-link :to="'/' + currentPool + '/profit'">Profit</router-link>
      <router-link :to="'/' + currentPool + '/faq'">FAQ</router-link>
      <router-link :to="'/' + currentPool + '/donate'">Donate</router-link>
      <router-link to="https://github.com/curvefi/curve-contract/tree/pool_compound">git@</router-link>
    </div>
    <div id="screen">
        <div class="blue window">
            <h1><img src="./assets/logo.svg" alt="🌀 Curve" height="50"></h1>
        </div>
        <div class="error window half-width info" id="error-window"></div>
        <router-view/>
    </div>
    <balances-info v-show="!['Stats', 'FAQ', 'Donate'].includes($route.name)"/>
  </div>
</template>

<script>
  import BalancesInfo from './components/BalancesInfo.vue'
  import { getters, contract as currentContract, changeContract, poolMenu } from './contract'

  export default {
    components: {
      BalancesInfo,
    },
    computed: {
      ...getters,
      poolMenu() {
        return poolMenu;
      },
    },
    methods: {
      changePools(pool) {
        changeContract(pool)
      }
    },
  }
</script>