<template>
	<div>
        <div class="window white">
            <div style="display: table; margin: auto">
                <fieldset style="float: left">
                    <legend>From:</legend>
                    <div class='maxbalance' @click='set_max_balance'>Max: <span>{{maxBalance}}</span> </div>
                    <ul>
                        <li>
                            <input type="text" id="from_currency" :disabled='disabled' name="from_currency" value='0.00'
                            :style = "{backgroundColor: fromBgColor}"
                            @input='set_to_amount'
                            v-model='fromInput'>
                        </li>
                        <li v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'from_cur_'+i" name="from_cur" :value='i' v-model='from_currency'>
                            <label :for="'from_cur_'+i">{{currency | capitalize}}</label>
                        </li>
                    </ul>
                </fieldset>
                <fieldset style="float: left">
                    <legend>To:</legend>
                    <div class='maxbalance'>Max: <span></span> </div>
                    <ul>
                        <li>
                            <input type="text" 
                            id="to_currency" 
                            name="to_currency" 
                            value="0.00" 
                            disabled
                            :style = "{backgroundColor: bgColor}"
                            v-model='toInput'>
                        </li>
                        <li v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'to_cur_'+i" name="to_cur" :value='i' v-model='to_currency'>
                            <label :for="'to_cur_'+i">{{currency | capitalize}}</label>
                        </li>
                    </ul>
                </fieldset>
                <div class='clearfix'></div>
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
                <p class='exchange-rate'>Exchange rate (including fees): <span id="exchange-rate">{{exchangeRate}}</span></p>
                <ul>
                    <li>
                        <input id="inf-approval" type="checkbox" name="inf-approval" checked v-model='inf_approval'>
                        <label for="inf-approval">Infinite approval - trust this contract forever</label>
                    </li>
                </ul>
                <p class='trade-buttons'>
                    <button id="trade" @click='handle_trade'>Sell</button>
                </p>
            </div>
        </div>
</div>
</template>

