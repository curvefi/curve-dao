<template>
    <div>
        <p class='simple-error pulse' v-show='errorMessage'>
            {{errorMessage}}
        </p>
    	<div id='gas_price' v-show='gasPriceMedium'><span>Gas price:</span>
            <input id="gasstandard" type="radio" name="gas" :value='gasPriceMedium' @click='gasPrice = gasPriceMedium'>
            <label for="gasstandard">{{Math.round(gasPriceMedium)}} Standard</label>

            <input id="gasfast" type="radio" name="gas" checked :value='gasPriceFast' @click='gasPrice = gasPriceFast'>
            <label for="gasfast">{{Math.round(gasPriceFast)}} Fast</label>

            <input id="gasinstant" type="radio" name="gas" :value='gasPriceFastest' @click='gasPrice = gasPriceFastest'>
            <label for="gasinstant">{{Math.round(gasPriceFastest)}} Instant</label>

            <input id="custom_gas" type="radio" name="gas" value='-' @click="gasPrice = ''">
            <label for="custom_gas" @click="gasPrice = ''">
                <input type="text" id="custom_gas_input" 
                    :disabled='customGasDisabled'
                    name="custom_gas_input"
                    :value = 'customGasPriceInput'
                   	@input='gasPrice = $event.target.value'>
            </label>
        </div>
    </div>
</template>

<script>
	import { state } from './gasPriceStore'
    import { state as errorState } from './errorStore'

	import BN from 'bignumber.js'

	export default {
		data: () => ({
			gasPriceInterval: null,
		}),

		computed: {
			gasPriceMedium() {
                return state.gasPriceInfo && state.gasPriceInfo.medium || 20
            },
            gasPriceFast() {
                return state.gasPriceInfo && state.gasPriceInfo.fast || 25
            },
            gasPriceFastest() {
                return state.gasPriceInfo && state.gasPriceInfo.fastest || 30
            },
            customGasDisabled() {
            	console.log(Object.values(state.gasPriceInfo))
            	return Object.values(state.gasPriceInfo).includes(state.gasPrice)
            },
            gasPrice: {
            	get() {
            		return state.gasPrice
            	},
            	set(val) {
            		state.gasPrice = val
            	},
            },
            customGasPriceInput() {
            	if(this.customGasDisabled) return ''
            	return this.gasPrice
            },
            errorMessage() {
                setTimeout(() => errorState.txError = null, 2200)
                return errorState.txError
            },
		},

		async created() {
            this.getGasPrice()
            this.gasPriceInterval && clearInterval(this.gasPriceInterval)
            this.gasPriceInterval = setInterval(() => this.getGasPrice(), 3000)
			this.$watch(() => state.gasPrice, val => {
				state.gasPriceWei = BN(val).times(1e9).toFixed(0,1)
			}, {
				immediate: true,
			})
		},

        methods: {
            async getGasPrice() {
                try {
                    let gasPriceInfo = await fetch('https://fees.upvest.co/estimate_eth_fees')
                    gasPriceInfo = await gasPriceInfo.json()
                    state.gasPriceInfo = gasPriceInfo.estimates
                }
                catch(err) {
                    let gasPrice = (await web3.eth.getGasPrice()) / 1e9;
                    state.gasPriceInfo = {
                        medium: gasPrice,
                        fast: gasPrice + 2,
                        fastest: gasPrice + 4,
                    } 
                }
                state.gasPrice = state.gasPriceInfo.fast
            }
        },

	}
</script>

<style scoped>
    .pulse {
        animation: pulse 1s 3;
        margin-bottom: 8px;
    }
</style>