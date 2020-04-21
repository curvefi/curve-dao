<template>
	<div>
	    <p class='simple-error' id='highslippage-warning' v-show='showSlippage && slippage < -0.005'>
	    	<span class='text'>Warning! High slippage</span>: 
	    	<span class='percent'>{{(-slippage*100).toFixed(3)}}</span>%
	    </p>
	    <p class='info-message' id='slippage-warning' v-show='showSlippage && slippage <= 0 && slippage >= -0.005'>
	    	<span class='text'>Slippage</span>: 
	    	<span class='percent'>{{(-slippage*100).toFixed(3)}}</span>%
	    </p>
	    <p class='success' id='bonus-window' v-show='showSlippage && slippage > 0'>
	    	Bonus: <span>{{(slippage*100).toFixed(3)}}</span>%
	    </p>
      <p class='simple-error' id='nobalance-warning' v-show='show_nobalance'>
      	Warning! Not enough balance for {{noBalanceText}} token in the contract
      </p>
	</div>
</template>

<script>
    import { getters, contract as currentContract } from '../../contract'
    export default {
    	props: ['show_nobalance','show_nobalance_i'],
        computed: {
          ...getters,
          noBalanceText() {
          	if(!this.show_nobalance) return '';
          	let kv = Object.entries(this.currencies)[this.show_nobalance_i]
          	return kv[1] + " (in " + kv[0] + ")";
          }
        },
    }
</script>

<style>
	
</style>