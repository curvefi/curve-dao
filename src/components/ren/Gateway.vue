<template>
	<div class='rengateway'>
		
		<div class='exchange'>

            <div class='exchangefields'>

				<div class='flexbreak'></div>

                <fieldset class='item'>
                    <legend>From:</legend>
                    <div class='maxbalance' @click='set_max_balance'>Max: <span>{{maxBalanceText}}</span> </div>
                    <ul>
                        <li>
                            <input type="text" id="from_currency" :disabled='disabled' name="from_currency" value='0.00'
                            :style = "{backgroundColor: fromBgColor}"
                            @input='set_to_amount'
                            v-model='fromInput'>
                        </li>
                        <li class='coins' v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'from_cur_'+i" name="from_cur" :value='i' v-model='from_currency'>
                            <label :for="'from_cur_'+i">
                            	<img 
                                    :class="{'token-icon': true, [currency+'-icon']: true}" 
                                    :src='getTokenIcon(currency)'>
                                <span>{{currency | capitalize}}</span>
                            </label>
                        </label>
                        </li>
                        <div v-show='from_currency == 0 && amountAfterBTC >= 0' class='amount-after-fees'> 
                        	Amount after renVM fees: {{amountAfterBTC.toFixed(8)}}
                        </div>
                    </ul>
                </fieldset>
                <fieldset class='item iconcontainer' @click='swapInputs'>
                    <img :src="publicPath + 'exchange-alt-solid.svg'" id='exchangeicon'/>
                </fieldset>
                <fieldset class='item'>
                    <legend>To:</legend>
                    <div class='maxbalance2'>Max: <span></span> </div>
                    <ul>
                        <li>
                            <input type="text" 
                            id="to_currency" 
                            name="to_currency" 
                            value="0.00" 
                            disabled
                            :style = "{backgroundColor: bgColor}"
                            :value = 'toInputFormat'>
<!--                             <p class='actualvalue' v-show='swapwrapped'>
                                ≈ {{actualToValue}} {{Object.keys(currencies)[this.to_currency] | capitalize}}
                            </p> -->
                        </li>
                        <li class='coins' v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'to_cur_'+i" name="to_cur" :value='i' v-model='to_currency'>
                            <label :for="'to_cur_'+i">
                            	<img 
                                    :class="{'token-icon': true, [currency+'-icon']: true}" 
                                    :src='getTokenIcon(currency)'>
                                <span>{{currency | capitalize}}</span>
                            </label>
                        </label>
                        </li>
                        <div v-show='from_currency == 1 && amountAfterWBTC >= 0' class='amount-after-fees'>
                        	Amount after renVM fees: {{amountAfterWBTC.toFixed(8)}}
                        </div>
                    </ul>
                </fieldset>
            </div>
            <p class='exchange-rate'>Exchange rate (including fees and renVM fee): 
            	<span id="exchange-rate" v-show='!lessThanMinOrder'>{{ exchangeRate && exchangeRate.toFixed(4) }}</span>
            	<span v-show='lessThanMinOrder'>N/A</span>
            </p>
            <p class='exchange-rate'>Exchange rate (including fees): 
            	<span id="exchange-rate" v-show='!lessThanMinOrder'>{{ exchangeRateOriginal && exchangeRateOriginal.toFixed(4) }}</span>
            	<span v-show='lessThanMinOrder'>N/A</span>
            </p>
            <div id='max_slippage'><span>Max slippage:</span> 
                <input id="slippage05" type="radio" name="slippage" value='0.005' @click='maxSlippage = 0.5; customSlippageDisabled = true'>
                <label for="slippage05">0.5%</label>

                <input id="slippage1" type="radio" name="slippage" checked value='0.01' @click='maxSlippage = 1; customSlippageDisabled = true'>
                <label for="slippage1">1%</label>

                <input id="custom_slippage" type="radio" name="slippage" value='-' @click='customippageDisabled = false'>
                <label for="custom_slippage" @click='customSlippageDisabled = false'>
                    <input type="text" id="custom_slippage_input" :disabled='customSlippageDisabled' name="custom_slippage_input" v-model='maxInputSlippage'> %
                </label>
            </div>
            <p class='simple-error' v-show='lessThanMinOrder && from_currency == 0'>
            	Minimum mint order size is {{ (minOrderSize / 1e8).toFixed(8) }} 
            </p>
            <p class='simple-error' v-show='lessThanMinOrder && from_currency == 1'>
            	Minimum burn order size is {{ (minOrderSize / 1e8 + 0.00000547).toFixed(8) }}
            </p>
            <div class='input address'>
				<label for='address'>{{ from_currency == 1 ? 'BTC withdrawal' : 'ETH' }} address</label>
				<input id='address' type='text' v-model='address' placeholder='Address' :style='addressStyle'>
			</div>
	     	<ul class='infiniteapproval'>
	            <li>
	                <input id="inf-approval" type="checkbox" name="inf-approval" v-model='inf_approval'>
	                <label for="inf-approval">Infinite approval - trust this contract forever
	                    <span class='tooltip'>[?]
	                        <span class='tooltiptext long'>
	                            Preapprove the contract to to be able to spend any amount of your coins. You will not need to approve again.
	                        </span>
	                    </span>
	                </label>
	            </li>
	        </ul>
        </div>

		<button class='swap' @click='submit' :disabled='swapDisabled'>Swap</button>

		<tx-table></tx-table>

		
	</div>	
