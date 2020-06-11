<template>
	<div class='window white'>
		<div class='aligncontainer'>
			<div class='info-message gentle-message betaversion' v-show='swapbtc'>
				This is a beta version. Please test with small amounts and use with caution.
			</div>
			<div v-show="currentPool == 'ren'" class='swapBTC-container'>
		        <input id='swapbtc' type='checkbox' value='swapbtc' v-model='swapbtc'/>
		        <label for='swapbtc'>
		        	Swap <img :src="publicPath + 'tokens/btc.svg'" class='token-icon vamiddle'>
		        	<span v-show='hasIncomplete > 0 && swapbtc == false'>
		        		( {{hasIncomplete}} incomplete transactions)
		        	</span>
		        </label>
		    	<span v-show='loading' class='loading line'></span>
		    </div>
		</div>
	    <swap-native v-if='swapbtc' @loaded='loaded'></swap-native>
	    <swap v-if='!swapbtc || (swapbtc && !loaded)'></swap>
    </div>
</template>

<script>
    import { getters, contract as currentContract, gas as contractGas} from '../../contract'
    import * as shiftState from '../ren/shiftState'
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
			loading: false,
		}),

		created() {
			if(this.$route.path.includes('native')) this.swapbtc = true
		},

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
	.aligncontainer {
		margin: 0 auto;
		width: 80%;
	}
</style>