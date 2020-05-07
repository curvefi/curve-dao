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

            <input id='susdpool1' type='checkbox' value='susdv2' v-model='pools'/>
            <label for='susdpool1'>sUSD</label>
        </div>

		<div class='swap exchange'>
            <div class='exchangefields'>
                <fieldset class='item'>
                    <legend>From:</legend>
                    <div class='maxbalance' @click='set_max_balance'>Max: <span>{{maxBalance}}</span> </div>
                    <ul>
                        <li>
                            <input type="text" id="from_currency" :disabled='disabled || selldisabled' name="from_currency" value='0.00'
                            :style = "{backgroundColor: fromBgColor}"
                            @input='set_to_amount'
                            v-model='fromInput'>
                            <p class='actualvalue' v-show='swapwrapped'>
                                ≈ {{actualFromValue}} {{Object.keys(currencies)[this.from_currency] | capitalize}}
                            </p>
                        </li>
                        <li v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'from_cur_'+i" name="from_cur" :value='i' v-model='from_currency'>
                            <label :for="'from_cur_'+i">
                                <span v-show='!swapwrapped'> {{currency == 'susd' ? 'sUSD' : (currency.toUpperCase())}} </span>
                                <span v-show='swapwrapped'> {{currencies[currency]}} </span>
                            </label>
                        </li>
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
                            v-model='toInput'>
                            <p class='actualvalue' v-show='swapwrapped'>
                                ≈ {{actualToValue}} {{Object.keys(currencies)[this.to_currency] | capitalize}}
                            </p>
                        </li>
                        <li v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'to_cur_'+i" name="to_cur" :value='i' v-model='to_currency'>
                            <label :for="'to_cur_'+i">
                                <span v-show='!swapwrapped'> {{currency == 'susd' ? 'sUSD' : (currency.toUpperCase())}} </span>
                                <span v-show='swapwrapped'> {{currencies[currency]}} </span>
                            </label>
                        </li>
                    </ul>
                </fieldset>
            </div>
                <p v-show='fromInput > 0' class='exchange-rate'>Exchange rate (including fees): <span id="exchange-rate">{{exchangeRate}}</span></p>
                <p v-show='fromInput > 0' class='best-pool-text'>
                    Trade routed through: 
                    <span id="best-pool">
                        <span v-show="bestPoolText != '1split'">
                            {{bestPoolText}}
                        </span>
                        <span v-show="bestPoolText == '1split'">
                            {{bestPoolText}}
                            <span class='tooltip'> [?]
                                <span class='tooltiptext' v-html = 'distributionText'></span>
                            </span>
                        </span>
                    </span>
                </p>
                <div v-show='fromInput > 0' id='max_slippage'><span>Max slippage:</span> 
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
                <li v-show='bestPool !== null'>
                    <input id="inf-approval" type="checkbox" name="inf-approval" checked v-model='inf_approval'>
                    <label for="inf-approval">Infinite approval - trust {{bestPoolText}} contract forever</label>
                </li>
                <li v-show="['compound', 'usdt'].some(p => pools.includes(p))">
                    <input id='swapc' type='checkbox' name='swapc' v-model = 'swapwrapped'>
                    <label for='swapc'>Swap compounded</label>

                    <!-- <input id='swapy' type='radio' name='swapy' :value='2' :checked='swapwrapped == 2' @click='handleCheck(2)' v-model = 'swapwrapped'>
                    <label for='swapy'>Swap y</label> -->
                </li>
            </ul>
            <p class='trade-buttons'>
                <button id="trade" @click='handle_trade' :disabled='selldisabled'>Sell</button>
            </p>
            <div class='info-message gentle-message' v-show='warningNoPool !== null'>
                Swap not available. Please select {{warningNoPool}} in pool select
            </div>
        </div>
	</div>
</template>