<script>
    import * as common from '../utils/common.js'
    import { getters, contract as currentContract } from '../contract'
    import * as helpers from '../utils/helpers'

    import BigNumber from 'bignumber.js'
    var cBN = (val) => new BigNumber(val);



	export default {
        data: () => ({
            disabled: true,
            from_currency: 0,
            to_currency: 1,
            inf_approval: true,
            fromInput: '',
            toInput: '',
            maxBalance: 0,
            promise: helpers.makeCancelable(Promise.resolve()),
            exchangeRate: 'Not available',
            bgColor: '#505070',
            fromBgColor: 'blue',
            maxSlippage: 1,
            maxInputSlippage: '',
            customSlippageDisabled: true,
        }),
        created() {
            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            })
        },
        watch: {
            from_currency(val, oldval) {
                if(val != oldval) 
                    this.from_cur_handler()
            },
            to_currency(val, oldval) {
                if(val != oldval) 
                    this.to_cur_handler()
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
                this.disabled = false;
                this.from_cur_handler()
            },
            async set_to_amount() {
                this.promise.cancel()
                let promise = this.setAmountPromise()
                    .then(async ([dy, dy_, dx_]) => {
                        this.toInput = dy;
                        this.exchangeRate = (dy_ / dx_).toFixed(4);
                        if(this.exchangeRate <= 0.98) this.bgColor = 'red'
                        else this.bgColor= '#505070'
                        if(isNaN(this.exchangeRate)) this.exchangeRate = "Not available"
                        let balance = await currentContract.underlying_coins[this.to_currency].methods.balanceOf(currentContract.default_account).call();
                        let amount = Math.floor(
                                100 * parseFloat(balance) / currentContract.coin_precisions[this.to_currency]
                            ) / 100
                        this.disabled = false;
                    })
                    .catch(err => {
                        console.error(err);
                        this.disabled = true;
                    })
                    .finally(() => {
                        this.highlight_input();
                    })
                this.promise = helpers.makeCancelable(promise)
            },
            async from_cur_handler() {
                if (cBN(await currentContract.underlying_coins[this.from_currency].methods.allowance(currentContract.default_account, currentContract.swap_address).call()) > currentContract.max_allowance.div(cBN(2)))
                    this.inf_approval = true;
                else
                    this.inf_approval = false;

                await this.set_from_amount(this.from_currency);
                if (this.to_currency == this.from_currency) {
                    if (this.from_currency == 0) {
                        this.to_currency = 1;
                    } else {
                        this.to_currency = 0;
                    }
                }
                await this.set_to_amount();
            },
            async to_cur_handler() {
                if (this.to_currency == this.from_currency) {
                    if (this.to_currency == 0) {
                        this.from_currency = 1;
                    } else {
                        this.from_currency = 0;
                    }
                    await this.set_from_amount(this.from_currency);
                }
                await this.set_to_amount();
            },
            async set_max_balance() {
                let balance = await currentContract.underlying_coins[this.from_currency].methods.balanceOf(currentContract.default_account).call();
                let amount = Math.floor(
                        100 * parseFloat(balance) / currentContract.coin_precisions[this.from_currency]
                    ) / 100
                this.fromInput = amount.toFixed(2)
                await this.set_to_amount();
            },
            async highlight_input() {
                var balance = parseFloat(await currentContract.underlying_coins[this.from_currency].methods.balanceOf(currentContract.default_account).call()) / currentContract.coin_precisions[this.from_currency];
                if (this.fromInput > balance)
                    this.fromBgColor = 'red'
                else
                    this.fromBgColor = 'blue'
            },
            async set_from_amount(i) {
                let balance = await currentContract.underlying_coins[i].methods.balanceOf(currentContract.default_account).call();
                let amount = Math.floor(
                        100 * parseFloat(balance) / currentContract.coin_precisions[i]
                    ) / 100
                if (this.fromInput == '' || this.val == 0) {
                    if(!currentContract.default_account) balance = 0
                    this.fromInput = amount.toFixed(2)
                }
                this.maxBalance = amount.toFixed(2);
            },
            setAmountPromise() {
                let promise = new Promise(async (resolve, reject) => {
                    var i = this.from_currency;
                    var j = this.to_currency;
                    var b = parseInt(await currentContract.swap.methods.balances(i).call()) * currentContract.c_rates[i];
                    if (b >= 0.001) {
                        // In c-units
                        var dx_ = this.fromInput;
                        var dx = cBN(Math.round(dx_ * currentContract.coin_precisions[i])).toFixed(0,1);
                        var dy_ = parseInt(await currentContract.swap.methods.get_dy_underlying(i, j, dx).call()) / currentContract.coin_precisions[j];
                        var dy = dy_.toFixed(2);
                        resolve([dy, dy_, dx_])
                    }
                    else { 
                        reject()
                    }
                })
                return helpers.makeCancelable(promise);
            },
            async handle_trade() {
                var i = this.from_currency
                var j = this.to_currency;
                var b = parseInt(await currentContract.swap.methods.balances(i).call()) / currentContract.c_rates[i];
                let maxSlippage = this.maxSlippage / 100;
                if(this.maxInputSlippage) maxSlippage = maxInputSlippage / 100;
                if (b >= 0.001) {
                    var dx = Math.floor(this.fromInput * currentContract.coin_precisions[i]);
                    var min_dy = Math.floor(this.toInput * (1-maxSlippage) * currentContract.coin_precisions[j]);
                    dx = cBN(dx.toString()).toFixed(0);
                    if (this.inf_approval)
                        await common.ensure_underlying_allowance(i, currentContract.max_allowance)
                    else
                        await common.ensure_underlying_allowance(i, dx);
                    min_dy = cBN(min_dy.toString()).toFixed(0);
                    await currentContract.swap.methods.exchange_underlying(i, j, dx, min_dy).send({
                            from: currentContract.default_account,
                            gas: 1600000,
                        });
                    
                    await common.update_rates();
                    common.update_fee_info();
                    this.from_cur_handler();
                }
            }
        }
    }
</script>

<style>
	
</style>