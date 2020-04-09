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
                    <label :for="'currency_'+i">
                    	<span v-show='withdrawc'>
	                    	{{currencies[currency]}} 
	                    	<span v-show="!(currency == 'usdt' && currentPool == 'usdt')">(in {{currency | capitalize}})</span>
                    	</span>
                    	<span v-show='!withdrawc'>
                        	{{currency | capitalize}}
                        </span>
                    </label>
                    <input type="text" 
                    :id="'currency_'+i" 
                    name="from_cur" 
                    value="0.00" 
                    v-model = 'inputs[i]' 
                    :style = "inputStyles[i]"
                    @input='handle_change_amounts(i)'
                    @focus='handle_change_amounts(i)'>
                </li>
                <li>
                    <input id="withdrawc" type="checkbox" name="withdrawc" v-model='withdrawc'>
                    <label for="withdrawc">Withdraw wrapped</label>
                </li>
            </ul>
        </fieldset>
        <fieldset>
        	<legend>Withdraw % in:</legend>
        	<ul>
        		<li>
        			<input type='radio' id='to_cur_comb' name="to_cur" :value='10' :checked='to_currency === 10' @click='handleCheck(10)'>
        			<label for='to_cur_comb'>Combination of all coins</label>
        		</li>
				<li v-for='(currency, i) in Object.keys(currencies)'>
	                <input type="radio" :id="'to_cur_'+i" name="to_cur" :value='i' :checked='to_currency === i' @click='handleCheck(i)'>
	                <label :for="'to_cur_'+i">{{currency | capitalize}}</label>
	            </li>
	            <li>
	            	<input type='checkbox' id='donate_dust' name='donate_dust' v-model='donate_dust'>
	            	<label for='donate_dust' class=''>Donate dust<span class='tooltip'>[?]<span class='tooltiptext'>(may use less gas)</span></span>
	            	</label>
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
    		to_currency: null,
    		test: null,
    		withdrawc: true,
    		donate_dust: true,
    		slippagePromise: helpers.makeCancelable(Promise.resolve()),
    	}),
        created() {
            this.$watch(()=>currentContract.default_account, (val, oldval) => {
            	if(!val || !oldval) return;
            	if(val.toLowerCase() == oldval.toLowerCase()) return;
                if(val) this.mounted();
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
        	to_currency(val) {
        		if(this.share == 0 || this.share == '---') this.share = 100
	        	this.setInputStyles()
	        	if(val !== null) this.handle_change_share();
        	},
        	withdrawc(val) {
        		if(this.share == '---' ) return;
        		if(!val && this.to_currency === null) this.to_currency = 10
        		if(val && this.to_currency !== null) this.to_currency = null
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
            async mounted() {
            	currentContract.showSlippage = false;
        		currentContract.slippage = 0;

                await common.update_fee_info();
            	await this.update_balances();
            	this.handle_change_share();
            },
            setInputStyles(newInputs = false, newContract, oldContract) {
	        	if(oldContract) this.inputs = this.inputs.map((v, i) => i > allabis[oldContract].N_COINS ? '0.00' : this.inputs[i])
				if(newInputs) this.inputs = new Array(Object.keys(this.currencies).length).fill('0.00')
	        	this.inputStyles = Array(Object.keys(this.currencies).length).fill({
	        		backgroundColor: '#707070',
	        		color: '#d0d0d0',
	        	})
            },
            async calcSlippage(...args) {
            	this.slippagePromise.cancel();
        		this.slippagePromise = helpers.makeCancelable(common.calc_slippage(...args))
        		await this.slippagePromise;
            },
            handleCheck(val) {
            	if(val === this.to_currency) {
            		if(this.withdrawc == false) this.withdrawc = true
            		this.to_currency = null
            	}
            	else {
            		this.withdrawc = false
            		this.to_currency = val
            	}
            },
            async update_balances() {
            	let calls = []
			    if (currentContract.default_account) {
			        for (let i = 0; i < currentContract.N_COINS; i++) {
			        	calls.push([currentContract.coins[i]._address ,currentContract.coins[i].methods.balanceOf(currentContract.default_account).encodeABI()])
			        }
			        calls.push([currentContract.swap_token._address ,currentContract.swap_token.methods.balanceOf(currentContract.default_account).encodeABI()])
			    }
			    else {
			        this.token_balance = 0;
			    }
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			    	calls.push([currentContract.swap._address ,currentContract.swap.methods.balances(i).encodeABI()])
			    }
				calls.push([currentContract.swap_token._address ,currentContract.swap_token.methods.totalSupply().encodeABI()])
				let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				if(currentContract.default_account) {
					decoded.slice(0, currentContract.N_COINS).map((v, i) => {
						Vue.set(this.wallet_balances, i, +v)
					})
					this.token_balance = +decoded[currentContract.N_COINS]
					decoded = decoded.slice(currentContract.N_COINS+1)			
				}
				decoded.map((v, i) => {
					Vue.set(this.balances, i, +v)
			        if(!currentContract.default_account) Vue.set(this.balances, i, 0)
				})
				this.token_supply = +decoded[decoded.length-1]
			},
			async handle_change_amounts(i) {
				this.to_currency = null
		        var values = this.inputs.map((x,i) => x / currentContract.c_rates[i])
		        values = values.map(v=>BN(Math.floor(v).toString()).toFixed(0))
		        this.show_nobalance = false;
		        this.show_nobalance_i = 0;
		        let calls = [...Array(currentContract.N_COINS).keys()].map(i=>[currentContract.swap._address, currentContract.swap.methods.balances(i).encodeABI()])
		        calls.push([currentContract.swap._address ,currentContract.swap.methods.calc_token_amount(values, false).encodeABI()])
		        calls.push([currentContract.swap_token._address, currentContract.swap_token.methods.balanceOf(currentContract.default_account).encodeABI()])
		        let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
		        let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
		        decoded.slice(0, currentContract.N_COINS).forEach((v, i) => {
		        	let coin_balance = +v * currentContract.c_rates[i]
		            if(coin_balance < this.inputs[i]) {
		                this.show_nobalance |= true;
		                this.show_nobalance_i = i;
		            }
		            else
		                this.show_nobalance |= false;
		        })
		        try {
		            var availableAmount = +decoded[decoded.length-2]
		            availableAmount = availableAmount / (1 - currentContract.fee * currentContract.N_COINS / (4 * (currentContract.N_COINS - 1)))
		            var maxAvailableAmount = +decoded[decoded.length-1];

		            if(availableAmount > maxAvailableAmount) {
		                this.setAllInputBackground('red')
		            }
		            else {
		                this.setAllInputBackground('blue')
		            }
		            this.calcSlippage(this.inputs, false);

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
			async getMinAmounts() {
				//use update rates instead
				await this.update_fee_info();
				let min_amounts = []
				for(let i = 0; i < currentContract.N_COINS; i++) {
			    	min_amounts[i] = BN(0.97).times(this.share/100).times(BN(this.balances[i]))
					if(!this.withdrawc) {
						min_amounts[i] = min_amounts[i]
										.times(allabis[currentContract.currentContract].coin_precisions[i])
										.times(currentContract.c_rates[i])
					}
					min_amounts[i] = min_amounts[i].times(BN(this.token_balance))
						            .div(BN(this.token_supply))
						            .toFixed(0,1)
				}
				return min_amounts;
			},
			async handle_remove_liquidity() {
				let min_amounts = []
			    for (let i = 0; i < currentContract.N_COINS; i++) {
			        Vue.set(this.amounts, i, BN(Math.floor(this.inputs[i] / currentContract.c_rates[i]).toString()).toFixed(0,1)); // -> c-tokens

			    }
			    var txhash;
			    if (this.share == '---') {
			        var token_amount = await currentContract.swap.methods.calc_token_amount(this.amounts, false).call();
			        token_amount = BN(Math.floor(token_amount * 1.01).toString()).toFixed(0,1)
			        let nonZeroInputs = this.inputs.filter(Number).length
			        if(this.withdrawc) {
			        	let gas = contractGas.withdraw[this.currentPool].imbalance(nonZeroInputs) | 0
			        	await currentContract.swap.methods.remove_liquidity_imbalance(this.amounts, token_amount).send({
				        	from: currentContract.default_account, gas: gas
				        });
			    	}
			        else {
			        	let amounts = this.inputs.map((v, i) => BN(v).times(currentContract.coin_precisions[i]).toFixed(0))
			        	let gas = contractGas.depositzap[this.currentPool].withdrawImbalance(nonZeroInputs) | 0
			        	await common.ensure_allowance_zap_out(token_amount)
			        	await currentContract.deposit_zap.methods.remove_liquidity_imbalance(amounts, token_amount).send({
				        	from: currentContract.default_account, gas: gas
				        })
			        }
			    }
			    else {
			        var amount = BN(Math.floor(this.share / 100 * this.token_balance).toString()).toFixed(0,1);
			        if (this.share == 100)
			            amount = await currentContract.swap_token.methods.balanceOf(currentContract.default_account).call();
			        if(this.to_currency !== null && this.to_currency < 10) {
			        	await common.ensure_allowance_zap_out(amount)
			        	let min_amount = await currentContract.deposit_zap.methods.calc_withdraw_one_coin(amount, this.to_currency).call();
			        	await currentContract.deposit_zap.methods
			        		.remove_liquidity_one_coin(amount, 
			        			this.to_currency, 
    							BN(min_amount).times(BN(0.97)).toFixed(0), 
    							this.donate_dust)
			        		.send({
			        			from: currentContract.default_account,
			        			gas: contractGas.depositzap[this.currentPool].withdraw,
			        		})
			        }
			        else if(this.to_currency == 10) {
			        	await common.ensure_allowance_zap_out(amount)
			        	let min_amounts = this.getMinAmounts();
			        	await currentContract.deposit_zap.methods.remove_liquidity(amount, min_amounts)
			        	.send({from: currentContract.default_account, gas: contractGas.depositzap[this.currentPool].withdrawShare});
			        }
			        else {
			        	let min_amounts = this.getMinAmounts();
			        	await currentContract.swap.methods.remove_liquidity(amount, min_amounts).send({from: currentContract.default_account, gas: 600000});
			        }
			    }
			    if(this.share == '---') {
			        for (let i = 0; i < currentContract.N_COINS; i++) {
			            this.handle_change_amounts(i);
			        }
			    }
			    await this.update_balances();
			    await common.update_fee_info();
			},
			async handle_change_share() {
            	currentContract.showSlippage = false;
        		currentContract.slippage = 0;
        		if(this.to_currency !== null && this.to_currency < 10) {
	        		var amount = BN(Math.floor(this.share / 100 * this.token_balance).toString()).toFixed(0,1);
				        if (this.share == 100)
				            amount = await currentContract.swap_token.methods.balanceOf(currentContract.default_account).call();
	                let precision = allabis[currentContract.currentContract].coin_precisions[this.to_currency]
					let zap_values = Array(currentContract.N_COINS).fill(0)
					zap_values[this.to_currency] = BN(await currentContract.deposit_zap.methods.calc_withdraw_one_coin(amount, this.to_currency).call())
			        let real_values = Array(currentContract.N_COINS).fill(0)
			        real_values[this.to_currency] = zap_values[this.to_currency].div(precision)
			        this.inputs = this.inputs.map(v=>0)
			        this.inputs[this.to_currency] = real_values[this.to_currency].toFixed(2)
				    await this.calcSlippage([], false, zap_values, this.to_currency)
        		}

				this.shareStyles.backgroundColor = 'blue'
				this.shareStyles.color = 'aqua'
			    if (this.share == '---') {
			        this.share = 0;
			    }
			    else if ((this.share > 100) | (this.share < 0))
			        this.shareStyles.backgroundColor = 'red'
			    if(this.to_currency !== null && this.to_currency < 10) return;
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