<script>
    import EventBus from './EventBus'

    import contractAbis, { ERC20_abi, cERC20_abi, yERC20_abi, onesplit_address, onesplit_abi } from '../../allabis'

    import { contract, LENDING_PRECISION, PRECISION, gas as contractGas } from '../../contract'
    import * as common from '../../utils/common'
    import * as helpers from '../../utils/helpers'
    import tradeStore from './tradeStore'

    import BN from 'bignumber.js'

    import * as Comlink from 'comlink'

    import Worker from 'worker-loader!./worker.js';
    const worker = new Worker();
    const calcWorker = Comlink.wrap(worker);

	export default {
		data: () => ({
            pools: ['compound', 'usdt', 'y', 'busd', 'susdv2'],
			maxBalance: '0.00',
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
            //DAI, USDC, USDT, TUSD, BUSD, sUSD
            coin_precisions: [1e18, 1e6, 1e6, 1e18, 1e18, 1e18],
            swap: [],
            addresses: [],
            coins: [],
            underlying_coins: [],
            onesplit: null,
            onesplit_address: '',
            //0x01+0x02+0x04+0x08+0x10+0x20+0x40+0x80+0x100+0x400+0x800+0x10000+0x20000+0x40000 -> 462335
            swapPromise: helpers.makeCancelable(Promise.resolve()),
            usedFlags: '',
            usedParts: 0,
            multipath: 0,
            swapwrapped: false,
            poolIndexes: [0, 1, 2, 3, 4],
            bestPool: null,
		}),
        computed: {
            //onesplit exchanges [uniswap, kyber, bancor, oasis, cCurve, tCurve, yCurve, bCurve, sCurve]
            CONTRACT_FLAG() {
                //disable uniswap, kyber, bancor, oasis, compound, fulcrum, chai, aave, smart token, bdai, iearn, weth, idle
                //enable multipath DAI, multipath USDC
                //enabled curve compound, curve usdt, curve y, curve binance, curve susd
                let disabled = 0x01 + 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x40 + 0x80 + 0x100 + 0x400 + 0x800 + 0x80000 + 0x800000;
                let enabled = 0x1000 + 0x2000 + 0x4000 + 0x8000 + 0x40000 
                let enabledMulti = 0x10000 + 0x20000
                let curveFlags = {
                    compound: 0x1000,
                    usdt: 0x2000,
                    y: 0x4000,
                    busd: 0x8000,
                    susdv2: 0x40000
                }
                let removePoolFlag = Object.keys(curveFlags).filter(f=>!this.pools.includes(f)).map(f=>curveFlags[f])
                removePoolFlag = removePoolFlag.reduce((a, b) => a + b, 0)
                return disabled + removePoolFlag + enabledMulti;
            },
            currencies() {
                if(this.swapwrapped === false) {
                    return {
                        dai: 'DAI',
                        usdc: 'USDC',
                        usdt: 'USDT',
                        tusd: 'TUSD',
                        busd: 'BUSD',
                        susd: 'sUSD'
                    }
                }
                if(this.swapwrapped == 1) {
                    return {
                        dai: 'cDAI',
                        usdc: 'cUSDC',
                    }
                }
                return {
                    dai: 'yDAI',
                    usdc: 'yUSDC',
                    tusd: 'yTUSD',
                    busd: 'yBUSD'
                }
            },
            actualFromValue() {
                if(!this.swapwrapped) return;
                return (this.fromInput * this.c_rates(this.from_currency)[this.from_currency] * this.precisions(this.from_currency)).toFixed(2)
            },
            actualToValue() {
                if(!this.swapwrapped) return;
                return (this.toInput * this.c_rates(this.to_currency)[this.to_currency] * this.precisions(this.to_currency)).toFixed(2)
            },
            bestPoolText() {
                if((this.from_currency == 3 && this.to_currency == 4) || (this.to_currency == 3 && this.from_currency == 4))
                    return '1split'
                if(this.bestPool === null) return 'Not available'
                return ['compound', 'usdt', 'y', 'busd', 'susd', '1split'][this.bestPool]
            },
            selldisabled() {
                return false
                /*if(this.from_currency == 5 && ![0,1,2].includes(this.to_currency) || this.to_currency == 5 && ![0,1,2].includes(this.from_currency))
                    return true
                return false;*/
            },
            allPools() {
                return ['compound', 'usdt', 'y', 'busd', 'susdv2']
            },
            warningNoPool() {
                this.message = 'Please select '
                let poolMessage = null
                if((this.from_currency == 5 || this.to_currency == 5) && !this.pools.includes('susdv2')) {
                    poolMessage = 'susd'
                }
                if((this.from_currency == 4 || this.to_currency == 4) && !this.pools.includes('busd')) {
                    poolMessage = 'busd'
                }
                if((this.from_currency == 3 || this.to_currency == 3) && !this.pools.includes('y')) {
                    poolMessage = 'y'
                }
                if((this.from_currency == 2 || this.to_currency == 2) && this.pools.find(pool=>['usdt', 'y', 'busd', 'susdv2'].includes(pool)) == undefined) {
                    poolMessage = 'usdt'
                }
                return poolMessage
            },
            decodeDistribution() {
                if(this.distribution === null) return []
                let distArr = []
                this.multipath = 0;
                //onesplit exchanges [uniswap, kyber, bancor, oasis, cCurve, tCurve, yCurve, bCurve, sCurve]
                //multipath USDC
                if(this.usedFlags == this.CONTRACT_FLAG - 0x10000 && this.distribution.find(v=>+v > this.usedParts) !== undefined) {
                    this.multipath = 1
                }
                //multipath DAI
                if(this.usedFlags == this.CONTRACT_FLAG - 0x20000 && this.distribution.find(v=>+v > this.usedParts) !== undefined) {
                    this.multipath = 2
                }
                //no multipath
                let curveDist = this.distribution.slice(4, 9);
                if(this.multipath == 0) {
                    distArr.push(curveDist)
                }
                else {
                    distArr.push(curveDist.map(v => v / 256))
                    distArr.push(curveDist.map(v => v % 256))
                }

                return distArr
            },
            distributionText() {
                if(!this.decodeDistribution.length) return null;
                let text = '';

                for(let j = this.decodeDistribution.length-1; j >= 0; j--) {
                    if(this.multipath > 0 && j == 1) 
                        text += Object.values(this.currencies)[this.from_currency] + ' -> ' + (this.multipath == 1 ? 'DAI' : 'USDC') + '<br>'

                    if(this.multipath > 0 && j == 0) 
                        text += (this.multipath == 1 ? 'DAI' : 'USDC') + ' -> ' + Object.values(this.currencies)[this.to_currency] + '<br>'

                    for(let [i, v] of this.decodeDistribution[j].entries()) {
                        if(v < 1) continue;
                        text += '' + (100 * v / this.usedParts).toFixed(2) + '% ' + this.pools[i] + '<br>';
                    }
                }

                return text;
            },
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
            pools() {
                this.from_cur_handler()
            },
            swapwrapped(val) {
                if(val) this.pools = this.pools.filter(p=>['compound','usdt'].includes(p))
                if(this.from_currency > 1) this.from_currency = 0
                else this.from_cur_handler()
            },
            warningNoPool(val, oldval) {
                if(val !== null) {
                    this.bgColor = 'red'
                    this.toInput = '0.00'
                    this.exchangeRate = 'Not available'
                }
            }
        },
        async created() {
            //EventBus.$on('selected', this.selectPool)
            this.$watch(()=>contract.allInitContracts.size, async (val) => {
                if(val >= 5)
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
            swapInputs() {
                //look no temp variable! :D
                [this.fromInput, this.toInput] = [this.toInput, this.fromInput]
                this.from_currency = this.to_currency
                this.from_cur_handler()
            },
            handleCheck(val) {
                if(this.swapwrapped === val) this.swapwrapped = false;
                else this.swapwrapped = val
            },
            c_rates(i) {
                if(this.swapwrapped == 2 && i < 3) return contract.contracts.iearn.c_rates
                if(this.swapwrapped == 2 && i == 3) return contract.contracts.busd.c_rates
                else return contract.c_rates;
            },
            getCoins(i) {
                if(this.swapwrapped == 1)
                    return this.coins.slice(0,2)[i]
                else if(this.swapwrapped == 2)
                    return this.coins.slice(2)[i]
                else
                    return this.underlying_coins[i]
            },
            normalizeCurrency(i) {
                if(i > 3) return 3
                return i;
            },
            precisions(i, contractName) {
                if(!this.swapwrapped) return this.coin_precisions[i]
                if(!contractName && this.swapwrapped == 1) contractName = 'compound'
                if(!contractName && this.swapwrapped == 2 && i < 3) contractName = 'iearn'
                if(!contractName && this.swapwrapped == 2 && i == 3) contractName = 'busd'
                if(!contractName) contractName = contract.currentContract
                if(this.swapwrapped) return contractAbis[contractName].wrapped_precisions[i];
                return contractAbis[contractName].coin_precisions[i]
            },
            async highlight_input() {
                var balance = parseFloat(await this.getCoins(this.from_currency).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call()) 
                                / this.precisions(this.from_currency);
                if (this.fromInput > balance)
                    this.fromBgColor = 'red'
                else
                    this.fromBgColor = 'blue'
            },
            async from_cur_handler() {
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
                var i = this.normalizeCurrency(this.from_currency)
                var j = this.normalizeCurrency(this.to_currency);
                let amount = BN(this.fromInput).times(this.precisions(i)).toFixed(0)
                let maxSlippage = this.maxSlippage / 100;
                if(this.maxInputSlippage) maxSlippage = this.maxInputSlippage / 100;
                let min_dy = BN(this.toInput).times(this.precisions(j)).times(BN(1 - maxSlippage)).toFixed(0)
                let pool = contract.currentContract
                let bestContract = contract;
                if(this.bestPool > 0 && this.bestPool < 5) {
                    let poolIdx = this.bestPool
                    pool = Object.keys(contract.contracts)[this.bestPool]
                    bestContract = contract.contracts[pool]
                }
                let address = bestContract.swap._address
                if(this.distribution !== null) {
                    address = this.onesplit_address
                    bestContract.swap._address = address
                }
                if (this.inf_approval)
                        await common.ensure_underlying_allowance(this.from_currency, contract.max_allowance, this.underlying_coins, address, this.swapwrapped, bestContract)
                    else
                        await common.ensure_underlying_allowance(this.from_currency, amount, this.underlying_coins, address, this.swapwrapped, bestContract);
                if(this.distribution !== null) {
                    await this.onesplit.methods.swap(
                            this.getCoins(i)._address,
                            this.getCoins(j)._address,
                            amount,
                            min_dy,
                            this.distribution,
                            this.usedFlags,
                        ).send({
                            from: contract.default_account,
                            gas: 6000000
                        })
                }
                else {
                    let exchangeMethod = bestContract.swap.methods.exchange_underlying
                    if(this.swapwrapped || this.bestPoolText == 'susd') exchangeMethod = bestContract.swap.methods.exchange
                    await exchangeMethod(i, j, amount, min_dy).send({
                            from: contract.default_account,
                            gas: this.swapwrapped ? contractGas.swap[pool].exchange(i, j) : contractGas.swap[pool].exchange_underlying(i, j),
                        });
                    
                    this.from_cur_handler();
                    let balance = await this.getCoins(i).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call();
                    if(!contract.default_account) balance = 0
                    let maxAmount = Math.floor(
                            100 * parseFloat(balance) / this.precisions(i)
                        ) / 100
                    this.maxBalance = maxAmount;
                }
            },
            async set_from_amount(i) {
                let balance = await this.getCoins(i).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call();
                if(!contract.default_account) balance = 0
                let amount = Math.floor(
                        100 * parseFloat(balance) / this.precisions(i)
                    ) / 100

                if (this.fromInput == '' || this.val == 0) {
                    if(!contract.default_account) balance = 0
                    this.fromInput = amount.toFixed(2)
                }
                this.maxBalance = amount.toFixed(2);
            },
            makeCall(amount, parts, flags) {
                if(this.swapwrapped == 1) flags -= 0x10
                if(this.swapwrapped == 2) flags -= 0x800
                return [
                    this.onesplit._address,
                    this.onesplit.methods.getExpectedReturn(
                        this.getCoins(this.from_currency)._address,
                        this.getCoins(this.to_currency)._address,
                        amount,
                        parts,
                        flags
                    ).encodeABI()
                ]
            },
            getCalls(amount) {
                let defaultCalls = [
                    this.makeCall(amount, 10, this.CONTRACT_FLAG - 0x10000 - 0x20000),
                    this.makeCall(amount, 20, this.CONTRACT_FLAG - 0x10000),
                    this.makeCall(amount, 30, this.CONTRACT_FLAG - 0x20000),
                ]
                let calls = defaultCalls.concat();
                if([3,4,5].includes(this.from_currency) && [3,4,5].includes(this.to_currency)) {
                    calls = defaultCalls.slice(1)
                    calls.push(
                        this.makeCall(amount, 15, this.CONTRACT_FLAG - 0x10000),
                        this.makeCall(amount, 15, this.CONTRACT_FLAG - 0x20000),
                    )
                }
                return calls
            },
            async set_to_amount_onesplit() {
                let amount = BN(this.fromInput).times(this.precisions(this.from_currency)).toFixed(0)
                let calls = this.getCalls(amount)
                this.swapPromise.cancel();
                let aggcalls = await contract.multicall.methods.aggregate(calls).call()
                this.swapPromise = helpers.makeCancelable(aggcalls)
                let split_swap = await this.swapPromise
                let decoded = split_swap[1].map(hex => contract.web3.eth.abi.decodeParameters(['uint256', 'uint256[]'], hex))
                let max = decoded.reduce((a, b) => a[0] > b[0] ? a : b)
                let decodedCall = contract.web3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint256', 'uint256'], 
                                                                calls[decoded.indexOf(max)][1].slice(10))
                this.usedFlags = decodedCall[4]
                this.usedParts = decodedCall[3]
                console.log(max, "1split swap", this.underlying_coins[this.from_currency], this.underlying_coins[this.to_currency])

                let amount_dy = max[0];
                let exchangeRate = BN(amount_dy).div(this.precisions(this.to_currency)).div(this.fromInput).toFixed(4);
                this.distribution = max[1]
                return ['1split', exchangeRate, amount_dy]
                // this.setExchangeRate(exchangeRate)
                // this.toInput = BN(amount_dy).div(this.precisions(this.to_currency)).toFixed(2);
                // this.disabled = false
            },
            setExchangeRate(exchangeRate) {
                if(+exchangeRate <= 0.98) this.bgColor = 'red'
                else this.bgColor= '#505070'
                if(isNaN(+exchangeRate)) this.exchangeRate = "Not available"
                else {
                    this.exchangeRate = (+exchangeRate).toFixed(4)
                }
            },
            getPoolsCalls() {
                let pools = this.pools
                let calls = []
                if(this.swapwrapped == 1) { 
                    pools = ['compound', 'usdt']
                    let dx = BN(this.fromInput).times(contractAbis.usdt.wrapped_precisions[this.from_currency])
                    calls = [
                        [
                            this.swap[0]._address,
                            this.swap[0].methods.get_dy(this.from_currency, this.to_currency, dx.toFixed(0,1)).encodeABI()
                        ],
                        [
                            this.swap[1]._address,
                            this.swap[1].methods.get_dy(this.from_currency, this.to_currency, dx.toFixed(0,1)).encodeABI()
                        ]
                    ]
                }
                if(!this.swapwrapped) {          
                    let dx = BN(this.fromInput).times(contractAbis.iearn.coin_precisions[this.from_currency])
                    //TUSD only in y pool
                    if((this.from_currency == 3 || this.to_currency == 3) && this.pools.includes('y')) {
                        calls = [
                            [
                                this.swap[2]._address,
                                this.swap[2].methods.get_dy_underlying(this.from_currency, this.to_currency, dx.toFixed(0,1)).encodeABI()
                            ]
                        ]
                    }
                    //BUSD only in b pool
                    else if((this.from_currency == 4 || this.to_currency == 4) && this.pools.includes('busd')) {

                        let from_currency = this.from_currency == 4 ? 3 : this.from_currency
                        let to_currency = this.to_currency == 4 ? 3 : this.to_currency

                        let dx = BN(this.fromInput).times(contractAbis.busd.coin_precisions[from_currency])

                        calls = [
                            [
                                this.swap[3]._address,
                                this.swap[3].methods.get_dy_underlying(from_currency, to_currency, dx.toFixed(0,1)).encodeABI()
                            ]
                        ]
                    }
                    //sUSD exchanges only in s pool
                    else if((this.from_currency == 5 || this.to_currency == 5) && this.pools.includes('susdv2')) {
                        let from_currency = this.from_currency == 5 ? 3 : this.from_currency;
                        let to_currency = this.to_currency == 5 ? 3 : this.to_currency;

                        let dx = BN(this.fromInput).times(contractAbis.susdv2.coin_precisions[from_currency])

                        calls = [
                            [
                                this.swap[4]._address,
                                this.swap[4].methods.get_dy(from_currency, to_currency, dx.toFixed(0,1)).encodeABI()
                            ]
                        ]
                    }
                    else {
                        //susd is already checked outside this function
                        //now coins are DAI, USDC, USDT, other cases are handled and they go through all pools
                        dx = BN(this.fromInput).times(contractAbis.usdt.coin_precisions[this.from_currency])
                        let poolidx = this.pools.map(pool => this.allPools.indexOf(pool))
                        if(this.from_currency == 2 || this.to_currency == 2) poolidx =  poolidx.filter(id => id != 0)
                        calls = poolidx.map(i =>
                            [
                                this.swap[i]._address, 
                                this.swap[i].methods.get_dy_underlying(this.from_currency, this.to_currency, dx.toFixed(0,1)).encodeABI()
                            ]
                        )
                    }
                }
                return calls
            },
            async realComparePools() {
                //use addresses of coins instead of checking from_currency, to_currency?
                let calls = this.getPoolsCalls();
                let aggcalls = await contract.multicall.methods.aggregate(calls).call()
                let decoded = aggcalls[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
                let poolRates = calls.map((call, i) => [call[0], decoded[i]])
                return poolRates.reduce((a, b) => {
                    if(b[0].toLowerCase() == '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD'.toLowerCase()) {
                        let precisions = this.precisions(this.to_currency)
                        return (+a[1] / precisions > (+b[1] / precisions + 2)) ? a : b 
                    }
                    else return +a[1] > +b[1] ? a : b
                })
            },
            async comparePools() {
                let pools = this.pools;
                let poolInfo = tradeStore.poolInfo
                if(this.swapwrapped == 1) { 
                    pools = ['compound', 'usdt']
                    poolInfo = poolInfo.slice(0,2)
                }
                if(this.swapwrapped == 2) { 
                    pools = ['iearn', 'busd']
                    poolInfo = poolInfo.slice(2)
                }
                let poolConfigs = pools.map(pool => {
                    return {
                        N_COINS: contractAbis[pool].N_COINS,
                        PRECISION_MUL: contractAbis[pool].coin_precisions.map(p=>1e18/p),
                        USE_LENDING: contractAbis[pool].USE_LENDING,
                        LENDING_PRECISION,
                        PRECISION,
                    }
                })
                //map pools to 0 - compound, 1 - usdt, 2 - y, 3 - busd
                let bestPool = 0;
                let bestExchangeRate = 0;
                let bestDy = 0
                let get_to_amount = calcWorker.calcPrice
                let realExchangeRate;
                if(this.swapwrapped) get_to_amount = calcWorker.calcPriceWrapped
                //without susd
                for(let i = 0; i < pools.length; i++) {
                    if(poolConfigs[i].N_COINS-1 < this.to_currency || poolConfigs[i].N_COINS-1 < this.from_currency) continue;
                    let dx = this.fromInput * this.precisions(this.from_currency, pools[i])
                    let config = {...poolInfo[i], ...poolConfigs[i]}
                    let dy = await get_to_amount(config, this.from_currency, this.to_currency, BN(dx).toFixed(0), true)
                    dy = +(BN(dy).div(this.precisions(this.to_currency)))
                    let exchangeRate = dy / dx * this.precisions(this.from_currency, pools[i])
                    if(exchangeRate > bestExchangeRate) {
                        bestPool = i
                        bestExchangeRate = exchangeRate
                        bestDy = dy;
                    }
                }
                if(this.swapwrapped == 2) bestPool+=2
                if(this.swapwrapped) {
                    let bestContract = contract
                    let pool = contract.currentContract
                    if(bestPool > 0) {
                        pool = Object.keys(contract.contracts)[bestPool]
                        bestContract = contract.contracts[pool]
                    }
                    let cdy_ = bestDy * bestContract.c_rates[this.to_currency] 
                                * contractAbis[bestContract.currentContract].wrapped_precisions[this.to_currency]
                    let cdx_ = this.fromInput * bestContract.c_rates[this.from_currency] 
                                * contractAbis[bestContract.currentContract].wrapped_precisions[this.from_currency]
                    exchangeRateConverted = (cdy_ / cdx_)
                    return [bestPool, exchangeRateConverted]
                }
                return [bestPool, bestExchangeRate]
            },
            async set_to_amount() {
                this.distribution = null
                let minAmount = 10000
                if(this.swapwrapped) minAmount *= 50
                let exchangeRate;
                let bestdy_ = 0;
                try {
                    if(this.fromInput == 0) {
                        this.disabled = false;
                        this.toInput = '0.00';
                        return;
                    }
                    /*if(this.from_currency == 5 || this.to_currency == 5) {
                        let dx = BN(this.fromInput * this.precisions(this.from_currency)).toFixed(0, 1)
                        let actualFromCurrency = this.normalizeCurrency(this.from_currency)
                        let actualToCurrency = this.normalizeCurrency(this.to_currency)
                        let dy = await this.swap[2].methods.get_dy_underlying(actualFromCurrency, actualToCurrency, dx).call()
                        this.bestPool = 4;
                        dy = +(BN(dy).div(this.precisions(this.to_currency)))
                        exchangeRate = dy / dx * this.precisions(this.from_currency)
                    }
                    else*/ if(!([3,4,5].includes(this.from_currency) && [3,4,5].includes(this.to_currency))) {
                        this.swapPromise.cancel()
                        this.swapPromise = helpers.makeCancelable(Promise.all([this.realComparePools(), this.set_to_amount_onesplit()]))
                        let result = await this.swapPromise
                        let [poolAddress, dy] = result[0]
                        let pool = this.addresses.find(v => v.address == poolAddress).pool
                        let dy_ = BN(dy).div(this.precisions(this.to_currency, pool))
                        exchangeRate = BN(dy_).div(BN(this.fromInput)).toFixed(4)
                        bestdy_ = dy_
                        let [pool1, exchangeRate1, dy_1split] = result[1]
                        let useOneSplit = ((this.fromInput * exchangeRate1) - (this.fromInput * exchangeRate)) > 2
                        if(exchangeRate < exchangeRate1 && useOneSplit) {
                            exchangeRate = exchangeRate1
                            pool = '1split'
                        }
                        else this.distribution = null
                        this.bestPool = ['compound', 'usdt', 'iearn', 'busd', 'susdv2', '1split'].indexOf(pool)
                    }
                    else {
                        exchangeRate = (await this.set_to_amount_onesplit())[1]
                        this.bestPool = 5
                    }
                    let address = this.swap[this.bestPool]._address
                    if (BN(await this.getCoins(this.from_currency).methods.allowance(contract.default_account || '0x0000000000000000000000000000000000000000', address).call()).gt(contract.max_allowance.div(BN(2))))
                        this.inf_approval = true;
                    else
                        this.inf_approval = false;

                    //show converted exchange rate when swapping wrapped coins?
                    this.toInput = BN(this.fromInput).times(BN(exchangeRate)).toFixed(2);
                    if(this.swapwrapped) {
                        let cdy_ = bestdy_ * this.c_rates(this.to_currency)[this.to_currency] * contractAbis.compound.wrapped_precisions[this.to_currency]
                        let cdx_ = this.fromInput * this.c_rates(this.from_currency)[this.from_currency] * contractAbis.compound.wrapped_precisions[this.from_currency]
                        exchangeRate = (cdy_ / cdx_)
                    }
                    this.setExchangeRate(exchangeRate)
                }
                catch(err) {
                    console.error(err)
                }
                finally {
                    this.highlight_input()
                }
            },
			async set_max_balance() {
                let balance = await this.getCoins(this.from_currency).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call();
                if(!contract.default_account) balance = 0
                let amount = Math.floor(
                        100 * parseFloat(balance) / this.precisions(this.from_currency)
                    ) / 100
                this.fromInput = amount.toFixed(2)
                await this.set_to_amount();
			},
            async setup() {
                this.onesplit_address = await contract.web3.eth.ens.getAddress('1split.eth')
                this.onesplit = new contract.web3.eth.Contract(onesplit_abi, this.onesplit_address)
                this.swap = []
                this.addresses = []
                let abis = Object.keys(contractAbis).filter(p => p != 'susd' && p != 'y')
                for(let pool of abis) {
                    this.swap.push(new contract.web3.eth.Contract(contractAbis[pool].swap_abi, contractAbis[pool].swap_address))
                    this.addresses.push({address: contractAbis[pool].swap_address, pool: pool})
                }

                this.swap.push(this.onesplit)

                this.coins.push(new contract.web3.eth.Contract(cERC20_abi, contractAbis.compound.coins[0]))
                this.coins.push(new contract.web3.eth.Contract(cERC20_abi, contractAbis.compound.coins[1]))
                for(let i = 0; i < 4; i++) {
                    let coin_abi = cERC20_abi
                    this.coins.push(new contract.web3.eth.Contract(yERC20_abi, contractAbis.iearn.coins[i]))
                    this.underlying_coins.push(new contract.web3.eth.Contract(ERC20_abi, contractAbis.iearn.underlying_coins[i]))
                }
                this.coins.push(new contract.web3.eth.Contract(yERC20_abi, contractAbis.busd.coins[3]))
                this.underlying_coins.push(new contract.web3.eth.Contract(ERC20_abi, contractAbis.busd.underlying_coins[3]))

                //susd
                    //coins and undelying_coins are the same
                this.coins.push(new contract.web3.eth.Contract(ERC20_abi, contractAbis.susdv2.coins[3]))
                this.underlying_coins.push(new contract.web3.eth.Contract(ERC20_abi, contractAbis.susdv2.underlying_coins[3]))
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
    .actualvalue {
        margin: 0.5em 0 0 0;
        text-align: right;
        font-size: 0.9em;
    }
    .exchange {
        width: 60%;
    }
    #best-pool .tooltiptext {
        text-align: left;
        padding-left: 1em;
    }
    @media only screen and (max-device-width: 1200px) {
        .exchange {
            width: 80%;
        }
    }
</style>