<template>
	<div>
		<div class="window white add-liquidity">
            <fieldset class="currencies">
                <legend>Currencies:</legend>
                <ul>
                    <li v-for='(currency, i) in Object.keys(currencies)'>
                        <label :for="'currency_'+i">
                        	<span v-show='depositc'>
                        		{{currencies[currency]}} 
	                        	<span v-show="!(currency == 'usdt' && currentPool == 'usdt' || currency == 'pax') 
	                        					&& !['susdv2', 'tbtc'].includes(currentPool)"> 
	                        		(in {{currency | capitalize}}) 
	                        	</span>
	                        </span>
	                        <span v-show='!depositc'>
	                        	{{currency | capitalize}}
	                        </span>
                        </label>
                        <input 
	                        type="text" 
	                        :id="'currency_'+i" 
	                        :disabled='disabled' 
	                        name="from_cur" 
	                        v-model = 'inputs[i]'
	                        :style = "{backgroundColor: bgColors[i]}"
	                        @input='change_currency(i, true)'
	                    >
                    </li>
                </ul>
            </fieldset>
            <ul>
                <li>
                    <input id="sync-balances" type="checkbox" name="sync-balances" @change='handle_sync_balances_proportion' :disabled='disabledButtons' checked v-model='sync_balances'>
                    <label for="sync-balances">Add all coins in a balanced proportion</label>
                </li>
                <li>
                    <input id="max-balances" type="checkbox" name="max-balances" @change='handle_sync_balances' :disabled='disabledButtons' checked v-model='max_balances'>
                    <label for="max-balances">Use maximum amount of coins available</label>
                </li>
                <li>
                    <input id="inf-approval" type="checkbox" name="inf-approval" checked v-model='inf_approval'>
                    <label for="inf-approval">Infinite approval - trust this contract forever 
                    	<span class='tooltip'>[?]
                    		<span class='tooltiptext long'>
                    			Preapprove the contract to to be able to spend any amount of your coins. You will not need to approve again.
                    		</span>
                    	</span>
                    </label>
                </li>
                <li v-show = "!['susd','susdv2'].includes(currentPool)">
                    <input id="depositc" type="checkbox" name="inf-approval" checked v-model='depositc'>
                    <label for="depositc">Deposit wrapped</label>
                </li>
            </ul>

            <p style="text-align: center">
                <button id="add-liquidity" 
                    :disabled="currentPool == 'susdv2' && slippage < -0.03"
                	@click='handle_add_liquidity()' 
                	>
                		Deposit
                </button>
                <button 
                	id='add-liquidity-stake' 
                	v-show="currentPool == 'susdv2'" 
                	:disabled = 'slippage < -0.03'
                	@click = 'deposit_stake'>
                	Deposit and stake
                </button>
                <button id='stakeunstaked' v-show="totalShare > 0 && currentPool == 'susdv2'" @click='stakeTokens()'>Stake unstaked</button>
                <div id='mintr' v-show="currentPool == 'susdv2'">
	                <a href = 'https://mintr.synthetix.io/' target='_blank' rel="noopener noreferrer">Manage staking in Mintr</a>
	            </div>
                <button id="migrate-new" @click='handle_migrate_new' v-show="currentPool == 'compound' && oldBalance > 0">Migrate from old</button>
                <div class='info-message gentle-message' v-show='show_loading'>
                	{{waitingMessage}} <span class='loading line'></span>
                </div>
                <div class='info-message gentle-message' v-show='estimateGas'>
	                Estimated tx cost: {{ (estimateGas * gasPrice / 1e18 * ethPrice).toFixed(2) }}$
	            </div>
                <Slippage/>
            </p>
        </div>
	</div>
</template>

