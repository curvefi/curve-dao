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
      <p class='info-message' id='susd-warning' v-show="currentPool == 'susdnew' && showSlippage && slippage < -0.001">
        Please add coins in a balanced proportion
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
            if(!(this.show_nobalance_i == 2 && this.currentPool == 'usdt') && this.currentPool != 'susdnew') {
              return kv[1] + " (in " + kv[0] + ")";
            }
            return kv[1];
          }
        },
    }
</script>

<style scoped>
	#susd-warning {
    background: #3465a4e6;
  }
</style>