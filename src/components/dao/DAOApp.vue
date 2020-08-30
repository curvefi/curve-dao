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

            <a :href="'https://curve.fi/compound/' + ($route.path.split('/')[2] || '')  ">Compound</a>
            <!-- <a href="'https://curve.fi/usdt/' + ($route.path.split('/')[2] || '')  ">USDT</a> -->
            <a :href="'https://curve.fi/pax/' + ($route.path.split('/')[2] || '')">PAX</a>
            <a :href="'https://curve.fi/iearn/' + ($route.path.split('/')[2] || '') ">Y</a>
            <a :href="'https://curve.fi/busd/' + ($route.path.split('/')[2] || '')  ">bUSD</a>
            <a :href="'https://curve.fi/susdv2/' + ($route.path.split('/')[2] || '')">sUSD</a>
            <a :href="'https://curve.fi/ren/' + ($route.path.split('/')[2] || '')">renBTC</a>
            <a :href="'https://curve.fi/sbtc/' + ($route.path.split('/')[2] || '')">sBTC</a>
<!--             <a href="https://iearn.finance/pool">sUSD</a> -->
            <p>____________</p>
            <button class='simplebutton' @click = 'changeWallets'>Change wallet</button>
            <button id='changeAccounts' class='simplebutton' 
              @click = 'changeAccounts'>Change accounts</button>
        </div>
      </div>

      <router-link to="/">Home</router-link>
      <a href='https://curve.fi'>Curve</a>
      <router-link to="/dao">DAO</router-link>
      <router-link to="/gaugeweight">Gauge weight vote</router-link>
      <router-link to="/minter/calc">Calc</router-link>
      <router-link to="/locker">Locker</router-link>
      <router-link to="/minter/gauges">Minter</router-link>
      <router-link to="/minter/vesting">Vesting</router-link>
      <div class='poolsdropdown right'>
        <router-link to="/stats">Stats</router-link>
        <div class='dropdown'>
          <router-link to="/stats">Stats</router-link>
          <router-link to="/inflation">Inflation</router-link>
          <router-link to="/locks">User vote-locks</router-link>
        </div>
      </div>
      <router-link to="/daocontracts">Contracts</router-link>
      <router-link to="/audits">Audits</router-link>
      <div class='poolsdropdown right'>
        <span>?</span>
        <div class='dropdown'>
          <router-link to="/audits">Audits</router-link>
          <a href="https://curve.fi/events">Events</a>
          <a href="https://curve.fi/contracts">Contracts</a>
          <a href="https://curve.fi/bugbounty">Bug</a>
          <a href="https://curve.fi/rootfaq">FAQ</a>
          <a href="https://curve.fi/integrations">Integrations</a>
          <a href="https://curve.fi/donate">Donate</a>
          <a href='https://guides.curve.fi' rel='noopener noreferrer'>Guides</a>
          <a href='https://resources.curve.fi' rel='noopener noreferrer'>Resources</a>
          <p>____________</p>
          <a href="https://twitter.com/CurveFinance" rel='noopener noreferrer'>#Twitter</a>
          <a href="https://t.me/curvefi" rel='noopener noreferrer'>@Telegram</a>
          <a href="https://t.me/curveficn" rel='noopener noreferrer'>@Telegram CN</a>
          <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB" rel='noopener noreferrer'>Dune Analytics</a>
          <p>____________</p>
          <a href="https://github.com/curvefi/curve-contract">git@</a>
          <a href="https://github.com/pengiundev/curve-vue">git@UI</a>
        </div>
      </div>
      <router-link to="/dao" class='showmobile'>Rinkeby DAO preview</router-link>
      <router-link to="/gaugeweight" class='showmobile'>Gauge weight vote</router-link>
      <router-link to="/locker" class='showmobile'>Locker</router-link>
      <router-link to="/minter/gauges" class='showmobile'>Minter</router-link>
      <router-link to="/minter/vesting" class='showmobile'>Vesting</router-link>
      <router-link to="/inflation" class='showmobile'>Inflation</router-link>
      <router-link to="/daocontracts" class='showmobile'>DAO Contracts</router-link>
      <router-link to="/audits" class='showmobile'>Audits</router-link>
      <a href="https://curve.fi/events" class='showmobile'>Events</a>
      <a href="https://curve.fi/bugbounty" class='showmobile'>Bug Bounty</a>
      <a href="https://curve.fi/rootfaq" class='showmobile'>FAQ</a>
      <a href="https://curve.fi/integrations" class='showmobile'>Integrations</a>
      <a href="https://curve.fi/donate" class='showmobile'>Donate</a>
      <a href='https://guides.curve.fi' rel='noopener noreferrer' class='showmobile'>Guides</a>
      <a href='https://resources.curve.fi' rel='noopener noreferrer' class='showmobile'>Resources</a>
      <a href="https://twitter.com/CurveFinance" class='showmobile' rel='noopener noreferrer'>#Twitter</a>
      <a href="https://t.me/curvefi" class='showmobile' rel='noopener noreferrer'>@Telegram</a>
      <a href="https://t.me/curveficn" class='showmobile' rel='noopener noreferrer'>@Telegram CN</a>      
      <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB" class='showmobile' rel='noopener noreferrer'>Dune Analytics</a>
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
    <footer>
      <a href="https://twitter.com/CurveFinance" rel='noopener noreferrer'>#Twitter</a>
      <a href="https://t.me/curvefi" rel='noopener noreferrer'>@Telegram</a>
      <a href="https://t.me/curveficn" rel='noopener noreferrer'>@Telegram CN</a>
      <a href="https://discord.gg/9uEHakc" rel='noopener noreferrer'>@Discord</a>
      <a href='https://guides.curve.fi' rel='noopener noreferrer'>Guides</a>
      <a href='https://resources.curve.fi' rel='noopener noreferrer'>Resources</a>
      <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB" rel='noopener noreferrer'>Dune Analytics</a>
      <a href="https://github.com/curvefi/curve-contract">git@</a>
      <a href="https://github.com/pengiundev/curve-vue">git@UI</a>
    </footer>
  </div>
</template>

<script>
  import { getters, contract as currentContract, changeContract, poolMenu } from '../../contract'
  import init, { onboard } from '../../init'

  export default {
    metaInfo: {
      title: 'Curve.fi DAO',
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
                && !['Donate', 'StatsDaily', 'Audits', 'Stats', 'Contracts', 'FAQ', 'RootFAQ'].includes(this.$route.name)
      },
    },
    methods: {
      changePools(pool) {
        changeContract(pool)
      },
      async changeWallets() {
        currentContract.default_account = ''
        onboard.walletReset()
        localStorage.removeItem('selectedWallet')
        currentContract.totalShare = 0
        let userSelectedWallet = await onboard.walletSelect();
        await onboard.walletCheck();
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
    .blue.window.half-width, .info-message.window.half-width {
      width: 90%;
    }
  }
  h1 > img {
    height: 52.125px;
  }
  .CRV div:nth-child(n+2) {
    margin-top: 1em;
  }
  .CRV a, .CRV a:hover, .CRV a:visited {
    color: white;
  }
</style>