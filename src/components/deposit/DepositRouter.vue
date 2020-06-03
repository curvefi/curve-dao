<template>
	<div class='window white'>
	    <deposit-native v-if='swapbtc' @loaded='loaded'></deposit-native>
	    <deposit v-if='!swapbtc || (swapbtc && !loaded)'></deposit>
		<div v-show="currentPool == 'ren'" class='swapBTC-container'>
	        <input id='swapbtc' type='checkbox' value='swapbtc' v-model='swapbtc'/>
	        <label for='swapbtc'>Deposit BTC</label>
	    	<span v-show='loading' class='loading line'></span>
	    </div>
    </div>
</template>

<script>
    import { getters, contract as currentContract, gas as contractGas} from '../../contract'
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
			swapbtc: false,
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