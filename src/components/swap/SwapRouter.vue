<template>
	<div class='window white'>
	    <swap-native v-if='swapbtc' @loaded='loaded'></swap-native>
	    <swap v-if='!swapbtc || (swapbtc && !loaded)'></swap>
		<div v-show="currentPool == 'ren'" class='swapBTC-container'>
	        <input id='swapbtc' type='checkbox' value='swapbtc' v-model='swapbtc'/>
	        <label for='swapbtc'>Swap BTC</label>
	    	<span v-show='loading' class='loading line'></span>
	    </div>
    </div>
</template>

<script>
    import { getters, contract as currentContract, gas as contractGas} from '../../contract'
	import Swap from './Swap.vue'

	import LoadingComponent from '../ren/LoadingComponent.vue'
    const SwapNative = () => ({
        component: import('../ren/Gateway.vue'),

        loading: Swap,

        delay: 0,
    })

	export default {
		components: {
			Swap,
			SwapNative,
		},


		data: () => ({
			swapbtc: true,
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
				if(this.swapbtc) return 'SwapNative'
				return 'Swap'
			},
			currentPool() {
				return getters.currentPool()
			},
		},

		methods: {
			loaded() {
				if(this.swapComponent == 'SwapNative') this.loading = false;
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