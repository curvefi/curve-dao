<template>
	<div>

        <div id='poolselect'>
            <input id='compoundpool1' type='checkbox' value='compound' v-model='pools'/>
            <label for='compoundpool1'>Compound</label>

            <input id='usdtpool1' type='checkbox' value='usdt' v-model='pools'/>
            <label for='usdtpool1'>usdt</label>

            <input id='ypool1' type='checkbox' value='y' v-model='pools'/>
            <label for='ypool1'>Y</label>

            <input id='busdpool1' type='checkbox' value='busd' v-model='pools'/>
            <label for='busdpool1'>bUSD</label>
        </div>

		<div style="display: table; margin: auto" class='swap'>
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
                        <label :for="'from_cur_'+i">{{currency | toUpper}}</label>
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
                        <label :for="'to_cur_'+i">{{currency | toUpper}}</label>
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
                    <label for="inf-approval">Infinite approval - trust 1split contract forever</label>
                </li>
            </ul>
            <p class='trade-buttons'>
                <button id="trade" @click='handle_trade'>Sell</button>
            </p>
        </div>
	</div>
</template>

<script>
    import EventBus from './EventBus'

    import * as allabis from '../../allabis'
    let contractAbis = allabis.default

    import { contract } from '../../contract'
    import * as common from '../../utils/common'
    import * as helpers from '../../utils/helpers'

    import BN from 'bignumber.js'

	export default {
		data: () => ({
            pools: ['compound', 'usdt', 'y', 'busd'],
			maxBalance: '0.00',
            currencies: {
                dai: 'DAI',
                usdc: 'USDC',
                usdt: 'USDT',
                tusd: 'TUSD',
                busd: 'BUSD'
            },
            from_currency: 0,
            to_currency: 1,
            fromInput: '0.00',
            toInput: '0.00',
            disabled: true,
            bgColor: '#505070',
            fromBgColor: 'blue',
            exchangeRate: 'Not available',
            maxSlippage: 1,
            maxInputSlippage: '',
            customSlippageDisabled: true,
            inf_approval: false,
            distribution: null,
            //DAI, USDC, USDT, TUSD, BUSD
            coin_precisions: [1e18, 1e6, 1e6, 1e18, 1e18],
            swap: [],
            underlying_coins: [],
            onesplit: null,
            onesplit_address: '',
            //0x01+0x02+0x04+0x08+0x10+0x20+0x40+0x80+0x100+0x400+0x800+0x10000+0x20000+0x40000 -> 462335
            swapPromise: helpers.makeCancelable(Promise.resolve())
		}),
        computed: {
            CONTRACT_FLAG() {
                let flag = 0x01+0x02+0x04+0x08+0x10+0x20+0x40+0x80+0x100+0x400+0x800+0x10000+0x20000+0x40000+0x80000;
                let curveFlags = {
                    compound: 0x1000,
                    usdt: 0x2000,
                    y: 0x4000,
                    busd: 0x8000
                }
                let addFlag = Object.keys(curveFlags).filter(f=>!this.pools.includes(f)).map(f=>curveFlags[f]).reduce((a, b) => a + b, 0)
                return flag + addFlag;
            }
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
            }
        },
        async created() {
            //EventBus.$on('selected', this.selectPool)
            EventBus.$on('changeTime', this.changeTime)
            this.$watch(()=>contract.initializedContracts, async (val) => {
                await this.mounted()
            })
        },
        mounted() {
            //this.mounted()
        },
		methods: {
            async mounted() {
                await this.setup();
                this.disabled = false;
                this.from_cur_handler()
            },
            async highlight_input() {
                var balance = parseFloat(await this.underlying_coins[this.from_currency].methods.balanceOf(contract.default_account).call()) / this.coin_precisions[this.from_currency];
                if (this.fromInput > balance)
                    this.fromBgColor = 'red'
                else
                    this.fromBgColor = 'blue'
            },
            async from_cur_handler() {
                if (BN(await this.underlying_coins[this.from_currency].methods.allowance(contract.default_account, allabis.onesplit_address).call()) > contract.max_allowance.div(BN(2)))
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
            async handle_trade() {
                //handle allowances
                var i = this.from_currency
                var j = this.to_currency;
                let amount = BN(this.fromInput).times(this.coin_precisions[this.from_currency]).toFixed(0)
                let maxSlippage = this.maxSlippage / 100;
                if(this.maxInputSlippage) maxSlippage = this.maxInputSlippage / 100;
                if (this.inf_approval)
                        await common.ensure_underlying_allowance(i, contract.max_allowance, this.underlying_coins, this.onesplit_address)
                    else
                        await common.ensure_underlying_allowance(i, amount, this.underlying_coins, this.onesplit_address);

                await this.onesplit.methods.swap(
                        this.underlying_coins[i]._address,
                        this.underlying_coins[j]._address,
                        amount,
                        BN(this.toInput).times(this.coin_precisions[j]).times(BN(1 - maxSlippage)).toFixed(0),
                        this.distribution,
                        this.CONTRACT_FLAG
                    ).send({
                        from: contract.default_account,
                        gas: 6000000
                    })
            },
            async set_from_amount(i) {
                let balance = await this.underlying_coins[i].methods.balanceOf(contract.default_account).call();
                let amount = Math.floor(
                        100 * parseFloat(balance) / this.coin_precisions[i]
                    ) / 100
                if (this.fromInput == '' || this.val == 0) {
                    if(!contract.default_account) balance = 0
                    this.fromInput = amount.toFixed(2)
                }
                this.maxBalance = amount.toFixed(2);
            },
            async set_to_amount() {
                let amount = BN(this.fromInput).times(this.coin_precisions[this.from_currency]).toFixed(0)
                let parts = 10
                this.swapPromise.cancel();
                try {
                    this.swapPromise = helpers.makeCancelable(
                            this.onesplit.methods.getExpectedReturn(
                                this.underlying_coins[this.from_currency]._address,
                                this.underlying_coins[this.to_currency]._address,
                                amount,
                                parts,
                                this.CONTRACT_FLAG
                            ).call()
                        )
                    let split_swap = await this.swapPromise
                    console.log(split_swap, "1split swap", this.underlying_coins[this.from_currency], this.underlying_coins[this.to_currency])
                    this.amount_dy = split_swap.returnAmount;
                    this.exchangeRate = BN(this.amount_dy).div(this.coin_precisions[this.to_currency]).div(this.fromInput).toFixed(4);
                    if(+this.exchangeRate <= 0.98) this.bgColor = 'red'
                    else this.bgColor= '#505070'
                    if(isNaN(this.exchangeRate)) this.exchangeRate = "Not available"
                    this.toInput = BN(this.amount_dy).div(this.coin_precisions[this.to_currency]).toFixed(2);
                    this.distribution = split_swap.distribution
                    this.disabled = false
                }
                catch(err) {
                    console.error(err);
                    if(!err.canceled) this.disabled = true
                }
                finally {
                    this.highlight_input();
                }
            },
			async set_max_balance() {
                let balance = await this.underlying_coins[this.from_currency].methods.balanceOf(contract.default_account).call();
                let amount = Math.floor(
                        100 * parseFloat(balance) / this.coin_precisions[this.from_currency]
                    ) / 100
                this.fromInput = amount.toFixed(2)
                await this.set_to_amount();
			},
            async setup() {
                this.onesplit_address = await web3.eth.ens.getAddress('1split.eth')
                this.onesplit = new web3.eth.Contract(allabis.onesplit_abi, this.onesplit_address)
                this.swap.push(new web3.eth.Contract(contractAbis.iearn.swap_abi, contractAbis.iearn.swap_address));
                this.swap.push(new web3.eth.Contract(contractAbis.busd.swap_abi, contractAbis.busd.swap_address));
                for(let i = 0; i < 4; i++) {
                    var underlying_addr = await this.swap[0].methods.underlying_coins(i).call();
                    this.underlying_coins.push(new web3.eth.Contract(contractAbis.iearn.ERC20_abi, underlying_addr))
                }
                var underlying_addr = await this.swap[1].methods.underlying_coins(3).call();
                this.underlying_coins.push(new web3.eth.Contract(contractAbis.iearn.ERC20_abi, underlying_addr))
            }
		}
	}
</script>

<style scoped>
   #poolselect {
        margin-bottom: 1em;
    }
    #poolselect > label:nth-of-type(1) {
        margin-left: 0;
    }
    #poolselect > label {
        margin-left: 1em;
    }
</style>