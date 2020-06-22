<template>
	<div class = 'tradeview window white'>
		<fieldset id='onesplit'>
			<legend class='text-center'>Swap using all Curve pools</legend>
			<div class='aligncontainer'>
				<div class='info-message gentle-message pulseinfo' v-show='contactUs'>
					We believe there was an issue with your swap. 
					Please contact us on <a href='https://t.me/curvefi'>Telegram</a> or <a href='https://twitter.com/CurveFinance'>Twitter</a>.
				</div>

				<div class='info-message gentle-message betaversion' v-show='swapbtc'>
					This is a beta version. Please test with small amounts and use with caution.
				</div>
				<div class='swapBTC-container info-message gentle-message'>
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
			<one-split v-if='!swapbtc || (swapbtc && !loaded)'/>
		</fieldset>
	</div>
</template>

<script>
	import OneSplit from './OneSplit.vue'
	
	import { contract, init, getters } from '../../contract'
    import * as shiftState from '../ren/shiftState'

	import { updatePoolInfo} from './tradeStore'
	
	const SwapNative = () => ({
        component: import('../ren/Gateway.vue'),

        loading: OneSplit,

        delay: 0,
    })

	export default {
		data: () => ({
			unwatch: null,
			loading: false,
		}),
		computed: {
			currentPool() {
				return getters.currentPool()
			},
			hasIncomplete() {
				return shiftState.hasIncomplete()
			},
			swapbtc: {
				get() {
					return contract.swapbtc
				},
				set(val) {
					contract.swapbtc = val
				},
			},
			publicPath() {
                return process.env.BASE_URL
            },
            contactUs() {
            	return ['0x0f87dd03a74e6a48d56661d96f44880c79b9d795', '0xd157d6f9f904879d44d59bda39503da7e6bfa20a'].map(a => a.toLowerCase())
            		.includes(contract.default_account.toLowerCase())
            },
		},
		async created() {
			this.unwatch = this.$watch(()=>contract.initializedContracts, async (val) => {
				Promise.all(['compound','usdt','iearn','busd','susdv2','pax','ren','sbtc'].map(p=>{
					return init(contract.contracts[p])
				}))
				this.unwatch()
			})
		},
		methods: {
			loaded() {
				if(this.swapComponent == 'SwapNative') this.loading = false;
			},
		},
		components: {
			OneSplit,
			SwapNative,
		}
	}
</script>

<style scoped>
	#select_pool {
		margin-bottom: 10px;
	}
	>>>.exchange {
		width: 80%;
	}
	>>>.trade-buttons {
		margin: 0;
	}
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