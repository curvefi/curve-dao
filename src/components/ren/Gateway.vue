<template>
	<div class='window white rengateway'>
		<div id='modal' class='modal' v-show='showModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='showModal = false'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>QR CODE</legend>
					<vue-qrcode :value="qrValue" :options="qrOptions"></vue-qrcode>
					<button @click='showModal =false'> OK </button>
				</fieldset>
			</div>
		</div>
		<div class='exchange'>

            <div class='exchangefields'>
				<button class='simplebutton' @click='use3Box'>
					<span v-show='space === null'>
						Use permanent storage
						<span class='tooltip'> [?]
							<span class='tooltiptext long'>
								Use 3box instead of local storage
								<!-- Data about ren transaction is stored in local storage, which can be cleared, currently.
								That means if you clear the storage, a loss of funds may occur.
								Using 3box permanent storage is recommended.  -->
							</span>
						</span>
					</span>
					<span v-show='space !== null'>Permanent storage loaded</span>
				</button>

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
                        <li v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'from_cur_'+i" name="from_cur" :value='i' v-model='from_currency'>
                            <label :for="'from_cur_'+i">
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
                    <img src='@/assets/exchange-alt-solid.svg' id='exchangeicon'/>
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
                        <li v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'to_cur_'+i" name="to_cur" :value='i' v-model='to_currency'>
                            <label :for="'to_cur_'+i">
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
            <p class='simple-error' v-show='lessThanMinOrder'>
            	Minimum order size is {{ (minOrderSize / 1e8).toFixed(8) }} 
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

		<div class='info-message gentle-message' v-show='showCompleted'>
			Swap completed
		</div>

		<table class='tui-table'>
			<thead>
				<tr>
					<th>Type</th>
					<th>BTC Address</th>
					<th>Confirmations</th>
					<th>Status</th>
					<th>Progress</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for='transaction in transactions'>
					<td class='shifttype'>
						{{ transaction.type == 0 ? 'BTC->wBTC' : 'wBTC->BTC' }}
					</td>
					<td>
						<span :class="{'loading line': !transaction.gatewayAddress }"></span>
						<span v-show='transaction.gatewayAddress'>
							<span class='hoverpointer'>{{transaction.gatewayAddress}}</span>
							<span class='hoverpointer' v-show='transaction.type == 0' @click='copy(transaction)'>
								<span class='tooltip'>
									<img class='icon small' src='@/assets/copy-solid.svg'>
									<span class='tooltiptext small'>{{ copied == false ? 'Copy' : 'Copied' }}</span>
								</span>
							</span>
							<img class='icon small hoverpointer' v-show='transaction.type == 0'
								@click='showQR(transaction)' src='@/assets/qrcode-solid.svg'>
						</span>
					</td>
					<td>
						<a :href="getTxHashLink(transaction)"> 
							<span v-show='transaction.type == 0 && transaction.state < 10'>{{ transaction.confirmations }} / {{ confirmations }}</span>
							<span v-show='transaction.type == 0 && transaction.state >= 10 && transaction.state < 14'>Confirmed</span>
							<span v-show='transaction.type == 0 && [14,15].includes(transaction.state)'>
								Done
							</span>
							<span v-show='transaction.type == 1 && transaction.state >= 30 && transaction.state < 60'> {{ transaction.confirmations }} / 30 </span>
							<span v-show='transaction.type == 1 && transaction.state == 30'>Started</span>
							<span v-show='transaction.type == 1 && transaction.state > 60'> {{ transaction.confirmations }}  </span>
						</a>
						<div v-show='transaction.type == 0 && transaction.state == 14'>
							<a :href="'https://etherscan.io/tx/' + transaction.ethTxHash">Etherscan</a>
						</div>
					</td>
					<td>
						<tx-state 
							:state='transaction.state' 
							:transaction='transaction'
							@mint='mintThenSwap'/>
					</td>
					<td>
						<span v-show='transaction.type == 0'>
							{{ txProgress(transaction) }}%
							<span :class="{'loading line': transaction.state != 14}"></span>
						</span>
						<span v-show='transaction.type == 1'>
							{{ txProgress(transaction) }}%
							<span :class="{'loading line': transaction.state != 65}"></span>
						</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>	
