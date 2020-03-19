<template>
  <div class="blue window half-width info">
    <fieldset id="lp-info-currency">
      <legend>Currency reserves</legend>
      <ul id='balances-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b> 
            <span :class="{'loading line': !bal_info[i]}"> {{bal_info[i] | toFixed2}}</span>
          </li>
          <li>
            <b>{{totalCurrencies(currencies) | capitalize}}:</b> 
            <span :class="{'loading line': !balTotal}"> {{balTotal | toFixed2}}</span>
          </li>
      </ul>
      <p>
        <b>Fee:</b> 
        <span id='fee-info' :class="{'loading line': !fee}">
          <span v-show = 'fee'> {{fee.toFixed(3)}}</span>
        </span>%
      </p>
      <p>
        <b>Admin fee:</b> 
        <span id='admin-fee-info' :class="{'loading line': admin_fee}"> {{admin_fee.toFixed(3)}}</span>%
      </p>
    </fieldset>
    <fieldset id="lp-info-container" v-show='totalShare > 0'>
      <legend>My share:</legend>
      <ul id='lp-info'>
          <li v-for='(currency, i) in Object.keys(currencies)'>
            <b>{{currency | capitalize}}:</b> 
            <span> {{l_info[i] | toFixed2}}</span></li>
          <li>
            <b>{{totalCurrencies(currencies) | capitalize}}:</b> 

            <span> {{totalShare | toFixed2}}</span>
          </li>
      </ul>
    </fieldset>
  </div>
</template>

<script>
  import { getters } from '../contract'
  import * as helpers from '../utils/helpers'

  export default {
    computed: {
      ...getters,
    },
    methods: {
      totalCurrencies(currencies) {
        return helpers.totalCurrencies(currencies)
      }
    }
  }
</script>