</template>

<script>
	import Vue from 'vue'
	import { getters, allCurrencies, contract } from '../../contract'
	import RenSDK from '@renproject/ren'
	import BN from 'bignumber.js'
	import * as helpers from '../../utils/helpers'
	import * as common from '../../utils/common'
	import allabis, { ERC20_abi, adapterABI, adapterAddress } from '../../allabis'
	let Box = null
	import * as subscriptionStore from '../common/subscriptionStore'
	import Table from './Table.vue'
	import * as store from './shiftStore'
	import { state } from './shiftState'

	
	const txObject = () => ({
		id: '',
		timestamp: null,
		type: '',
		amount: '',
		fromInput: 0,
		toInput: 0,
		toAmount: 0,
		address: '',
		params: '',
		ethTxHash: '',
		ethStartBlock: null,
		ethCurrentBlock: null,
		ethConfirmations: null,
		renVMHash: '',
		gatewayAddress: '',
		confirmations: 0,
		// 0 - waiting for renVM gateway address, 1 - waiting for deposit on BTC address, 2 - got BTC transaction, waiting for confirmation
		// 3 - waiting for renVM to do it's magic and shift, 4 - got renBTC, now initiating swap, 5 - swap ready
		state: 0,
		btcTxHash: '',
		btcTxVOut: '',
		renResponse: '',
		signature: '',
	})

	export default {
		components: {
			'tx-table': Table,
		},
		data: () => ({
			toInput: '0.00',
			toInputOriginal: 0,
			address: '',

			confirmations: 6,
			// 1 - getting btc deposit address, 2 - waiting to confirm on btc network, 3 - 
			box: null,
			showModal: false,
			qrValue: null,


			maxBalance: 0,
			disabled: false,
			fromInput: '0.001',
			from_currency: 1,
			to_currency: 0,
			get_dy_original: '',
			fromBgColor: '',
			bgColor: '',
			maxSlippage: 1,
            maxInputSlippage: '',
            customSlippageDisabled: true,
			swapwrapped: false,
			currencies: {
				btc: 'BTC',
				wbtc: 'WBTC',
			},
			copied: false,
			inf_approval: false,
			promise: helpers.makeCancelable(Promise.resolve()),
		}),
		computed: {
			swapDisabled() {
				return this.lessThanMinOrder || (this.from_currency == 1 && !this.address)
			},
			maxBalanceText() {
				if(this.from_currency == 0) return 'N/A'
				return BN(this.maxBalance).div(1e8).toFixed(8)
			},
			exchangeRate() {
            	return this.toInput / this.fromInput
            },
            exchangeRateOriginal() {
            	return this.toInputOriginal / this.fromInput
            },
            amountAfterBTC() {
            	return (this.fromInput * 1e8 * (1-state.mintFee/10000) - state.minersLockFee) / 1e8 
            },
            amountAfterWBTC() {
            	return (this.toInputOriginal * 1e8 * (1-state.burnFee/10000) - state.minersReleaseFee) / 1e8
            },
            minOrderSize() {
            	return state.minersReleaseFee + state.burnFee / 10000
            },
            lessThanMinOrder() {
            	if(this.from_currency == 0 && this.amountAfterBTC < 0) return true
            	if(this.from_currency == 1 && (this.fromInput * 1e8 * (1-state.burnFee/10000)) < 35547) return true	
            },
        	toInputFormat() {
        		if(!this.toInput || typeof this.toInput == 'string') return '0.00'
        		return +this.toInput.toFixed(8) 
        	},
        	addressStyle() {
        		if(this.from_currency == 0) {
        			return {
        				background: '#505070',
    					color: '#d0d0d0',
        			}
        		}
        		else return {}
        	},
        	publicPath() {
                return process.env.BASE_URL
            },
		},
		watch: {
			from_currency(val, oldval) {
                if(val == this.to_currency) {
                    this.to_currency = oldval;
                }

                if(this.from_currency == 0) this.fromBgColor = 'blue'
                
                this.from_cur_handler()
            },
            async to_currency(val, oldval) {
            	if(val == this.from_currency) {
            		if (this.to_currency == 0) {
                        this.from_currency = 1;
                    } else {
                        this.from_currency = 0;
                    }
            	}
            	await this.from_cur_handler()
            },
		},
		created() {
			this.$watch(() => contract.initializedContracts, val => {
				if(!val) return;
				this.mounted()
			})
		},
		mounted() {
			this.$emit('loaded')
			let modal = document.querySelector('#modal')
			window.addEventListener('click', () => {
				if (event.target == modal) {
					this.showModal = false
			  	}
			})
			contract.initializedContracts && this.mounted()
		},
		methods: {
			async mounted() {
				if(this.from_currency == 1) this.address = contract.default_account
				this.from_cur_handler()
			},

			set_max_balance() {
				if(this.from_currency == 0) {
					this.fromInput = 0
					return;
				}
				this.fromInput = BN(this.maxBalance).div(1e8).toFixed(8)
				this.set_to_amount()
			},

			getTokenIcon(token) {
                return helpers.getTokenIcon(token, this.swapwrapped, this.currentPool)
            },

			async set_to_amount() {
				this.highlight_input();
				let i = this.from_currency
				let j = this.to_currency
				let dx = BN(this.fromInput).times(1e8).toFixed(0,1)
				let original_dx = dx
				let fee = i == 0 ? state.minersLockFee : state.minersReleaseFee
				let ethfee = i == 0 ? state.mintFee : state.burnFee
				ethfee = 1 - ethfee/10000
				dx = BN(this.fromInput).times(1e8).times(ethfee).minus(fee).toFixed(0,1)

				//case WBTC -> BTC
					//swapping the entered WBTC amount and then from result subtract fees
				//case BTC -> WBTC
					//subtract fees and then do SWAP
				if(this.lessThanMinOrder) {
					this.toInput = 0;
					return;
				}
				let get_dy_original = contract.swap.methods.get_dy(i, j, BN(this.fromInput).times(1e8).toFixed(0,1)).encodeABI()
				let get_dys = [get_dy_original]
				if(this.from_currency == 0) {
					get_dys.push(contract.swap.methods.get_dy(i, j, BN(this.amountAfterBTC).times(1e8).toFixed(0,1)).encodeABI())
				}
				this.promise.cancel()
				let calls = get_dys.map(call => [contract.swap._address, call])
				let promise = contract.multicall.methods.aggregate(calls).call()
				this.promise = helpers.makeCancelable(promise)
				try {
					let result = await promise
					result = result[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
					if(this.from_currency == 0) {
						let [dy_original, dy] = result.map(v=>v / 1e8)
						this.toInput = dy
						this.toInputOriginal = dy_original
					}
					else {
						this.toInput = (result - fee)*ethfee / 1e8
						this.toInput = result / 1e8
						this.toInputOriginal = result / 1e8
					}
				}
				catch(err) {
					console.error(err)
				}
			},

			highlight_input() {
				if(this.from_currency == 0) return;
				if(this.fromInput > this.maxBalance / 1e8) {
					this.fromBgColor = 'red'
				}
				else {
					this.fromBgColor = 'blue'
				}
			},

			swapInputs() {
				[this.fromInput, this.toInput] = [this.toInput, this.fromInput]
                this.from_currency = this.to_currency
                this.from_cur_handler()
			},

			async from_cur_handler() {
				this.address = ''
				if(this.from_currency == 0) this.address = contract.default_account
                let currentAllowance = BN(await contract.coins[1].methods.allowance(contract.default_account, adapterAddress).call())
                let maxAllowance = contract.max_allowance.div(BN(2))
                if (currentAllowance.gt(maxAllowance))
                    this.inf_approval = true;
                else
                    this.inf_approval = false;

                await this.setMaxBalance();
                await this.set_to_amount();
            },

			async setMaxBalance() {
				let balance = await contract.coins[1].methods.balanceOf(contract.default_account).call()
				this.maxBalance = contract.default_account ? balance : 0
				//console.log(this.maxBalance)
			},

			async setAmount() {
				let i = this.from_currency
				let j = this.to_currency
				let get_dy = await contract.swap.methods.get_dy(i, j, amount).call()
				this.toInput = BN(get_dy).div(1e8).toFixed(8);
			},

			async submit() {
				let maxSlippage = this.maxSlippage;
                if(this.maxInputSlippage) maxSlippage = this.maxInputSlippage;
				if(this.from_currency == 0) {
                	var min_dy = this.toInput * (1-maxSlippage)
					store.mint({
						from_currency: this.from_currency,
						amountAfterBTC: this.amountAfterBTC,
						address: this.address,
						fromInput: this.fromInput,
						toInput: this.toInput,
						slippage: maxSlippage * 10,
					})
				}
				if(this.from_currency == 1) 
					store.burnSwap({
						address: this.address,
						fromInput: this.fromInput,
						toInputOriginal: this.toInputOriginal,
					})
			}
		}
	}
</script>

<style scoped>
	label[for='getbtc'] {
		margin-left: 1em;
	}
	.input {
		margin-top: 1em;
	}
	.input input {
		display: block;
	}
	#amount {
		width: 100px;
	}
	#address {
		width: 600px;
	}
	.flexbreak {
		width: 100%;
		height: 0;
	}
	button.swap {
		display: block;
		margin: 0 auto;
		margin-top: 1em;
	}
	.tui-table {
		width: 100%;
		margin-top: 1em;
	}
	.simplebutton {
		margin-bottom: 1em;
	}
	#result {
		margin-top: 1em;
	}
	#result > div {
		margin-top: 0.3em;
	}
	.exchange-rate {
		text-align: left;
	}
	.exchange-rate {
		margin-top: 0.5em;
		margin-bottom: 0;
	}
	.input.address {
		margin-bottom: 1em;
	}
	.infiniteapproval {
		margin-top: 1em;
	}
	input[type=radio] + label[for]:before, input[type=checkbox] + label[for]:before {
		width: auto;
	}
	.exchangefields input[type=radio] + label[for]:before {
		margin-right: 0.5em;
	}
	.amount-after-fees {
		margin-top: 0.5em;
	}
	.maxbalance {
		cursor: pointer;
	}
	.maxbalance:hover {
		text-decoration: underline;
	}
	.window.white.rengateway {
		width: 80%;
		max-width: 700px;
	}
</style>
