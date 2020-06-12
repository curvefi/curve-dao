<template>
  <div id="app" :class="{'root': true, [$route.name]: true}">
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

            <router-link :to="'/compound/' + ($route.path.split('/')[2] || '')  ">Compound</router-link>
            <!-- <router-link :to="'/usdt/' + ($route.path.split('/')[2] || '')  ">USDT</router-link> -->
            <router-link :to="'/pax/' + ($route.path.split('/')[2] || '')">PAX</router-link>
            <router-link :to="'/iearn/' + ($route.path.split('/')[2] || '') ">Y</router-link>
            <router-link :to="'/busd/' + ($route.path.split('/')[2] || '')  ">bUSD</router-link>
            <router-link :to="'/susdv2/' + ($route.path.split('/')[2] || '')">sUSD</router-link>
            <router-link :to="'/ren/' + ($route.path.split('/')[2] || '')">renBTC</router-link>
<!--             <a href="https://iearn.finance/pool">sUSD</a> -->
            <p>____________</p>
            <button class='simplebutton' @click = 'changeWallets'>Change wallet</button>
            <button id='changeAccounts' class='simplebutton' 
              @click = 'changeAccounts'>Change accounts</button>
        </div>
      </div>

      <router-link to="/">Home</router-link>
      <router-link to="/trade">Trade</router-link>
      <div class='poolsdropdown'>
        <router-link to="/combinedstats">Stats</router-link>
        <div class='dropdown'>
          <router-link to="/combinedstats">Stats</router-link>
          <router-link to="/dailystats">Daily stats</router-link>
          <router-link to="/volumepercoin">Coin volumes</router-link>
          <router-link to="/volumeperpair">Pair volumes</router-link>
          <router-link to="/totaldeposits">Total deposits</router-link>
        </div>
      </div>
      <router-link to="/curvepay">Pay</router-link>
      <div class='poolsdropdown right'>
        <span>?</span>
        <div class='dropdown'>
          <router-link to="/audits">Audits</router-link>
          <router-link to="/events">Events</router-link>
          <router-link to="/contracts">Contracts</router-link>
          <router-link to="/rootfaq">FAQ</router-link>
          <router-link to="/integrations">Integrations</router-link>
          <a href="https://twitter.com/CurveFinance">#Twitter</a>
          <a href="https://t.me/curvefi">@Telegram</a>
          <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB">Dune Analytics</a>
          <router-link to="/donate">Donate</router-link>
          <a href="https://github.com/curvefi/curve-contract">git@</a>
          <a href="https://github.com/pengiundev/curve-vue">git@UI</a>
        </div>
      </div>
      <router-link to="/combinedstats" class='showmobile'>Stats</router-link>
      <router-link to="/dailystats" class='showmobile'>Daily stats</router-link>
      <router-link to="/volumepercoin" class='showmobile'>Coin volumes</router-link>
      <router-link to="/volumeperpair" class='showmobile'>Pair volumes</router-link>
      <router-link to="/totaldeposits" class='showmobile'>Total deposits</router-link>
      <router-link to="/audits" class='showmobile'>Audits</router-link>
      <router-link to="/events" class='showmobile'>Events</router-link>
      <router-link to="/rootfaq" class='showmobile'>FAQ</router-link>
      <router-link to="/integrations" class='showmobile'>Integrations</router-link>
      <a href="https://twitter.com/CurveFinance" class='showmobile'>#Twitter</a>
      <a href="https://t.me/curvefi" class='showmobile'>@Telegram</a>
      <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB" class='showmobile'>Dune Analytics</a>
      <router-link to="/donate" class='showmobile'>Donate</router-link>
      <a href="https://github.com/curvefi/curve-contract" class='showmobile'>git@</a>
      <a href="https://github.com/pengiundev/curve-vue" class='showmobile'>git@UI</a>
      <button class='simplebutton showmobile' @click = 'changeWallets'>Change wallet</button>
      <button id='changeAccounts' class='simplebutton showmobile' 
        v-show="['ledger', 'trezor'].includes(walletName)" 
        @click = 'changeAccounts'>Change accounts</button>
    </div>
    <div id="screen">
        <div :class="'blue window ' + $route.name">
            <h1><img :src="logoSrc" alt="🌀 Curve"></h1>
        </div>
        <div class='info-message gentle-message window half-width gentle-message' v-if='hasConnectedWallet'>
          You haven't connected a wallet. <button @click='changeWallets'>Connect wallet</button>
        </div>
        <router-view/>
    </div>
  </div>
</template>

<script>
  import { getters, contract as currentContract, changeContract, poolMenu } from '../../contract'
  import init, { onboard } from '../../init'

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
      publicPath() {
        return process.env.BASE_URL
      },
      logoSrc() {
        if(!currentContract.swapbtc) return this.publicPath + 'logo_optimized.svg'
        else return this.publicPath + 'logo_ren_beta_optimized.svg'
      },
      hasConnectedWallet() {
        return this.default_account == '0x0000000000000000000000000000000000000000'
      },
    },
    methods: {
      changePools(pool) {
        changeContract(pool)
      },
      async changeWallets() {
        localStorage.removeItem('selectedWallet')
        currentContract.totalShare = 0
        init(false)
      },
      async changeAccounts() {
        return onboard.accountSelect();
      },
    },
  }
</script>

<style scoped>
  #changeAccounts {
    margin-top: 0.3em;
  }
  @media only screen and (min-device-width : 320px) and (max-device-width : 730px) {
    .top-menu-bar > .poolsdropdown {
      display: none;
    }
  }
  h1 > img {
    height: 52.125px;
  }
</style>