</template>

<script>
	import Vue from 'vue'
	import { getters, allCurrencies, contract } from '../../contract'
	import RenSDK from '@renproject/ren'
	import BN from 'bignumber.js'
	import TxState from './TxState.vue'
	import * as helpers from '../../utils/helpers'
	import * as common from '../../utils/common'
	import allabis, { ERC20_abi, adapterABI, adapterAddress } from '../../allabis'
	import VueQrcode from '@chenfengyuan/vue-qrcode';


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
			TxState,
			VueQrcode,
		},
		data: () => ({
			toInput: '0.00',
			toInputOriginal: 0,
			address: '',
			sdk: new RenSDK('mainnet'),
			transactions: [],

			minersFee: 35000,
			minersLockFee: 0,
			minersReleaseFee: 0,
			mintFee: 0,
			burnFee: 0,

			default_account: '',
			adapterContract: null,

			confirmations: 6,
			// 1 - getting btc deposit address, 2 - waiting to confirm on btc network, 3 - 
			box: null,
			space: null,
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
            	return (this.fromInput * 1e8 * (1-this.mintFee/10000) - this.minersLockFee) / 1e8 
            },
            amountAfterWBTC() {
            	return (this.toInputOriginal * 1e8 * (1-this.burnFee/10000) - this.minersReleaseFee) / 1e8
            },
            minOrderSize() {
            	return this.minersReleaseFee + this.burnFee / 10000
            },
            lessThanMinOrder() {
            	if(this.from_currency == 0 && this.amountAfterBTC < 0) return true
            	if(this.from_currency == 1 && BN(this.fromInput).times(1e8).lt(BN(this.minOrderSize))) return true	
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
        	showCompleted() {
        		let tx = this.transactions[0]
        		if(!tx) return;
        		return tx.type == 0 && [14,15].includes(tx.state) || tx.type == 1 && tx.state == 65
        	},
        	qrOptions() {
        		return {
        			width: 200,
        			margin: 0,
        			color: {
        				light: '#0000'
        			}
        		}
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

				this.adapterContract = new contract.web3.eth.Contract(adapterABI, adapterAddress)
				this.address = this.default_account = contract.default_account
				if(this.from_currency == 1) this.address = this.default_account
				//console.log(await this.sdk.renVM.sendMessage('ren_queryFees', {}))
				this.from_cur_handler()
				//resume only transactions submitted to btc network
				this.loadTransactions()

				let fees = await this.sdk.getFees()
				this.minersLockFee = fees.btc.lock
				this.minersReleaseFee = fees.btc.release
				this.mintFee = fees.btc.ethereum.mint
				this.burnFee = fees.btc.ethereum.burn

				//this.listenForBurn('0x5c1ebb46dea75421fe3a1afe4349ebb8238c1a6a7bbbd85db6577fd351ee28c7')

				//test wait for burn
				// const burn = this.sdk.burnAndRelease({
				//     // Send BTC from the Ethereum blockchain to the Bitcoin blockchain.
				//     // This is the reverse of shitIn.
				//     sendToken: RenJS.Tokens.BTC.Eth2Btc,

				//     // The web3 provider to talk to Ethereum
				//     web3Provider: web3.currentProvider,

				//     // The transaction hash of our contract call
				//     ethereumTxHash: '0x272e83c156c60cff7a87d1bbc365fee1f05269b0d08c2be0b041115cafbe16f0',
				// })
				// await burn.readFromEthereum()
				// //console.log(burn)
				// //console.log(await burn.queryTx())
				// let promiEvent = await burn.submit()
				// console.log(promiEvent, "PROMI EVENT")
				////promiEvent.on('txHash', hash => console.log(hash)).on('status', status => console.log(status));


			},

			set_max_balance() {
				if(this.from_currency == 0) {
					this.fromInput = 0
					return;
				}
				this.fromInput = BN(this.maxBalance).div(1e8).toFixed(8)
				this.set_to_amount()
			},

			set_from_amount() {

			},

			showQR({ fromInput, gatewayAddress }) {
				this.showModal = true
				this.qrValue = `bitcoin:${gatewayAddress}?amount=${fromInput}`
			},

			getTxHashLink(transaction) {
				let hash = transaction.type == 0 ? 
					'https://blockchain.info/btc/tx/' + transaction.btcTxHash 
					: 'https://etherscan.io/tx/' + transaction.ethTxHash;
				return hash;
			},

			txProgress(transaction) {
        		if(transaction.type == 0) {
        			let progress = transaction.state / 14 * 100 | 0
        			if(progress > 100) progress = 100
        			return [14, 15].includes(transaction.state) ? 100 : progress
        		}
        		if(transaction.type == 1) {
        			let progress = ((transaction.state - 30) / 35) * 100 | 0
        			if(progress > 100) progress = 100
        			return transaction.state == 65 ? 100 : progress
        		}
        	},

			copy(transaction) {
				this.copied = true;
				setTimeout(() => this.copied = false, 600)
				helpers.copyToClipboard(transaction.gatewayAddress)
			},

			async set_to_amount() {
				this.highlight_input();
				let i = this.from_currency
				let j = this.to_currency
				let dx = BN(this.fromInput).times(1e8).toFixed(0,1)
				let original_dx = dx
				let fee = i == 0 ? this.minersLockFee : this.minersReleaseFee
				let ethfee = i == 0 ? this.mintFee : this.burnFee
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
					get_dys.push(contract.swap.methods.get_dy(i, j, BN(this.fromInput).times(1e8).minus(fee).times(ethfee).toFixed(0,1)).encodeABI())
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

			},

			async from_cur_handler() {
				this.address = ''
				if(this.from_currency == 0) this.address = this.default_account
                let currentAllowance = BN(await contract.coins[1].methods.allowance(this.default_account, adapterAddress).call())
                let maxAllowance = contract.max_allowance.div(BN(2))
                if (currentAllowance.gt(maxAllowance))
                    this.inf_approval = true;
                else
                    this.inf_approval = false;

                await this.setMaxBalance();
                await this.set_to_amount();
            },

			async setMaxBalance() {
				let balance = await contract.coins[1].methods.balanceOf(this.default_account).call()
				this.maxBalance = this.default_account ? balance : 0
				//console.log(this.maxBalance)
			},

			async setAmount() {
				let i = this.from_currency
				let j = this.to_currency
				let get_dy = await contract.swap.methods.get_dy(i, j, amount).call()
				this.toInput = BN(get_dy).div(1e8).toFixed(8);
			},

			async loadTransactions() {
				let items = await this.getAllItems()
				this.transactions = Object.values(await this.getAllItems()).sort((a, b) => b.timestamp - a.timestamp)
				let mints = this.transactions.filter(t => t.btcTxHash && ![14,15].includes(t.state)).map(t=>this.sendMint(t))
				console.log(mints, "MINTS")
				let burns = this.transactions.filter(t => !t.btcTxHash && t.ethTxHash && t.state != 65)
				if(burns.length) {
					web3.eth.subscribe('newBlockHeaders')
						.on('data', block => {
							for(let transaction of burns) {
								console.log(transaction, "TRANSACTION")
								if(transaction.state > 63 || transaction.confirmations >= 30) continue;
								transaction.confirmations = block.number - transaction.ethStartBlock + 1
								transaction.ethCurrentBlock = block.number
								transaction.state = 30 + transaction.confirmations
								this.upsertTx(transaction)
							}
						})
				}
				burns = burns.map(t=>this.listenForBurn(t.ethTxHash))
				await Promise.all([...mints, ...burns])
			},

			async use3Box() {
				if(this.box !== null) return;
				this.box = await Box.openBox(contract.default_account, contract.web3.currentProvider)
				this.space = await this.box.openSpace('curvebtc')
				this.loadTransactions();
				await this.space.syncDone
			},

			async setItem(key, item) {
				if(this.space !== null) {
					return await this.space.private.set(key, JSON.stringify(item))
				}
				return localStorage.setItem(key, JSON.stringify(item))
			},

			async getItem(key) {
				if(this.space !== null) return await this.space.private.get(key)
				return localStorage.getItem(key)
			},

			async getAllItems() {
				let storage = localStorage
				if(this.space !== null) {
					storage = await this.space.private.all();
				}
				return Object.keys(storage).filter(key => key.startsWith('curvebtc_')).map(k => JSON.parse(storage[k]))
			},

			upsertTx(transaction) {
				let key = 'curvebtc_' + transaction.id
				transaction.web3Provider = null;
				if(transaction.params && transaction.params.web3Provider)
					transaction.params.web3Provider = null;
				transaction.box = null;
				transaction.space = null
				this.setItem(key, transaction)
			},

			async mint() {
				let mint = await this.initMint();
				let transaction = this.transactions[0]
				await this.sendMint(transaction, mint)
			},

			async initMint(transaction) {
				let _minWbtcAmount, _wbtcDestination;
				if(transaction) {
					var { id, amount, nonce, address } = transaction
					_minWbtcAmount = transaction.contractParams[0].value
				}
				else {
					amount = this.from_currency == 0 ? this.amountAfterBTC : this.fromInput;
					address = this.address
					_minWbtcAmount = BN(this.toInput).times(1e8).times(0.99).toFixed(0, 1)
				}
				
				let transfer = {
				    // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
				    sendToken: RenJS.Tokens.BTC.Btc2Eth,

				    // The contract we want to interact with
				    sendTo: adapterAddress,

				    suggestedAmount: RenJS.utils.value(amount, "btc").sats().toNumber(),

				    // The name of the function we want to call
				    contractFn: "mintThenSwap",
				    
				    nonce: nonce || RenJS.utils.randomNonce(),

				    // Arguments expected for calling `deposit`
				    contractParams: [
				        {
			                name: "_minWbtcAmount",
			                type: "uint256",
			                value: _minWbtcAmount,
			            },
			            {
			                name: "_wbtcDestination",
			                type: "address",
			                value: address,
			            },
				    ],
				    
				    // Web3 provider for submitting mint to Ethereum
				    web3Provider: web3.currentProvider,
				}
				const mint = this.sdk.lockAndMint(transfer);
				if(!id) {
					transfer.id = helpers.generateID();
					transfer.timestamp = Date.now()
					transfer.type = 0
					transfer.amount = this.from_currency == 0 ? this.amountAfterBTC : this.fromInput;
					transfer.address = this.address;
					transfer.fromInput = this.fromInput;
					transfer.toInput = this.toInput;
					let tx = {...txObject(), ...transfer}
					this.upsertTx(tx)
					this.transactions.unshift(tx)
				}

				return mint;
			},

			async sendMint(transfer, mint) {

				let transaction = this.transactions.find(t => t.id == transfer.id)
				console.log(transaction)
				//transaction is ready to be sent to eth network
				if(transaction.renResponse && transaction.signature) {
					if(transaction.state == 12 || transaction.state == 14)
						transaction.state = 15
					transaction.confirmations = 'Confirmed'
					this.upsertTx(transaction)
					//await this.mintThenSwap(transfer)
				}
				else {
					console.log("SEND MINT")
					mint = mint || await this.initMint(transfer);

					//transaction initated, but didn't get an address, so updating
					if(!transaction.params) {
						transaction.params = mint.params;
						transaction.gatewayAddress = await mint.gatewayAddress()
						transaction.state = 1
						this.upsertTx(transaction)
					}

					let deposit
					//transaction was submitted to btc network
					if(transaction.btcTxHash && String(transaction.btcTxVOut) !== 'undefined') {
						deposit = await mint.wait(this.confirmations, {
							txHash: transaction.btcTxHash,
							vOut: +transaction.btcTxVOut,
						})
						.on('deposit', deposit => {
							console.log('DEPOSIT SUBMITTED', deposit)
							if(deposit.utxo) {
								let confirmations = deposit.utxo.confirmations
								if(transaction.state == 2) {
									transaction.state = 3;
								}
								else
									transaction.state = 3 + confirmations

								transaction.confirmations = confirmations
								transaction.btcTxHash = deposit.utxo.txHash
								transaction.btcTxVOut = deposit.utxo.vOut
								this.upsertTx(transaction)
							}
						})
					}
					//trasaction not submitted to btc network
					else {
						deposit = await mint.wait(this.confirmations)
										.on('deposit', deposit => {
											console.log("DEPOSIT", deposit)
											if(deposit.utxo) {
												if(transaction.state == 1) {
													transaction.state = 2
												}
												transaction.confirmations = deposit.utxo.confirmations
												transaction.btcTxHash = deposit.utxo.txHash
												transaction.btcTxVOut = deposit.utxo.vOut
												this.upsertTx(transaction)
											}
										})
					}

					transaction.state = 10

					let signature = await deposit.submit()
					transaction.state = 11
					transaction.renResponse = signature.renVMResponse;
					transaction.signature = signature.signature
					transaction.utxoAmount = transaction.renResponse.autogen.amount
					this.upsertTx(transaction)
					this.mintThenSwap(transaction)
				}
			},

			async mintThenSwap({ id, amount, params, utxoAmount, renResponse, signature }) {
				let transaction = this.transactions.find(t => t.id == id);
				let min_amount = params.contractCalls[0].contractParams[0].value
				
				let get_dy = await contract.swap.methods.get_dy(0, 1, BN(amount).times(1e8).toFixed(0, 1)).call()

				await new Promise((resolve, reject) => {
					return this.adapterContract.methods.mintThenSwap(
						params.contractCalls[0].contractParams[0].value,
						params.contractCalls[0].contractParams[1].value,
						utxoAmount,
						renResponse.autogen.nhash,
						signature,
					).send({
						from: this.default_account
					})
					.once('transactionHash', resolve)
					.once('receipt', () => {
						//this.transactions = this.transactions.filter(t => t.id != id)
						transaction.state = 14
						transaction.ethTxHash = receipt.transactionHash
						this.upsertTx(transaction)
					})
					.on('error', err => {
						transaction.state = 16;
						this.upsertTx(transaction)
					})
					.catch(err => reject(err))
				})

				transaction.state = 12

				if(get_dy < min_amount) transaction.state = 13
				this.upsertTx(transaction)
				
			},

			async burn() {
				await common.approveAmount(contract.coins[1], 
					BN(this.fromInput).times(1e8), 
					this.default_account, adapterAddress)
				console.log(RenJS.utils.BTC.addressToHex(this.address),
					BN(this.fromInput).times(1e8),
					BN(this.toInputOriginal))
				let id = helpers.generateID();
				let txhash = await new Promise((resolve, reject) => {
					return this.adapterContract.methods.swapThenBurn(
						RenJS.utils.BTC.addressToHex(this.address),
						BN(this.fromInput).times(1e8).toFixed(0, 1),
						BN(this.toInputOriginal).times(0.97).toFixed(0, 1),
					).send({
						from: this.default_account,
						gas: 600000,
					})
					.once('transactionHash', resolve)
					.once('receipt', receipt => {
						this.listenForBurn(receipt.transactionHash)
						let transaction = this.transactions.find(t => t.id == id)
						let startBlockNumber = receipt.blockNumber
						transaction.confirmations = 1
						transaction.ethStartBlock = startBlockNumber
						this.upsertTx(transaction)
						let subscription = web3.eth.subscribe('newBlockHeaders')
							.on('data', block => {
								if(transaction.confirmations == 30) subscription.unsubcribe()
								transaction.confirmations = block.number - transaction.ethStartBlock + 1
								transaction.ethCurrentBlock = block.number
								transaction.state = 30 + transaction.confirmations
								this.upsertTx(transaction)
							})
					})
					.catch(err => reject(err))
				})
				this.transactions.unshift({
					id: id,
					timestamp: Date.now(),
					type: 1,
					gatewayAddress: this.address,
					confirmations: 'Started',
					state: 30,
					ethTxHash: txhash,
				})
				let tx = this.transactions[0]
				this.upsertTx(tx)
				

			},
			async listenForBurn(ethTxHash) {
				console.log(ethTxHash, "TX HASH")

				let tx = this.transactions.find(t => t.ethTxHash == ethTxHash)
				let burn = await this.sdk.burnAndRelease({
				 	sendToken: RenJS.Tokens.BTC.Eth2Btc,

				    // The web3 provider to talk to Ethereum
				    web3Provider: web3.currentProvider,

				    // The transaction hash of our contract call
				    ethereumTxHash: ethTxHash,
				}).readFromEthereum()
				let promiEvent = await burn.submit()
				.on('txHash', hash => {
					let tx = this.transactions.find(t => t.ethTxHash == ethTxHash)
					console.log(hash)
					tx.renVMHash = hash
					//tx.state = 31
					this.upsertTx(tx)
				})
				.on('status', status => {
					let tx = this.transactions.find(t => t.ethTxHash == ethTxHash)
					if(status == 'confirming' && tx.state >= 62) {
						tx.confirmations = "Confirming"
						tx.state = 62
						this.upsertTx(tx)
					}
					if(status == 'pending') {
						tx.confirmations = "Pending"
						tx.state = 63
						this.upsertTx(tx)
					}
					if(status == 'executing') {
						tx.confirmations = "Executing"
						tx.state = 64
						this.upsertTx(tx)
					}
					console.log(status)
				})
				tx.state = 65
				tx.confirmations = "Done"
				this.upsertTx(tx)

				// setInterval(async () => {
				// 	console.log("BURN LOG")
				// 	let res = await burn.queryTx()
				// 	console.log(res, "BURN RES")
				// 	if(res.txStatus.toLowerCase() == 'confirming') tx.state = 12
				// 	if(res.txStatus.toLowerCase() == 'done' || res.txStatus.toLowerCase() == 'confirmed') tx.state = 13
				// 	tx.confirmations = res.txStatus
				// 	this.upsertTx(tx)
				// }, 1000)
			},

			async submit() {
				if(this.from_currency == 0) this.mint()
				if(this.from_currency == 1) this.burn()
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
	.shifttype {
		white-space: nowrap;
	}
	.window.white.rengateway {
		width: 80%;
		max-width: 700px;
	}
	tbody tr td {
		padding-bottom: 0.6em;
	}
	.icon.small {
		height: 1em;
	}
	.hoverpointer {
		cursor: pointer;
	}
	.modal-content {
		text-align: center;
		padding: 0;
		border: none;
		width: 260px;
	}
	.modal-content fieldset {
		color: white;
		font-weight: bolder;
		border: 6px double white;
		padding-block-start: 1em;
		padding-block-end: 1em;
	}
	.modal-content button {
		margin-top: 0.6em;
		padding: 0 2em;
	}
	.legend2 {
	  position: absolute;
	  top: 0;
	  left: 2em;
	  background: #c0c0c0;
	  line-height:1.2em;
	}
	.greentext {
		color: green;
	}
	.tooltiptext.small {
		width: 70px;
		margin-left: -35px;
	}
	.legend2 .greentext {
		display: inline-block;
		transform: translate3d(0,-0.1em,10em);
	}
	.legend2 .greentext:hover {
		transform: none;
	}
</style>