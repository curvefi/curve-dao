<template>
  <div id="app" class='root'>
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div class='poolsdropdown'>
        <button class='simplebutton'>☰</button>
        <div class='dropdown'>
           <!--  <a :href="'//compound.localhost:8080'+$route.path" :class="{selected: currentPool == 'compound'}" @click="changePools('compound')">Compound</a>
            <a :href="'//usdt.localhost:8080'+$route.path" :class="{selected: currentPool == 'usdt'}" @click="changePools('usdt')">USDT</a>
            <a :href="'//y.localhost:8080'+$route.path" :class="{selected: currentPool == 'iearn'}" @click="changePools('iearn')">Y</a>
            <a :href="'//busd.localhost:8080'+$route.path" :class="{selected: currentPool == 'busd'}" @click="changePools('busd')">bUSD</a> -->

            <router-link :to="'/compound/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'compound'}">Compound</router-link>
            <router-link :to="'/usdt/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'usdt'}">USDT</router-link>
            <router-link :to="'/iearn/' + ($route.path.split('/')[2] || '') " :class="{selected: currentPool == 'iearn'}">Y</router-link>
            <router-link :to="'/busd/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'busd'}">bUSD</router-link>
            <a href="https://iearn.finance/pool">sUSD</a>
            <p>____________</p>
            <button class='simplebutton' @click = 'changeAccounts'>Change accounts</button>
        </div>
      </div>

      <router-link to="/">Home</router-link>
      <router-link to="/basictrade">Basic trade</router-link>
      <router-link to="/trade">Advanced trade</router-link>
      <router-link to="/combinedstats">Stats</router-link>
      <router-link to="/dailystats">Daily stats</router-link>
      <div class='poolsdropdown right'>
        <span>?</span>
        <div class='dropdown'>
          <a href="https://twitter.com/CurveFinance">#Twitter</a>
          <a href="https://t.me/curvefi">@Telegram</a>
          <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB">Dune Analytics</a>
          <router-link to="/donate">Donate</router-link>
          <a href="https://github.com/curvefi/curve-contract">git@</a>
          <a href="https://github.com/pengiundev/curve-vue">git@UI</a>
        </div>
      </div>
       <a href="https://twitter.com/CurveFinance" class='showmobile'>#Twitter</a>
      <a href="https://t.me/curvefi" class='showmobile'>@Telegram</a>
      <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB" class='showmobile'>Dune Analytics</a>
      <router-link to="/donate" class='showmobile'>Donate</router-link>
      <a href="https://github.com/curvefi/curve-contract" class='showmobile'>git@</a>
      <a href="https://github.com/pengiundev/curve-vue" class='showmobile'>git@UI</a>
      <button class='simplebutton showmobile' @click = 'changeAccounts'>Change accounts</button>
    </div>
    <div id="screen">
        <div :class="'blue window ' + $route.name">
            <h1><img src="../../assets/logo_optimized.svg" alt="🌀 Curve" height="50"></h1>
        </div>
        <router-view/>
    </div>
  </div>
</template>

<script>
  import { getters, contract as currentContract, changeContract, poolMenu } from '../../contract'
  import init from '../../init'

  export default {
    metaInfo: {
      title: 'Curve.fi',
      meta: [
        {'property': 'og:title', 'content': 'curve.fi'},
        {'property': 'og:url', 'content': 'https://curve.fi'},
        {'property': 'og:type', 'content': 'website'},
        {'property': 'og:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
        {'property': 'og:image', 'content': '/curve.png'},
        {'name': 'twitter:card', 'content': 'summary_large_image'},
        {'name': 'twitter:title', 'content': 'curve.fi'},
        {'name': 'twitter:site', 'content': '@CurveFinance'},
        {'name': 'twitter:creator', 'content': '@CurveFinance'},
        {'name': 'twitter:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
        {'name': 'twitter:url', 'content': 'https://curve.fi'},
        {'name': 'twitter:image', 'content': '/curve.png'},
      ]
    },
    components: {
      
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
      },
      async changeAccounts() {
        localStorage.removeItem('selectedWallet')
        currentContract.totalShare = 0
        init(false)
      }
    },
  }
</script>

<style scoped>
  @media only screen and (min-device-width : 320px) and (max-device-width : 730px) {
    .top-menu-bar > .poolsdropdown {
      display: none;
    }
  }
</style>