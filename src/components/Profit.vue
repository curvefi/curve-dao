<template>
	<div class='blue window half-width info'>
        <fieldset id='profit-info'>
            <legend>Profit</legend>
            <ul id='profit'>
                <li>
                	<b>Deposits:</b> 
                	<span :class="{'loading line': deposits == ''}">
	                	{{deposits/100 | toFixed2}}
	            	</span>
            	</li>
                <li>
                	<b>Withdrawals:</b> 
                	<span :class="{'loading line': withdrawals == ''}">
                		{{withdrawals/100 | toFixed2}}
                	</span>
                </li>
                <li>
                	<b>Available:</b> 
                	<span :class="{'loading line': available == ''}">
                		{{available/100 | toFixed2}}
                	</span>
                </li>
                <li>
                	<b>Profit:</b> 
                	<span :class="{'loading line': available == ''}">
                		<span v-show='available'> {{(available + withdrawals - deposits)/100 | toFixed2}}</span>
                	</span>
                </li>
            </ul>
        </fieldset>
    </div>
</template>

<script>
	import Vue from 'vue'
    import * as common from '../utils/common.js'
    import { getters, contract as currentContract } from '../contract'
    import * as helpers from '../utils/helpers'
    import Web3 from "web3";

    import BigNumber from 'bignumber.js'

    import ProfitMixin from './ProfitMixin'
    import yProfitMixin from './yProfitMixin'

    let mixins = [ProfitMixin]
    const pools = ['compound','usdt','y','iearn','busd']
    let pool;
    if(pools.includes(window.location.pathname.split('/')[1])) pool = window.location.pathname.split('/')[1]
    else pool = window.location.hostname.split('.')[0]
    if(['iearn', 'y', 'busd'].includes(pool)) mixins.push(yProfitMixin)
    console.log(mixins, "MIXINS")
	export default {
        created() {
            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            })
            this.$watch(()=>currentContract.currentContract, val => {
                this.deposits = ''
                this.withdrawals = ''
                this.available = ''
                this.mounted();
            })
        },
        mounted() {
            if(currentContract.initializedContracts) this.mounted();
        },
		data: () => ({
			deposits: '',
			withdrawals: '',
			available: '',
			profit: '',
			BN: '',
			priceData: '',
			ADDRESSES: {},
			CURVE: '',
			CURVE_TOKEN: '',
			TRANSFER_TOPIC: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
		}),
        computed: {
          ...getters,
          version() {
            return process.env.VUE_APP_VERSION
          }
        },
        mixins: mixins,
	}
</script>