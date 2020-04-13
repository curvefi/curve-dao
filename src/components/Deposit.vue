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
	                        	<span v-show="!(currency == 'usdt' && currentPool == 'usdt')"> 
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
	                        value="0.00" 
	                        v-model='inputs[i]'
	                        :style = "{backgroundColor: bgColors[i]}"
	                        @input='change_currency(i)'
	                    >
                    </li>
                </ul>
            </fieldset>
            <ul>
                <li>
                    <input id="sync-balances" type="checkbox" name="sync-balances" @change='handle_sync_balances' :disabled='disabledButtons' checked v-model='sync_balances'>
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
                <li>
                    <input id="depositc" type="checkbox" name="inf-approval" checked v-model='depositc'>
                    <label for="depositc">Deposit wrapped</label>
                </li>
            </ul>

            <p style="text-align: center">
                <button id="add-liquidity" @click='handle_add_liquidity'>Deposit</button>
                <button id="migrate-new" @click='handle_migrate_new' v-show="currentPool == 'compound' && oldBalance > 0">Migrate from old</button>
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
    		depositc: true,
    		coins: [],
    		rates: [],
    		swap_address: currentContract.swap_address,
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
        		await Promise.all([...Array(currentContract.N_COINS).keys()].map(i=>this.change_currency(i, false)))
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
            async mounted(oldContract) {
            	this.changeSwapInfo(this.depositc)
            	currentContract.showSlippage = false;
        		currentContract.slippage = 0;
                common.update_fee_info();
                await this.handle_sync_balances();
                await this.calcSlippage()
                let calls = [...Array(currentContract.N_COINS).keys()].map(i=>[this.coins[i]._address, 
                	this.coins[i].methods.allowance(currentContract.default_account, this.swap_address).encodeABI()])
                let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
                let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
                if(decoded.some(v=>BN(v).lte(currentContract.max_allowance.div(BN(2))) > 0))
                	this.inf_approval = false
                this.disabledButtons = false;
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
            		this.swap_address = currentContract.deposit_address
            	}
            },
            setInputStyles(newInputs = false, newContract, oldContract) {
				if(oldContract) this.inputs = this.inputs.map((v, i) => i > allabis[oldContract].N_COINS ? '0.00' : this.inputs[i])
				if(newInputs) this.inputs = new Array(Object.keys(this.currencies).length).fill('0.00')
	        	this.bgColors = Array(currentContract.N_COINS).fill({
	        		backgroundColor: '#707070',
	        		color: '#d0d0d0',
	        	})
            },
            async calcSlippage() {
            	this.slippagePromise.cancel();
        		this.slippagePromise = helpers.makeCancelable(common.calc_slippage(this.inputs, true))
        		await this.slippagePromise;
            },
            async handle_sync_balances() {
			    await common.update_fee_info();
			    let calls = []
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			    	calls.push([this.coins[i]._address, this.coins[i].methods.balanceOf(currentContract.default_account).encodeABI()])
			    	calls.push([currentContract.swap._address, currentContract.swap.methods.balances(i).encodeABI()])
			    }
			    let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
			    let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
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
			            var val = Math.floor(amount * 100) / 100;
			            val = val.toFixed(2)
			            Vue.set(this.inputs, i, val)
			        }
			    }
			    else
			        this.disabled = false;
			},
			async handle_add_liquidity() {
				let calls = [...Array(currentContract.N_COINS).keys()].map(i=>
						[currentContract.coins[i]._address, currentContract.coins[i].methods.balanceOf(currentContract.default_account).encodeABI()]
					)
				calls.push([currentContract.swap_token._address, currentContract.swap_token.methods.totalSupply().encodeABI()])
				let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex=>web3.eth.abi.decodeParameter('uint256',hex))
				decoded.slice(0, decoded.length-1).forEach((balance, i) => {
			        let amount = BN(this.inputs[i]).div(BN(currentContract.c_rates[i])).toFixed(0,1);
			        if(Math.abs(balance/amount-1) < 0.005) {
			            Vue.set(this.amounts, i, BN(balance).toFixed(0,1));
			        }
			        else {
			            Vue.set(this.amounts, i, BN(this.inputs[i]).div(BN(currentContract.c_rates[i])).toFixed(0,1)); // -> c-tokens
			        }
				})
				let total_supply = +decoded[decoded.length-1];
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
			    let nonZeroInputs = this.inputs.filter(Number).length
			    if(this.depositc) {
			    	await currentContract.swap.methods.add_liquidity(this.amounts, token_amount).send({
				        from: currentContract.default_account,
				        gas: 1300000
				    });
				}
				else {
			    	let amounts = this.inputs.map((v, i)=>BN(v).times(currentContract.coin_precisions[i]).toFixed(0))
			    	let gas = contractGas.depositzap[this.currentPool].deposit(nonZeroInputs) | 0
					await currentContract.deposit_zap.methods.add_liquidity(amounts, token_amount).send({
						from: currentContract.default_account,
						gas: gas
					})
				}
			    await this.handle_sync_balances();
			    common.update_fee_info();
			},
			async change_currency(i, setInputs = true) {
	            await this.calcSlippage()
	            var value = this.inputs[i]
	            if (value > this.wallet_balances[i] * this.rates[i])
	                Vue.set(this.bgColors, i, 'red');
	            else
	                Vue.set(this.bgColors, i, 'blue');

	            if (this.sync_balances) {
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
</style>