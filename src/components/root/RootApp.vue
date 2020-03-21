<template>
  <div id="app">
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div id='poolsdropdown'>
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
            <p>____________</p>
            <button class='simplebutton' @click = 'changeAccounts'>Change accounts</button>
        </div>
      </div>

      <router-link to="/">This FAQ</router-link>
      <router-link to="/combinedstats">Stats</router-link>
      <a href="https://twitter.com/CurveFinance">#Twitter</a>
      <a href="https://t.me/curvefi">@Telegram</a>
      <a href="https://www.duneanalytics.com/curve">Dune Analytics</a>
      <router-link to="/donate">Donate</router-link>
      <a href="https://github.com/curvefi/curve-contract">git@</a>
    </div>
    <div id="screen">
        <div class="blue window">
            <h1><img src="../../assets/logo.svg" alt="🌀 Curve" height="50"></h1>
        </div>
        <div class="error window half-width info" id="error-window" v-show='error'>
          {{error}}
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

<style>
  .dropdown p {
    color: black;
    margin-top: 0;
    margin-bottom: 15px;
  }
</style>