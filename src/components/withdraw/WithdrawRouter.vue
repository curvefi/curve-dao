<template>
	<div class='window white'>
		<div class='info-message gentle-message betaversion' v-show='swapbtc'>
			This is a beta version. Please test with small amounts and use with caution.
		</div>
		<div v-show="currentPool == 'ren'" class='swapBTC-container'>
	        <input id='swapbtc' type='checkbox' value='swapbtc' v-model='swapbtc'/>
	        <label for='swapbtc'>
	        	Withdraw <img :src="publicPath + 'tokens/btc.svg'" class='icon vamiddle'>
	        	<span v-show='hasIncomplete > 0 && swapbtc == false'>
	        		( {{hasIncomplete}} incomplete transactions)
	        	</span>
	        </label>
	    	<span v-show='loading' class='loading line'></span>
	    </div>
	    <withdraw-native v-if='swapbtc' @loaded='loaded'></withdraw-native>
	    <withdraw v-if='!swapbtc || (swapbtc && !loaded)'></withdraw>
    </div>
</template>

<script>
    import { getters, contract as currentContract, gas as contractGas} from '../../contract'
    import * as shiftState from '../ren/shiftState'
	import Withdraw from './Withdraw.vue'

	import LoadingComponent from '../ren/LoadingComponent.vue'
    const WithdrawNative = () => ({
        component: import('../ren/Withdraw.vue'),

        loading: Withdraw,

        delay: 0,
    })

	export default {
		components: {
			Withdraw,
			WithdrawNative,
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
				if(this.swapbtc) return 'WithdrawNative'
				return 'Withdraw'
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
			publicPath() {
                return process.env.BASE_URL
            },
		},

		methods: {
			loaded() {
				if(this.swapComponent == 'WithdrawNative') this.loading = false;
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