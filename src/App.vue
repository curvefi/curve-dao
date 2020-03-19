<template>
  <div id="app">
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div id='poolsdropdown'>
        <button class='simplebutton'>[{{poolMenu[currentPool]}}]</button>
        <div class='dropdown'>
            <a :href="'//compound.localhost:8080'+$route.path" :class="{selected: currentPool == 'compound'}" @click="changePools('compound')">Compound</a>
            <a :href="'//usdt.localhost:8080'+$route.path" :class="{selected: currentPool == 'usdt'}" @click="changePools('usdt')">USDT</a>
            <a :href="'//y.localhost:8080'+$route.path" :class="{selected: currentPool == 'iearn'}" @click="changePools('iearn')">Y</a>
            <a :href="'//busd.localhost:8080'+$route.path" :class="{selected: currentPool == 'busd'}" @click="changePools('busd')">bUSD</a>

            <!-- <router-link :to="'//compound.localhost:8080/'+$route.path" :class="{selected: currentPool == 'compound'}">Compound</router-link>
            <router-link :to="'//usdt.localhost:8080/'+$route.path" :class="{selected: currentPool == 'usdt'}">USDT</router-link>
            <router-link :to="'//y.localhost:8080/'+$route.path" :class="{selected: currentPool == 'iearn'}">Y</router-link>
            <router-link :to="'//busd.localhost:8080/'+$route.path" :class="{selected: currentPool == 'busd'}">bUSD</router-link> -->
        </div>
      </div>

      <router-link to="/">Buy and sell</router-link>
      <router-link to="/deposit">Deposit</router-link>
      <router-link to="/withdraw">Withdraw</router-link>
      <router-link to="/withdraw_old" v-show="currentPool == 'compound'">Withdraw old</router-link>
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