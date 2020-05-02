<template>
  <div class="blue window half-width info">
    <fieldset id="lp-info-currency">
      <legend>Currency reserves</legend>
      <ul id='balances-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b>
            <span :class="{'loading line': !bal_info || bal_info[i] === null}"> 
              <span v-show='bal_info && bal_info[i]'> 
                {{bal_info && bal_info[i] | toFixed2}} ({{((bal_info && bal_info[i] * 100) / totalBalances) | toFixed2}}%) 
              </span>
            </span>
          </li>
          <li>
            <b>{{totalCurrencies(currencies)}}:</b> 
            <span :class="{'loading line': totalBalances === null}"> {{totalBalances | toFixed2}}</span>
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
          <span :class="{'loading line': virtualPrice === null}"> {{ (virtualPrice).toFixed(4) }} </span>
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
          <span :class="{'loading line': A === null}"> {{ A }} </span>
        </li>
        <li v-show = 'admin_actions_deadline !== null && admin_actions_deadline !== 0'>
          <b>Future A: </b>
          <span :class="{'loading line': future_A === null}"> {{ future_A }} </span>
        </li>
        <li v-show = 'admin_actions_deadline !== null && admin_actions_deadline !== 0'>
          <b>Action deadline: </b>
          <div :class="{'loading line': admin_actions_deadline === null}"> {{ admin_actions_readable }} </div>
        </li>
      </ul>
    </fieldset>

    <fieldset id="lp-info-container" v-show='totalShare > 0 && initializedContracts'>
      <legend>My share: ( {{(totalBalance / totalSupply * 100).toFixed(3)}}% of pool)</legend>
      <ul id='lp-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b> 
            <span> {{l_info && l_info[i] | toFixed2}}</span></li>
          <li>
            <b>{{totalCurrencies(currencies)}}:</b> 

            <span> {{totalShare | toFixed2}}</span>
          </li>
          <li>
            <b>Averaged USD balance:</b> {{(usdShare) | toFixed2}}
          </li>
      </ul>
    </fieldset>
    <fieldset id="lp-info-container" v-show="totalStake > 0 && initializedContracts && currentPool == 'susdv2' ">
      <legend>Staked share: ( {{(totalStake / totalSupply * 100).toFixed(3)}}% of pool)</legend>
      <ul id='stakelp-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b> 
            <span> {{staked_info && staked_info[i] | toFixed2}}</span></li>
          <li>
            <b>{{totalCurrencies(currencies)}}:</b> 

            <span> {{totalStake | toFixed2}}</span>
          </li>

          <li>
            <b>Averaged USD balance:</b> {{(usdStake) | toFixed2}}
          </li>

      </ul>
    </fieldset>

  </div>
</template>

<script>
  import { getters, allCurrencies, contract as currentContract } from '../contract'
  import * as helpers from '../utils/helpers'

  export default {
    props: ['pool', 'bal_info', 'total', 'l_info', 'totalShare', 'fee', 'admin_fee', 'currencies', 'tokenSupply', 'tokenBalance', 'staked_info', 'totalStake'],
    methods: {
      totalCurrencies(currencies) {
        if(this.currentPool != 'susdv2')
          return Object.keys(currencies).join('+').toUpperCase();
        return Object.values(currencies).join('+');
      },
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
      virtualPrice() {
        return currentContract.virtual_price || 0
      },
      totalBalances() {
        return this.bal_info.reduce((a, b) => a + b, 0)
      },
      usdShare() {
        return getters.usdShare()
      },
      usdStake() {
        return getters.usdStake()
      },
      A() {
        return (getters.A() * 1e18) | 0
      },
      future_A() {
        return (getters.future_A() * 1e18) | 0
      },
      admin_actions_readable() {
        return helpers.formatDateToHuman(this.admin_actions_deadline)
      },
      admin_actions_deadline() {
        return getters.admin_actions_deadline()
      },
    }
  }
</script>

<style scoped>
  .tooltip .tooltiptext {
    font-weight: normal;
    background-color: #aaaaaa;
    color: black;
  }
  .tooltip .tooltiptext::after {
    border-color: #aaaaaa transparent transparent transparent;
  }
</style>