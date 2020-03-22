<template>
	<div class="window white add-liquidity">
        <fieldset class="percentage">
            <legend>Share of liquidity (%)</legend>
            <ul>
                <li>
                    <input type="text" 
                    id="liquidity-share" 
                    name="liquidity-share" 
                    value="0.00" 
                    v-model='share'
                    @input='handle_change_share'
                    @focus='handle_change_share'
                    :style='shareStyles'>
                </li>
            </ul>
        </fieldset>
        <fieldset class="currencies">
            <legend>Currencies:</legend>
            <ul>
                <li v-for='(currency, i) in Object.keys(currencies)'>
                    <label :for="'currency_'+i">{{currencies[currency]}} <span v-show="!(currency == 'usdt' && currentPool == 'usdt')">(in {{currency | capitalize}})</span></label>
                    <input type="text" 
                    :id="'currency_'+i" 
                    name="from_cur" 
                    value="0.00" 
                    v-model = 'inputs[i]' 
                    :style = "inputStyles[i]"
                    @input='handle_change_amounts(i)'
                    @focus='handle_change_amounts(i)'>
                </li>
            </ul>
        </fieldset>

        <p style="text-align: center">
            <button id="remove-liquidity" @click='handle_remove_liquidity'>Withdraw</button>
            <button id="migrate-new" @click='handle_migrate_new' v-show="currentPool == 'compound'">Migrate</button>
            <Slippage v-bind="{show_nobalance, show_nobalance_i}"/>
        </p>
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
    		share: '0.00',
    		shareStyles: {
    			backgroundColor: '#707070',
    			color: '#d0d0d0',
    		},
    		inputs: [],
    		inputStyles: [],
    		wallet_balances: [],
    		balances: [],
    		token_balance: 0,
    		token_supply: 0,
    		show_nobalance: false,
    		show_nobalance_i: 0,
    		bgColor: [],
    		amounts: [],
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
	        	this.inputStyles = Array(currentContract.N_COINS).fill({
	        		backgroundColor: '#707070',
	        		color: '#d0d0d0',
	        	})
                common.update_fee_info();
                await common.update_rates();
            	await this.update_balances();
            	this.handle_change_share();
            },
            async update_balances() {
			    if (currentContract.default_account) {
			        for (let i = 0; i < currentContract.N_COINS; i++)
			            Vue.set(this.wallet_balances, i, parseInt(await currentContract.coins[i].methods.balanceOf(currentContract.default_account).call()));
			        this.token_balance = parseInt(await currentContract.swap_token.methods.balanceOf(currentContract.default_account).call());
			    }
			    else {
			        this.token_balance = 0;
			    }
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			        Vue.set(this.balances, i, parseInt(await currentContract.swap.methods.balances(i).call()));
			        if(!currentContract.default_account) Vue.set(this.balances, i, 0)
			    }
			    this.token_supply = parseInt(await currentContract.swap_token.methods.totalSupply().call());
			},
			async handle_change_amounts(i) {
		        var values = this.inputs.map((x,i) => x / currentContract.c_rates[i])
		        values = values.map(v=>cBN(Math.floor(v).toString()).toFixed(0))
		        this.show_nobalance = false;
		        this.show_nobalance_i = 0;
		        for(let i = 0; i < currentContract.N_COINS; i++) {
		            let coin_balance = parseInt(await currentContract.swap.methods.balances(i).call()) * currentContract.c_rates[i];
		            if(coin_balance < this.inputs[i]) {
		                this.show_nobalance |= true;
		                this.show_nobalance_i = i;
		            }
		            else
		                this.show_nobalance |= false;
		        }
		        try {
		            var availableAmount =  await currentContract.swap.methods.calc_token_amount(values, false).call()
		            availableAmount = availableAmount / (1 - currentContract.fee * currentContract.N_COINS / (4 * (currentContract.N_COINS - 1)))
		            var maxAvailableAmount = parseInt(await currentContract.swap_token.methods.balanceOf(currentContract.default_account).call());

		            if(availableAmount > maxAvailableAmount) {
		                this.setAllInputBackground('red')
		            }
		            else {
		                this.setAllInputBackground('blue')
		            }
		            await common.calc_slippage(this.inputs, false);

		            this.share = '---';
		            this.shareStyles = {
		            	backgroundColor: '#707070',
		            	color: '#d0d0d0'
		            }
		        }
		        catch(err) {
		            console.error(err)
		            this.setAllInputBackground('red')
		        }
			},
			async handle_remove_liquidity() {
				let min_amounts = []
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			        Vue.set(this.amounts, i, cBN(Math.floor(this.inputs[i] / currentContract.c_rates[i]).toString()).toFixed(0,1)); // -> c-tokens
			    	min_amounts[i] = cBN(0.97).multipliedBy(this.share/100).multipliedBy(cBN(this.balances[i]))
						            .multipliedBy(cBN(this.token_balance))
						            .div(cBN(this.token_supply))
						            .toFixed(0,1)
			    }
			    var txhash;
			    if (this.share == '---') {
			        var token_amount = await currentContract.swap.methods.calc_token_amount(this.amounts, false).call();
			        token_amount = cBN(Math.floor(token_amount * 1.01).toString()).toFixed(0,1)
			        await currentContract.swap.methods.remove_liquidity_imbalance(this.amounts, token_amount).send({from: currentContract.default_account, gas: 1000000});
			    }
			    else {
			        var amount = cBN(Math.floor(this.share / 100 * this.token_balance).toString()).toFixed(0,1);
			        if (this.share == 100)
			            amount = await currentContract.swap_token.methods.balanceOf(currentContract.default_account).call();
			        await currentContract.swap.methods.remove_liquidity(amount, min_amounts).send({from: currentContract.default_account, gas: 600000});
			    }
			    if(this.share != '---') {
			        for (let i = 0; i < currentContract.N_COINS; i++) {
			            this.handle_change_amounts(i);
			        }
			    }
			    await this.update_balances();
			    common.update_fee_info();
			},
			handle_change_share() {
            	currentContract.showSlippage = false;
        		currentContract.slippage = 0;
				this.shareStyles.backgroundColor = 'blue'
				this.shareStyles.color = 'aqua'
			    if (this.share == '---') {
			        this.share = 0;
			    }
			    else if ((this.share > 100) | (this.share < 0))
			        this.shareStyles.backgroundColor = 'red'

			    for (let i = 0; i < currentContract.N_COINS; i++) {
			        if ((this.share >=0) & (this.share <= 100)) {
			            Vue.set(this.inputs, i, (this.share / 100 * this.balances[i] * currentContract.c_rates[i] * this.token_balance / this.token_supply).toFixed(2))
			        }
			        else {
			            Vue.set(this.inputs, i, 0)
			        }
			        Vue.set(this.inputStyles, i, {
			        	backgroundColor: '#707070',
			        	color: '#d0d0d0'
			        })
			    }
			},
			setAllInputBackground(bgcolor) {
				for(let i = 0; i < currentContract.N_COINS; i++) {
					Vue.set(this.inputStyles, i, Object.assign(this.inputStyles[i] || {}, {backgroundColor: bgcolor}))
				}
			},
	        handle_migrate_new() {
	        	common.handle_migrate_new('new')
	        }
        },

    }
</script>

<style>
	#remove-liquidity {
		margin-right: 1em;
	}
</style>