<script>
	import Vue from 'vue'
    import * as common from '../utils/common.js'
    import { getters, contract as currentContract, gas as contractGas } from '../contract'
    import allabis from '../allabis'
    const compound = allabis.compound
    import * as helpers from '../utils/helpers'

    import BN from 'bignumber.js'

    import Slippage from './common/Slippage.vue'

    export default {
    	components: {
    		Slippage,
    	},
    	data: () => ({
    		disabled: true,
    		disabledButtons: true,
    		sync_balances: true,
    		max_balances: true,
    		inf_approval: true,
    		wallet_balances: [],
    		balances: [],
    		inputs: [],
    		amounts: [],
    		bgColors: [],
    		depositc: false,
    		coins: [],
    		rates: [],
    		swap_address: currentContract.swap_address,
    		show_loading: false,
    		waitingMessage: '',
    		estimateGas: 0,
    		gasPrice: 0,
    		ethPrice: 0,
    		slippagePromise: helpers.makeCancelable(Promise.resolve()),
    	}),
        created() {
            this.$watch(()=>currentContract.default_account, (val, oldval) => {
            	if(!val || !oldval) return;
            	if(val.toLowerCase() == oldval.toLowerCase()) return;
                this.mounted();
            })
            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            })
            this.$watch(()=>currentContract.currentContract, (val, oldval) => {
            	this.setInputStyles(false, val, oldval)
            	if(currentContract.initializedContracts) this.mounted();
            })
        },
        watch: {
        	async depositc(val, oldval) {
        		this.changeSwapInfo(val)
        		await this.handle_sync_balances()
        		!this.max_balances && this.highlightAllInputs();
        		//await Promise.all([...Array(currentContract.N_COINS).keys()].map(i=>this.change_currency(i, false)))
        		await this.calcSlippage()
        	}
        },
        computed: {
          ...getters,
        },
        mounted() {
	        this.setInputStyles(true)
            if(currentContract.initializedContracts) this.mounted();
        },
        methods: {
        	async stakeTokens(tokens) {
        		if(!tokens) tokens = BN(await currentContract.swap_token.methods.balanceOf(currentContract.default_account).call());
        		this.waitingMessage = `Please approve staking ${tokens.div(BN(1e18)).toFixed(2,1)} of your sCurve tokens`
				await common.ensure_stake_allowance(tokens);
				this.waitingMessage = 'Waiting for stake transaction to confirm: no further action needed'
				await currentContract.curveRewards.methods.stake(tokens.toFixed(0,1)).send({
					from: currentContract.default_account,
					gas: 200000,
				})
				currentContract.totalShare = 0
				this.waitingMessage = ''
				this.show_loading = false;
			},

            async mounted(oldContract) {

            	if(['susd', 'susdv2'].includes(currentContract.currentContract)) this.depositc = true;
            	this.changeSwapInfo(this.depositc)
            	currentContract.showSlippage = false;
        		currentContract.slippage = 0;
                await this.handle_sync_balances();
                await this.calcSlippage()
                let calls = [...Array(currentContract.N_COINS).keys()].map(i=>[this.coins[i]._address, 
                	this.coins[i].methods.allowance(currentContract.default_account || '0x0000000000000000000000000000000000000000', this.swap_address).encodeABI()])
                let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
                let decoded = aggcalls[1].map(hex => currentContract.web3.eth.abi.decodeParameter('uint256', hex))
                if(decoded.some(v=>BN(v).lte(currentContract.max_allowance.div(BN(2))) > 0))
                	this.inf_approval = false
                this.disabledButtons = false;
            },
        	inputsFormat(i) {
        		if(this.inputs[i]) {
        			return (+this.inputs[i]).toFixed(2)
        		}
        		return '0.00'
        	},
            changeSwapInfo(val) {
            	if(val) {
	            	this.coins = currentContract.coins
	            	this.rates = currentContract.c_rates
	            	this.swap_address = currentContract.swap_address
        		}
            	else {
            		this.coins = currentContract.underlying_coins
            		this.rates = currentContract.coin_precisions.map(cp=>1/cp)
            		this.swap_address = currentContract.deposit_zap._address
            	}
            },
            setInputStyles(newInputs = false, newContract, oldContract) {
				if(oldContract) {
					for(let i = 0; i < allabis[newContract].N_COINS - allabis[oldContract].N_COINS; i++) {
						this.inputs.push('0.00')
					}
					if(allabis[oldContract].N_COINS - allabis[newContract].N_COINS > 0) {
						this.inputs = this.inputs.filter((_, i) => i < allabis[newContract].N_COINS)
					}
				}
				else if(newInputs) {
					this.inputs = new Array(Object.keys(this.currencies).length).fill('0.00')
				}
	        	this.bgColors = Array(currentContract.N_COINS).fill({
	        		backgroundColor: '#707070',
	        		color: '#d0d0d0',
	        	})
            },
            async calcSlippage() {
            	try {
	            	this.slippagePromise.cancel();
	        		this.slippagePromise = helpers.makeCancelable(common.calc_slippage(this.inputs, true))
	        		await this.slippagePromise;
            	}
            	catch(err) {
            		console.error(err)
            	}
            },
            async handle_sync_balances() {
			    await common.update_fee_info();
			    let calls = []
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			    	calls.push([this.coins[i]._address, this.coins[i].methods.balanceOf(currentContract.default_account || '0x0000000000000000000000000000000000000000').encodeABI()])
			    	calls.push([currentContract.swap._address, currentContract.swap.methods.balances(i).encodeABI()])
			    }
			    let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
			    let decoded = aggcalls[1].map(hex => currentContract.web3.eth.abi.decodeParameter('uint256', hex))
			    helpers.chunkArr(decoded, 2).map((v, i) => {
			    	Vue.set(this.wallet_balances, i, +v[0])
			    	if(!currentContract.default_account) Vue.set(this.wallet_balances, i, 0)
			    	Vue.set(this.balances, i, +v[1])
			    })
			    if (this.max_balances) {
			        this.disabled = true;
			        for (let i = 0; i < currentContract.N_COINS; i++) {
			        	let amount = this.wallet_balances[i] * currentContract.c_rates[i]
			        	if(!this.depositc) amount = this.wallet_balances[i] / allabis[currentContract.currentContract].coin_precisions[i]
			            var val = amount
			            var val = Math.floor(amount * 100) / 100;
			            if(val == 0) val = '0.00'
			            Vue.set(this.inputs, i, val)
			        }
			    }
			    else
			        this.disabled = false;
			},
			async handle_sync_balances_proportion() {
				await this.handle_sync_balances();
				//for(let i = 0; i < currentContract.N_COINS; i++) this.change_currency(i)
			},
			deposit_stake() {
				this.show_loading = true;
				this.handle_add_liquidity(true)
			},
			async handle_add_liquidity(stake = false) {
                let promises = await Promise.all([helpers.getETHPrice(), currentContract.web3.eth.getGasPrice()])
                this.ethPrice = promises[0]
                this.gasPrice = promises[1]
				this.show_loading = true
				let calls = [...Array(currentContract.N_COINS).keys()].map(i=>
						[this.coins[i]._address, this.coins[i].methods.balanceOf(currentContract.default_account).encodeABI()]
					)
				calls.push([currentContract.swap_token._address, currentContract.swap_token.methods.totalSupply().encodeABI()])
				let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex=>currentContract.web3.eth.abi.decodeParameter('uint256',hex))
				decoded.slice(0, decoded.length-1).forEach((balance, i) => {
			        let amount = BN(this.inputs[i]).div(BN(currentContract.c_rates[i])).toFixed(0,1);
			        if(!this.depositc) amount = this.inputs[i]*allabis[currentContract.currentContract].coin_precisions[i]
			        if(Math.abs(balance/amount-1) < 0.01) {
			        	if(!this.depositc) balance = BN(balance).div(currentContract.coin_precisions[i])
			        	else balance = BN(balance)
			            Vue.set(this.amounts, i, balance.toFixed(0,1));
			        }
			        else {
			            Vue.set(this.amounts, i, BN(this.inputs[i]).div(BN(currentContract.c_rates[i])).toFixed(0,1)); // -> c-tokens
			        }
				})

				let total_supply = +decoded[decoded.length-1];
				this.waitingMessage = 'Please approve spending your coins'
			    let nonZeroInputs = this.inputs.filter(Number).length
				if(this.depositc)
					this.estimateGas = contractGas.deposit[this.currentPool] / 2
				else
					this.estimateGas = (contractGas.depositzap[this.currentPool].deposit(nonZeroInputs) | 0) / 1.5
			    if (this.inf_approval)
			        await common.ensure_allowance(false, !this.depositc)
			    else if(this.depositc) {
			        await common.ensure_allowance(this.amounts, false);
			    }
			    else {
			    	let amounts = this.inputs.map((v, i)=>BN(v).times(currentContract.coin_precisions[i]).toFixed(0))
			    	await common.ensure_allowance(amounts, true)
			    }
			    var token_amount = 0;
			    if(total_supply > 0) {
			        token_amount = await currentContract.swap.methods.calc_token_amount(this.amounts, true).call();
			        token_amount = BN(Math.floor(token_amount * 0.99).toString()).toFixed(0,1);
			    }
			    let receipt;
			    let minted = 0;
			    if(this.depositc) {
                    this.waitingMessage = 'Please confirm deposit transaction'
			    	let add_liquidity = currentContract.swap.methods.add_liquidity(this.amounts, token_amount).send({
				        from: currentContract.default_account,
				        gas: contractGas.deposit[this.currentPool],
				    }).once('transactionHash', () => this.waitingMessage = `Waiting for deposit transaction to confirm ${stake ? 'before staking' : 'no further action required'}`)
				    try {
				    	receipt = await add_liquidity
				    }
				    catch(err) {
				    	if(err.code == -32603) {
				    		await common.setTimeout(300)
				    		receipt = await add_liquidity
				    	}
				    }
				}
				else {
			    	let amounts = this.inputs.map((v, i)=>BN(v).times(currentContract.coin_precisions[i]).toFixed(0, 1))
			    	let gas = contractGas.depositzap[this.currentPool].deposit(nonZeroInputs) | 0
			    	console.warn(this.inputs, 'inputs', amounts, 'uamounts', 
			    		this.amounts, 'amounts', currentContract.swap._address, 'swap address', currentContract.coin_precisions, 'coin precisions', 
			    		currentContract.c_rates, 'c rates',
			    		currentContract.coins.map(c=>c._address), 'coins', currentContract.underlying_coins.map(uc=>uc._address), 'underlying_coins',
			    		currentContract.virtual_price, 'virtual_price', token_amount, 'token_amount', Date.now())
                    this.waitingMessage = 'Please confirm deposit transaction'
					let add_liquidity = currentContract.deposit_zap.methods.add_liquidity(amounts, token_amount).send({
						from: currentContract.default_account,
						gas: gas
					})
					.once('transactionHash', hash => {
						this.waitingMessage = `Waiting for deposit transaction to confirm ${stake ? 'before staking' : 'no further action required'}`
						console.warn(hash, 'tx hash')
					})
					try {
				    	receipt = await add_liquidity
				    }
				    catch(err) {
				    	if(err.code == -32603) {
				    		await common.setTimeout(300)
				    		receipt = await add_liquidity
				    	}
				    }
				}
				this.waitingMessage = ''
				if(!stake ) this.show_loading = false
				if(stake && this.currentPool == 'susdv2') {
					minted = BN(
						Object.values(receipt.events).filter(event => {
							return event.address.toLowerCase() == allabis.susdv2.token_address.toLowerCase()
									&& event.raw.topics[1] == "0x0000000000000000000000000000000000000000000000000000000000000000" 
									&& event.raw.topics[2].toLowerCase() == '0x000000000000000000000000' + currentContract.default_account.slice(2).toLowerCase()
						})[0].raw.data)
					await this.stakeTokens(minted)
				}
				this.estimateGas = 0 
				this.gasPrice = 0

			    await this.handle_sync_balances();
			    common.update_fee_info();
			},
			highlightAllInputs() {
				for(let i = 0; i < currentContract.N_COINS; i++) this.highlightInputs(i)
			},
			highlightInputs(i) {
				let value = this.inputs[i]
				if (value > this.wallet_balances[i] * this.rates[i])
	                Vue.set(this.bgColors, i, 'red');
	            else
	                Vue.set(this.bgColors, i, 'blue');
			},
			async change_currency(i, setInputs = true, event) {
				if(event) {
					this.inputs[i] = event.target.value
				}
	            await this.calcSlippage()
	            var value = this.inputs[i]
	            this.highlightInputs(i)

	            if (this.sync_balances && !this.max_balances) {
	                for (let j = 0; j < currentContract.N_COINS; j++)
	                    if (j != i) {
	                        var value_j = this.inputs[j]

	                        if (this.balances[i] * currentContract.c_rates[i] > 1) {
	                            // proportional
	                            var newval = value / currentContract.c_rates[i] * this.balances[j] / this.balances[i];
	                            newval = Math.floor(newval * currentContract.c_rates[j] * 100) / 100;
	                            setInputs && Vue.set(this.inputs, j, newval);

	                        } else {
	                            // same value as we type
	                            var newval = value;
	                            setInputs && Vue.set(this.inputs, j, newval);
	                        }

	                        // Balance not enough highlight
	                        if (newval > this.wallet_balances[j] * this.rates[j])
	                            Vue.set(this.bgColors, j, 'red');
	                        else
	                            Vue.set(this.bgColors, j, 'blue');
	                    }
	            }
	        },
	        handle_migrate_new() {
	        	common.handle_migrate_new('new')
	        }
        }
    }

</script>

<style>
	#add-liquidity {
		margin-right: 1em;
	}
	#mintr {
        margin-top: 1em;
		margin-left: 1em;
		text-align: center;
	}
 	#stakeunstaked {
 		margin-left: 1em;
    }
</style>
