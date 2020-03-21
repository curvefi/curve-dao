<template>
  <div id="app">
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div id='poolsdropdown'>
        <button class='simplebutton' :class="{'loading line': !initializedContracts && !['Stats', 'FAQ', 'Donate'].includes($route.name)}">[{{poolMenu[currentPool]}}]</button>
        <div class='dropdown'>
           <!--  <a :href="'//compound.localhost:8080'+$route.path" :class="{selected: currentPool == 'compound'}" @click="changePools('compound')">Compound</a>
            <a :href="'//usdt.localhost:8080'+$route.path" :class="{selected: currentPool == 'usdt'}" @click="changePools('usdt')">USDT</a>
            <a :href="'//y.localhost:8080'+$route.path" :class="{selected: currentPool == 'iearn'}" @click="changePools('iearn')">Y</a>
            <a :href="'//busd.localhost:8080'+$route.path" :class="{selected: currentPool == 'busd'}" @click="changePools('busd')">bUSD</a> -->

            <router-link :to="'/compound/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'compound'}">Compound</router-link>
            <router-link :to="'/usdt/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'usdt'}">USDT</router-link>
            <router-link :to="'/iearn/' + ($route.path.split('/')[2] || '') " :class="{selected: currentPool == 'iearn'}">Y</router-link>
            <router-link :to="'/busd/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'busd'}">bUSD</router-link>
            <p>____________</p>
            <router-link to='/'>Home</router-link>
            <router-link to='/combinedstats'>All stats</router-link>
            <a href="https://twitter.com/CurveFinance">#Twitter</a>
            <a href="https://t.me/curvefi">@Telegram</a>
            <a href="https://www.duneanalytics.com/curve">Dune Analytics</a>
            <p>____________</p>
            <button class='simplebutton' @click = 'changeAccounts'>Change accounts</button>
        </div>
      </div>

      <router-link to='/' class='showmobile'>Home</router-link>
      <router-link to='/combinedstats' class='showmobile'>All stats</router-link>
      <router-link :to="'/'+currentPool">Buy and sell</router-link>
      <router-link :to="'/' + currentPool + '/deposit'">Deposit</router-link>
      <router-link :to="'/' + currentPool + '/withdraw'">Withdraw</router-link>
      <router-link :to="'/' + currentPool + '/withdraw_old'" v-show="currentPool == 'compound'">Withdraw old</router-link>
      <router-link :to="'/' + currentPool + '/stats'">Stats</router-link>
      <router-link :to="'/' + currentPool + '/profit'">Profit</router-link>
      <router-link :to="'/' + currentPool + '/faq'">FAQ</router-link>
      <router-link :to="'/' + currentPool + '/donate'">Donate</router-link>
      <a href="https://github.com/curvefi/curve-contract/tree/pool_compound">git@</a>
    </div>
    <div id="screen">
        <div class="blue window">
            <h1><img src="../assets/logo.svg" alt="🌀 Curve" height="50"></h1>
        </div>
        <div class="error window half-width info" id="error-window"></div>
        <router-view/>
    </div>
    <balances-info
    :bal_info = 'bal_info'
    :total = 'balTotal'
    :l_info = 'l_info'
    :totalShare = 'totalShare'
    :fee = 'fee'
    :admin_fee = 'admin_fee'
    :currencies = 'currencies'
    v-show="!['Stats', 'FAQ', 'Donate', 'Root', 'CombinedStats'].includes($route.name)"/>
  </div>
</template>

<script>
  import BalancesInfo from '../components/BalancesInfo.vue'
  import { getters, contract as currentContract, changeContract, poolMenu } from '../contract'
  import init from '../init'

  export default {
    components: {
      BalancesInfo,
    },
    computed: {
      allGetters() {
        return getters;
      },
      ...getters,
      poolMenu() {
        return poolMenu;
      },
    },
    methods: {
      changePools(pool) {
        changeContract(pool)
      },
      async changeAccounts() {
        localStorage.removeItem('selectedWallet')
        currentContract.totalShare = 0
        init(false)
      }
    },
  }
</script>

<style>
  .dropdown p {
    color: black;
    margin-top: 0;
    margin-bottom: 15px;
  }
  a.showmobile {
    display: none;
  }
  @media only screen and (min-device-width : 320px) and (max-device-width : 480px) {
    #hamburger:checked ~ a.showmobile {
      display: block;
    }
  }
</style>