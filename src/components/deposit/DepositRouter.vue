<template>
	<div class='window white'>
		<div class='info-message gentle-message betaversion' v-show='swapbtc'>
			This is a beta version. Please test with small amounts and use with caution.
		</div>
	    <deposit-native v-if='swapbtc' @loaded='loaded'></deposit-native>
	    <deposit v-if='!swapbtc || (swapbtc && !loaded)'></deposit>
		<div v-show="currentPool == 'ren'" class='swapBTC-container'>
	        <input id='swapbtc' type='checkbox' value='swapbtc' v-model='swapbtc'/>
	        <label for='swapbtc'>
	        	Deposit BTC
	        	<span v-show='hasIncomplete > 0 && swapbtc == false'>
	        		( {{hasIncomplete}} incomplete transactions)
	        	</span>
	        </label>
	    	<span v-show='loading' class='loading line'></span>
	    </div>
    </div>
</template>

<script>
    import { getters, contract as currentContract, gas as contractGas} from '../../contract'
    import * as shiftState from '../ren/shiftState'
	import Deposit from './Deposit.vue'

    const DepositNative = () => ({
        component: import('../ren/Deposit.vue'),

        loading: Deposit,

        delay: 0,
    })

	export default {
		components: {
			Deposit,
			DepositNative,
		},


		data: () => ({
			loading: false,
		}),

		watch: {
			swapbtc(val) {
				if(val) this.loading = true
				else this.loading = false
			}
		},

		computed: {
			swapComponent() {
				if(this.swapbtc) return 'DepositNative'
				return 'Deposit'
			},
			currentPool() {
				return getters.currentPool()
			},
			hasIncomplete() {
				return shiftState.hasIncomplete()
			},
			swapbtc: {
				get() {
					return currentContract.swapbtc
				},
				set(val) {
					currentContract.swapbtc = val
				},
			},
		},

		methods: {
			loaded() {
				if(this.swapComponent == 'DepositNative') this.loading = false;
			}
		},

	}
</script>

<style scoped>
	.swapBTC-container {
		margin-top: 1em;
		margin-bottom: 1em;
	}
	.loading.line {
		margin-left: 1em;
	}
</style>