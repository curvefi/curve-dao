<template>
	<div>
		<div class="window white add-liquidity">
            <fieldset class="currencies">
                <legend>Currencies:</legend>
                <ul>
                    <li v-for='(currency, i) in Object.keys(currencies)'>
                        <label :for="'currency_'+i">{{currencies[currency]}} <span v-show="!(currency == 'usdt' && currentPool == 'usdt')"> (in {{currency | capitalize}}) </span></label>
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
    	}),
        created() {
            this.$watch(()=>currentContract.default_account, val => {
                if(val) this.mounted();
            })
            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            })
            this.$watch(()=>currentContract.currentContract, val => {
            	if(currentContract.initializedContracts) this.mounted();
            })
        },
        computed: {
          ...getters,
        },
        mounted() {
            if(currentContract.initializedContracts) this.mounted();
        },
        methods: {
            async mounted() {
            	currentContract.showSlippage = false;
        		currentContract.slippage = 0;
	        	this.inputs = new Array(currentContract.N_COINS).fill('0.00')
	        	this.bgColors = Array(currentContract.N_COINS).fill({
	        		backgroundColor: '#707070',
	        		color: '#d0d0d0',
	        	})
                common.update_fee_info();
                await this.handle_sync_balances();
                await common.calc_slippage(this.inputs, true);
                for (let i = 0; i < currentContract.N_COINS; i++) {
					if (cBN(await currentContract.coins[i].methods.allowance(currentContract.default_account, currentContract.swap_address).call()).lte(currentContract.max_allowance.div(cBN(2))))
		            	this.inf_approval = false;
		        }
                this.disabledButtons = false;
            },
            async handle_sync_balances() {
			    await common.update_rates();
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			    	var wallet_balance = parseInt(await currentContract.coins[i].methods.balanceOf(currentContract.default_account).call())
			        Vue.set(this.wallet_balances, i, wallet_balance);
			        if(!currentContract.default_account) Vue.set(this.wallet_balances, i, 0);
			    }

			    if (this.max_balances) {

			        this.disabled = true;
			        for (let i = 0; i < currentContract.N_COINS; i++) {
			            var val = Math.floor(this.wallet_balances[i] * currentContract.c_rates[i] * 100) / 100;
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
			        let amount = cBN(Math.floor(this.inputs[i] / currentContract.c_rates[i]).toString()).toFixed(0,1);
			        let balance = await currentContract.coins[i].methods.balanceOf(currentContract.default_account).call();
			        if(Math.abs(balance/amount-1) < 0.005) {
			            Vue.set(this.amounts, i, cBN(balance).toFixed(0,1));
			        }
			        else {
			            Vue.set(this.amounts, i, cBN(Math.floor(this.inputs[i] / currentContract.c_rates[i]).toString()).toFixed(0,1)); // -> c-tokens
			        }
			    }
			    if (this.inf_approval)
			        await common.ensure_allowance(false)
			    else
			        await common.ensure_allowance(this.amounts);
			    var token_amount = 0;
			    if(parseInt(await currentContract.swap_token.methods.totalSupply().call()) > 0) {    
			        token_amount = await currentContract.swap.methods.calc_token_amount(this.amounts, true).call();
			        token_amount = cBN(Math.floor(token_amount * 0.99).toString()).toFixed(0,1);
			    }
			    await currentContract.swap.methods.add_liquidity(this.amounts, token_amount).send({
			        from: currentContract.default_account,
			        gas: 1300000});
			    await this.handle_sync_balances();
			    common.update_fee_info();
			},
			async change_currency(i) {
	            await common.calc_slippage(this.inputs, true)

	            var value = this.inputs[i]
	            if (value > this.wallet_balances[i] * currentContract.c_rates[i])
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
	                            Vue.set(this.inputs, j, newval);

	                        } else {
	                            // same value as we type
	                            var newval = value;
	                            Vue.set(this.inputs, j, newval);
	                        }

	                        // Balance not enough highlight
	                        if (newval > this.wallet_balances[j] * currentContract.c_rates[j])
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