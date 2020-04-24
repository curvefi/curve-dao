<template>
  <div class="blue window half-width info">
    <fieldset id="lp-info-currency">
      <legend>Currency reserves</legend>
      <ul id='balances-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b>
            <span :class="{'loading line': !bal_info || bal_info[i] === null}"> {{bal_info && bal_info[i] | toFixed2}}</span>
          </li>
          <li>
            <b>{{totalCurrencies(currencies) | capitalize}}:</b> 
            <span :class="{'loading line': total === null}"> {{total | toFixed2}}</span>
          </li>
      </ul>
      <p>
        <b>Fee:</b> 
        <span id='fee-info' :class="{'loading line': !fee}">
          <span v-show = 'fee'> {{fee && fee.toFixed(3)}}</span>
        </span>%
      </p>
      <p>
        <b>Admin fee:</b> 
        <span id='admin-fee-info' :class="{'loading line': admin_fee}"> {{admin_fee && admin_fee.toFixed(3)}}</span>%
      </p>
    </fieldset>

    <fieldset id="lp-info-container" v-show='totalShare > 0 && initializedContracts'>
      <legend>My share: ( {{(totalBalance / totalSupply * 100).toFixed(3)}}% of pool)</legend>
      <ul id='lp-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b> 
            <span> {{l_info && l_info[i] | toFixed2}}</span></li>
          <li>
            <b>{{totalCurrencies(currencies) | capitalize}}:</b> 

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
            <b>{{totalCurrencies(currencies) | capitalize}}:</b> 

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
        return helpers.totalCurrencies(currencies)
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
        return currentContract.virtual_price
      },
      usdShare() {
        return getters.usdShare()
      },
      usdStake() {
        return getters.usdStake()
      }
    }
  }
</script>