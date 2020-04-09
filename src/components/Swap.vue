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
                            <label :for="'from_cur_'+i">
                                <span v-show='!swapwrapped'>{{currency | capitalize}}</span>
                                <span v-show='swapwrapped'>{{currencies[currency]}}</span>
                            </label>
                        </label>
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
                            <label :for="'to_cur_'+i">
                                <span v-show='!swapwrapped'>{{currency | capitalize}}</span>
                                <span v-show='swapwrapped'>{{currencies[currency]}}</span>
                            </label>
                        </label>
                        </li>
                    </ul>
                </fieldset>
                <div class='clearfix'></div>
                <p class='exchange-rate'>Exchange rate (including fees): <span id="exchange-rate">{{exchangeRate}}</span></p>
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
                <ul>
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
                        <input id='swapw' type='checkbox' name='swapw' v-model = 'swapwrapped'>
                        <label for='swapw'>Swap wrapped</label>
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
    import { getters, contract as currentContract, gas as contractGas} from '../contract'
    import * as helpers from '../utils/helpers'
    import allabis from '../allabis'

    import BigNumber from 'bignumber.js'
    var cBN = (val) => new BigNumber(val);



	export default {
        data: () => ({
            disabled: true,
            from_currency: 0,
            to_currency: 1,
            inf_approval: true,
            fromInput: 0,
            toInput: 0,
            maxBalance: 0,
            promise: helpers.makeCancelable(Promise.resolve()),
            exchangeRate: 'Not available',
            bgColor: '#505070',
            fromBgColor: 'blue',
            maxSlippage: 1,
            maxInputSlippage: '',
            customSlippageDisabled: true,
            swapwrapped: false,
            coins: [],
        }),
        created() {
            this.$watch(()=>currentContract.default_account, (val, oldval) => {
                if(!oldval) return;
                if(val.toLowerCase() != oldval.toLowerCase()) this.mounted();
            })
            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
                console.timeEnd('initswap')
            })
        },
        watch: {
            from_currency(val, oldval) {
                if(val == this.to_currency) {
                    this.to_currency = oldval;
                }
                
                this.from_cur_handler()
            },
            to_currency(val, oldval) {
                this.to_cur_handler()
            },
            swapwrapped() {
                this.mounted()
            }
        },
        computed: {
            precisions() {
                if(this.swapwrapped) return allabis[currentContract.currentContract].wrapped_precisions;
                return allabis[currentContract.currentContract].coin_precisions
            },
          ...getters,
        },
        mounted() {
            if(currentContract.initializedContracts) this.mounted();
        },
        methods: {        
            async mounted() {
                this.coins = currentContract.underlying_coins
                if(this.swapwrapped) {
                    this.coins = currentContract.coins
                }
                this.disabled = false;
                this.from_cur_handler()
            },
            async set_to_amount() {
                this.promise.cancel()
                let promise = this.setAmountPromise()
                try {
                    let [dy, dy_, dx_, balance] = await promise
                    this.toInput = dy;
                    this.exchangeRate = (dy_ / dx_).toFixed(4);
                    if(this.exchangeRate <= 0.98) this.bgColor = 'red'
                    else this.bgColor= '#505070'
                    if(isNaN(this.exchangeRate)) this.exchangeRate = "Not available"
                    let amount = Math.floor(
                            100 * parseFloat(balance) / this.precisions[this.to_currency]
                        ) / 100

                    this.disabled = false;
                }
                catch(err) {
                    console.error(err)
                    this.disabled = true
                }
                finally {
                    this.highlight_input();
                }
                this.promise = helpers.makeCancelable(promise)
            },
            async from_cur_handler() {
                if (cBN(await currentContract.underlying_coins[this.from_currency].methods.allowance(currentContract.default_account, currentContract.swap_address).call()) > currentContract.max_allowance.div(cBN(2)))
                    this.inf_approval = true;
                else
                    this.inf_approval = false;

                await this.set_from_amount(this.from_currency);
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
                let balance = await this.coins[this.from_currency].methods.balanceOf(currentContract.default_account).call();
                let amount = Math.floor(
                        100 * parseFloat(balance) / this.precisions[this.from_currency]
                    ) / 100
                this.fromInput = amount.toFixed(2)
                await this.set_to_amount();
            },
            async highlight_input() {
                let balance = parseFloat(await this.coins[this.from_currency].methods.balanceOf(currentContract.default_account).call()) /
                        this.precisions[this.from_currency];
                if (this.fromInput > balance)
                    this.fromBgColor = 'red'
                else
                    this.fromBgColor = 'blue'
            },
            async set_from_amount(i) {
                let balance = await this.coins[i].methods.balanceOf(currentContract.default_account).call();
                let amount = Math.floor(
                        100 * parseFloat(balance) / this.precisions[i]
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
                    var dx_ = this.fromInput;
                    var dx = cBN(Math.round(dx_ * this.precisions[i])).toFixed(0,1);
                    let calls = [
                        [currentContract.swap._address, currentContract.swap.methods.balances(i).encodeABI()],
                    ]
                    if(!this.swapwrapped)
                        calls.push([currentContract.swap._address, currentContract.swap.methods.get_dy_underlying(i, j, dx).encodeABI()])
                    else {
                        //dx = cBN(dx).times(currentContract.c_rates[i])
                        calls.push([currentContract.swap._address, currentContract.swap.methods.get_dy(i, j, dx).encodeABI()])
                    }
                    calls.push([this.coins[this.to_currency]._address , this.coins[this.to_currency].methods.balanceOf(currentContract.default_account).encodeABI()])
                    let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
                    let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
                    let [b, get_dy_underlying, balance] = decoded
                    b = +b * currentContract.c_rates[i];
                    if (b >= 0.001) {
                        // In c-units
                        var dy_ = +get_dy_underlying / this.precisions[j];
                        var dy = dy_.toFixed(2);
                        resolve([dy, dy_, dx_, balance])
                    }
                    else { 
                        this.toInput = 0
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
                if(this.maxInputSlippage) maxSlippage = this.maxInputSlippage / 100;
                if (b >= 0.001) {
                    var dx = Math.floor(this.fromInput * this.precisions[i]);
                    var min_dy = Math.floor(this.toInput * (1-maxSlippage) * this.precisions[j]);
                    dx = cBN(dx.toString()).toFixed(0);
                    if (this.inf_approval)
                        await common.ensure_underlying_allowance(i, currentContract.max_allowance, [], undefined, this.swapwrapped)
                    else
                        await common.ensure_underlying_allowance(i, dx, [], undefined, this.swapwrapped);
                    min_dy = cBN(min_dy.toString()).toFixed(0);
                    let exchangeMethod = currentContract.swap.methods.exchange_underlying
                    if(this.swapwrapped) exchangeMethod = currentContract.swap.methods.exchange
                    await exchangeMethod(i, j, dx, min_dy).send({
                            from: currentContract.default_account,
                            gas: contractGas.swap[this.currentPool],
                        });
                    
                    await common.update_fee_info();
                    this.from_cur_handler();
                    let balance = await this.coins[i].methods.balanceOf(currentContract.default_account).call();
                    let amount = Math.floor(
                            100 * parseFloat(balance) / this.precisions[i]
                        ) / 100
                    this.maxBalance = amount;
                }
            }
        }
    }
</script>

<style>
	
</style>