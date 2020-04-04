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
                    <label for="inf-approval">Infinite approval - trust this contract forever</label>
                </li>
                <li v-show="currentPool == 'compound'">
                    <input id="depositc" type="checkbox" name="inf-approval" checked v-model='depositc'>
                    <label for="depositc">Deposit compounded</label>
                </li>
            </ul>

            <p style="text-align: center">
                <button id="add-liquidity" @click='handle_add_liquidity'>Deposit</button>
                <button id="migrate-new" @click='handle_migrate_new' v-show="currentPool == 'compound'">Migrate</button>
                <Slippage/>
            </p>
        </div>
	</div>
</template>

<script>
	import Vue from 'vue'
    import * as common from '../utils/common.js'
    import { getters, contract as currentContract } from '../contract'
    import allabis from '../allabis'
    const compound = allabis.compound
    import * as helpers from '../utils/helpers'

    import BigNumber from 'bignumber.js'
    var cBN = (val) => new BigNumber(val);

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
    		swap_address: '',
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
            this.$watch(()=>currentContract.currentContract, val => {
            	if(currentContract.initializedContracts) this.mounted();
            })
        },
        watch: {
        	async depositc(val, oldval) {
        		let inputs = this.inputs
        		if(val) {
	            	this.coins = currentContract.coins
	            	this.rates = currentContract.c_rates
	            	this.swap_address = compound.swap_address
        		}
            	else {
            		this.coins = currentContract.underlying_coins
            		this.rates = compound.coin_precisions.map(cp=>1/cp)
            		this.swap_address = compound.deposit_address
            		inputs = inputs.map((v,i)=>v / currentContract.c_rates[i])
            	}
        		this.handle_sync_balances()
        		await common.calc_slippage(inputs, true);
        	}
        },
        computed: {
          ...getters,
        },
        mounted() {
            if(currentContract.initializedContracts) this.mounted();
        },
        methods: {
            async mounted() {
            	this.coins = currentContract.coins
            	this.rates = currentContract.c_rates
            	this.swap_address = compound.swap_address
            	currentContract.showSlippage = false;
        		currentContract.slippage = 0;
	        	this.inputs = new Array(currentContract.N_COINS).fill('0.00')
	        	this.bgColors = Array(currentContract.N_COINS).fill({
	        		backgroundColor: '#707070',
	        		color: '#d0d0d0',
	        	})
                common.update_fee_info();
                await this.handle_sync_balances();
        		let inputs = this.inputs
        		if(!this.depositc) inputs = inputs.map((v,i)=>v / currentContract.c_rates[i])
                await common.calc_slippage(inputs, true);
                for (let i = 0; i < currentContract.N_COINS; i++) {
					if (cBN(await this.coins[i].methods.allowance(currentContract.default_account, this.swap_address).call()).lte(currentContract.max_allowance.div(cBN(2))))
		            	this.inf_approval = false;
		        }
                this.disabledButtons = false;
            },
            async handle_sync_balances() {
			    if(this.depositc) await common.update_rates();
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			    	var wallet_balance = parseInt(await this.coins[i].methods.balanceOf(currentContract.default_account).call())
			        Vue.set(this.wallet_balances, i, wallet_balance);
			        if(!currentContract.default_account) Vue.set(this.wallet_balances, i, 0);
			    }
			    if (this.max_balances) {

			        this.disabled = true;
			        for (let i = 0; i < currentContract.N_COINS; i++) {
			        	let amount = this.wallet_balances[i] * currentContract.c_rates[i]
			        	if(!this.depositc) amount = this.wallet_balances[i] / allabis[currentContract.currentContract].coin_precisions[i]
			            var val = Math.floor(amount * 100) / 100;
			            val = val.toFixed(2)
			            Vue.set(this.inputs, i, val)
			        }
			    } else
			        this.disabled = false;

			    for (let i = 0; i < currentContract.N_COINS; i++)
			        Vue.set(this.balances, i, parseInt(await currentContract.swap.methods.balances(i).call()));
			},
			async handle_add_liquidity() {
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			        let amount = cBN(this.inputs[i]).div(cBN(this.rates[i])).toFixed(0,1);
			        let balance = await this.coins[i].methods.balanceOf(currentContract.default_account).call();
			        if(Math.abs(balance/amount-1) < 0.005) {
			            Vue.set(this.amounts, i, cBN(balance).toFixed(0,1));
			        }
			        else {
			            Vue.set(this.amounts, i, cBN(this.inputs[i]).div(cBN(this.rates[i])).toFixed(0,1)); // -> c-tokens
			        }
			    }
			    if (this.inf_approval)
			        await common.ensure_allowance(false, !this.depositc)
			    else
			        await common.ensure_allowance(this.amounts, !this.depositc);
			    var token_amount = 0;
			    if(this.depositc && parseInt(await currentContract.swap_token.methods.totalSupply().call()) > 0) {    
			        token_amount = await currentContract.swap.methods.calc_token_amount(this.amounts, true).call();
			        token_amount = cBN(Math.floor(token_amount * 0.99).toString()).toFixed(0,1);
			    }
			    if(!this.depositc) {
			    	token_amount = this.amounts.reduce((a, b) => a.plus(b || 0), cBN(0))
			    }
			    if(this.depositc) {
			    	await currentContract.swap.methods.add_liquidity(this.amounts, token_amount).send({
				        from: currentContract.default_account,
				        gas: 1300000
				    });
				}
				else {
					await currentContract.deposit_zap.methods.add_liquidity(this.amounts, token_amount).send({
						from: currentContract.default_account,
						gas:1300000
					})
				}
			    await this.handle_sync_balances();
			    common.update_fee_info();
			},
			async change_currency(i) {
        		let inputs = this.inputs
        		if(!this.depositc) inputs = inputs.map((v,i)=>v / currentContract.c_rates[i])
	            await common.calc_slippage(this.inputs, true)

	            var value = this.inputs[i]
	            if (value > this.wallet_balances[i] * this.rates[i])
	                Vue.set(this.bgColors, i, 'red');
	            else
	                Vue.set(this.bgColors, i, 'blue');

	            if (this.sync_balances) {
	                for (let j = 0; j < currentContract.N_COINS; j++)
	                    if (j != i) {
	                        var value_j = this.inputs[j]

	                        if (this.balances[i] * this.rates[i] > 1) {
	                            // proportional
	                            var newval = value / this.rates[i] * this.balances[j] / this.balances[i];
	                            newval = Math.floor(newval * this.rates[j] * 100) / 100;
	                            Vue.set(this.inputs, j, newval);

	                        } else {
	                            // same value as we type
	                            var newval = value;
	                            Vue.set(this.inputs, j, newval);
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