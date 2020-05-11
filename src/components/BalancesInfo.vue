<template>
  <div class="blue window half-width info">
    <fieldset id="lp-info-currency">
      <legend>Currency reserves</legend>
      <ul id='balances-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b>
            <span :class="{'loading line': !bal_info || bal_info[i] === null}"> 
              <span v-show='bal_info && bal_info[i]'> 
                {{bal_info && bal_info[i] | toFixed2 | formatNumber }} ({{((bal_info && bal_info[i] * 100) / totalBalances) | toFixed2}}%) 
              </span>
            </span>
          </li>
          <li>
            <b>{{totalCurrencies(currencies)}}:</b> 
            <span :class="{'loading line': totalBalances === null}"> {{totalBalances | toFixed2 | formatNumber}}</span>
          </li>
      </ul>
      <p>
        <ul>
          <li>
            <b>Fee:</b> 
            <span id='fee-info' :class="{'loading line': !fee}">
            </span>
            <span v-show = 'fee'> {{fee && fee.toFixed(3)}}</span>
          </span>%
          <li>
            <b>Admin fee:</b> 
            <span id='admin-fee-info' :class="{'loading line': admin_fee}"> {{admin_fee && admin_fee.toFixed(3)}}</span>%
          </li>
        </ul>
      </p>
      <ul>
        <li>
          <b>
            Virtual price: 
          </b>
          <span :class="{'loading line': virtualPrice1 === null}"> {{ (virtualPrice1).toFixed(4) }} </span>
          <span class='tooltip'>[?]
            <span class='tooltiptext'>
              Average dollar value of pool token
            </span>
          </span>
        </li>
        <li>
          <b class='tooltip'>
            A: 
            <span class='tooltiptext long'>
              Amplification coefficient chosen from fluctation of prices around 1
            </span>
          </b>
          <span :class="{'loading line': A1 === null}"> {{ A1 }} </span>
        </li>
        <li v-show = 'admin_actions_deadline1 !== null && admin_actions_deadline1 !== 0'>
          <b>Future A: </b>
          <span :class="{'loading line': future_A1 === null}"> {{ future_A1 }} </span>
        </li>
        <li v-show = 'admin_actions_deadline1 !== null && admin_actions_deadline1 !== 0'>
          <b>Action deadline: </b>
          <div :class="{'loading line': admin_actions_deadline1 === null}"> {{ admin_actions_readable }} </div>
        </li>
      </ul>
      <p>
        <ul>
          <li>
            <b>Liquidity utilization: </b>
            <span :class="{'loading line': totalBalances === null || poolVolume == -1}">
              <span v-show='totalBalances !== null && poolVolume != -1'>
                {{ (poolVolume * 100 / totalBalances).toFixed(2) }}%
              </span>
            </span>
            <span class='tooltip'> [?]
              <span class='tooltiptext'>
                24h Volume/Liquidity ratio
              </span>
            </span>
          </li>
        </ul>
      </p>
    </fieldset>

    <fieldset id="lp-info-container" v-show='totalShare > 0 && initializedContracts'>
      <legend>My share: ( {{(totalBalance / totalSupply * 100).toFixed(3)}}% of pool)</legend>
      <ul id='lp-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b> 
            <span> {{l_info && l_info[i] | toFixed2 | formatNumber}}</span></li>
          <li>
            <b>{{totalCurrencies(currencies)}}:</b> 

            <span> {{totalShare | toFixed2 | formatNumber}}</span>
          </li>
          <li>
            <b>Averaged USD balance:</b> {{(usdShare1) | toFixed2 | formatNumber }}
          </li>
      </ul>
    </fieldset>
    <fieldset id="lp-info-container" v-show="totalStake > 0 && initializedContracts && currentPool == 'susdv2' ">
      <legend>Staked share: ( {{(totalStake / totalSupply * 100).toFixed(3)}}% of pool)</legend>
      <ul id='stakelp-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b> 
            <span> {{staked_info && staked_info[i] | toFixed2 | formatNumber}}</span></li>
          <li>
            <b>{{totalCurrencies(currencies)}}:</b> 

            <span> {{totalStake | toFixed2 | formatNumber}}</span>
          </li>

          <li>
            <b>Averaged USD balance:</b> {{(usdStake1) | toFixed2 | formatNumber}}
          </li>

      </ul>
    </fieldset>

  </div>
</template>

<script>
  import { getters, allCurrencies, contract as currentContract } from '../contract'
  import * as helpers from '../utils/helpers'
  import * as volumeStore from './common/volumeStore'

  export default {
    props: ['pool', 'bal_info', 'total', 'l_info', 'totalShare', 'fee', 'admin_fee', 'currencies', 'tokenSupply', 'tokenBalance', 'usdShare', 'staked_info', 'totalStake', 'usdStake', 'combinedstats', 'virtual_price', 'A', 'future_A', 'admin_actions_deadline'],
    methods: {
      totalCurrencies(currencies) {
        if(this.currentPool != 'susdv2')
          return Object.keys(currencies).join('+').toUpperCase();
        return Object.values(currencies).join('+');
      },
    },
    async created() {
      if(volumeStore.state.volumes.compound == -1) {
        let stats = await fetch(`${window.domain}/raw-stats/apys.json`)
        stats = await stats.json()
        this.volumes = stats.volume;
        volumeStore.state.volumes = stats.volume
      }
    },
    computed: {
      showShares: getters.showShares,
      initializedContracts: getters.initializedContracts,
      totalSupply() {
        if(this.tokenSupply) return this.tokenSupply
        return getters.totalSupply()
      },
      totalBalance() {
        if(this.tokenBalance) return this.tokenBalance
        return getters.totalBalance()
      },
      curveStakeBalance() {
        return currentContract.curveStakeBalance
      },
      currentPool() {
        return this.pool || currentContract.currentContract
      },
      virtualPrice1() {
        return this.virtual_price || (currentContract.virtual_price || 0)
      },
      totalBalances() {
        return this.bal_info && this.bal_info.reduce((a, b) => a + b, 0) || null
      },
      usdShare1() {
        return this.usdShare || getters.usdShare()
      },
      usdStake1() {
        return this.usdStake || getters.usdStake()
      },
      A1() {
        return this. A || ((getters.A() * 1e18) | 0)
      },
      future_A1() {
        return this.future_A || ((getters.future_A() * 1e18) | 0)
      },
      admin_actions_readable() {
        return helpers.formatDateToHuman(this.admin_actions_deadline1)
      },
      admin_actions_deadline1() {
        return this.admin_actions_deadline || getters.admin_actions_deadline()
      },
      poolVolume() {
        return volumeStore.state.volumes[this.currentPool == 'iearn' ? 'y' : this.currentPool == 'susdv2' ? 'susd' : this.currentPool]
      },
    }
  }
</script>

<style scoped>
  .tooltip {
    margin-left: 0;
  }
  
  .tooltip .tooltiptext {
    font-weight: normal;
    background-color: #aaaaaa;
    color: black;
  }
  .tooltip .tooltiptext::after {
    border-color: #aaaaaa transparent transparent transparent;
  }
</style>