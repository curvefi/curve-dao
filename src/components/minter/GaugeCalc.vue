<template>
	<div class='window white'>
		<fieldset>
			<legend>
				Gauge Boost Calculator
			</legend>
			<div>
				<select class='tvision' v-model='selectedGauge'>
					<option v-for='(gauge, address) in gaugesNames' :value='address'>
						{{ gauge }}
					</option>
				</select>
				<div>
					<label for='balance'>Deposit:</label>
					<input id='balance' type='text' v-model='gaugeBalance'>
				</div>
				<div>
					<label for='poolliquidity'>Pool liquidity:</label>
					<input id='poolliquidity' type='text' v-model='poolLiquidity'>
				</div>
				<div>
					<div class='radio'>
						<input type='radio' id='entercrv' v-model='entertype' value='0'>
						<label for='entercrv'>CRV</label>
					</div>

					<div class='radio'>
						<input type='radio' id='entervecrv' v-model='entertype' value='1'>
						<label for='entervecrv'>veCRV</label>
					</div>


					<div v-show='entertype == 0'>
						<div>
							<label for='mycrv'>My CRV:</label>
							<input id='mycrv' type='text' v-model='myCRV'>
						</div>
						Locked for:
						<select class='tvision lockperiod' v-model='lockPeriod'>
							<option v-for='(name, period) in lockPeriods' :value='name'>
								{{ period }}
							</option>
						</select>
						<div class='calcveCRV'>
							{{ veCRV }} veCRV
						</div>
					</div>

					<div v-show='entertype == 1'>
						<label for='myvecrv'>My veCRV:</label>
						<input id='myvecrv' type='text' v-model='myveCRV'>
					</div>
				</div>
				<div>
					<label for='totalvecrv'>Total veCRV:</label>
					<input id='totalvecrv' type='text' v-model='totalveCRV'>
				</div>
				<div class='submit'>
					<button @click='calc'>Calculate</button>
				</div>
				<div class='boost'>
					Boost: 
					<span v-show='!isNaN(boost)'>{{ boost.toFixed(2) }}x</span>
					<span v-show='isNaN(boost)'>Please enter a deposit and veCRV amount</span>
				</div>
				<div class='minveCRVmax'>
					max boost possible: {{ maxBoostPossible && maxBoostPossible.toFixed(2) }}x
					<div>min veCRV for Max boost: 
						<span v-show='gaugeBalance > 0'>
							{{ minveCRV && minveCRV.toFixed(2) }} veCRV
						</span>
						<span v-show='gaugeBalance == 0'>
							Please enter a deposit amount
						</span>
						<div v-show='gaugeBalance > 0'>
							This is {{ CRVtoLock }} for a
							<select class='tvision lockperiod' v-model='minveCRVperiod'>
								<option v-for='(name, period) in lockPeriods' :value='name'>
									{{ period }}
								</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
    import { notify, notifyHandler, notifyNotification } from '../../init'

	import * as common from '../../utils/common'

	import allabis, { ERC20_abi } from '../../allabis'
	import daoabis from '../dao/allabis'

	import * as gaugeStore from './gaugeStore'
	import * as veStore from './veStore'

	import BN from 'bignumber.js'

	import * as helpers from '../../utils/helpers'

    import * as gasPriceStore from '../common/gasPriceStore'

    let year = 365*24*60*60

	export default {
		props: ['i'],


		data: () => ({
			gaugesNames: {
			  "0x0000000000000000000000000000000000000000": 'Select a gauge',
			  "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575": 'compound',
			  "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53": 'usdt',
			  "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1": 'y',
			  "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840": 'busd',
			  "0x64E3C23bfc40722d3B649844055F1D51c1ac041d": 'pax',
			  "0xB1F2cdeC61db658F091671F5f199635aEF202CAC": 'ren',
			  "0xA90996896660DEcC6E997655E065b23788857849": 'susdv2',
			  "0x705350c4BcD35c9441419DdD5d2f097d7a55410F": 'sbtc',
			},

			lockPeriods: {
				'4 years': 4*year,
				'3 years': 3*year,
				'2 years': 2*year,
				'1 year': 1*year,
				'6 months': year/2,
				'1 month': year/12,
				'1 week': year/52,
			},

			lockPeriod: year,

			minveCRVperiod: year,

			selectedGauge: "0x0000000000000000000000000000000000000000",

			gaugeBalance: 0,
			poolLiquidity: 0,

			entertype: 0,

			myCRV: 0,
			myveCRV: 0,
			totalveCRV: 0,

			gaugeController: null,
			votingEscrow: null,

			gauge: null,

			boost: 1,

			minveCRV: null,

			maxBoostPossible: null,

		}),

		computed: {
			calcTrigger() {
				return this.gaugeBalance, this.poolLiquidity, this.myveCRV, this.totalveCRV, this.veCRV, this.entertype, Date.now()
			},
			veCRV(lock) {
		  		return ((this.myCRV * this.lockPeriod) / (86400 * 365) / 4).toFixed(2)
		  	},
		  	CRVtoLock() {
		  		return (this.minveCRV / ((this.minveCRVperiod / year) / 4)).toFixed(2)
		  	},
		},

		watch: {
			async selectedGauge(val) {
				if(val != "0x0000000000000000000000000000000000000000") {
					this.gauge = new web3.eth.Contract(daoabis.liquiditygauge_abi, this.selectedGauge)
					this.gaugeBalance = this.toFixed(await this.gauge.methods.balanceOf(contract.default_account).call() / 1e18)
					this.poolLiquidity = this.toFixed(await this.gauge.methods.totalSupply().call() / 1e18)
				}
			},
			calcTrigger() {
				this.calc()
				this.maxBoost()
			},
		},

		async created() {
			this.$watch(() => contract.initializedContracts, (val, oldval) => {
			 	if(val) this.mounted()
			})
		},

		mounted() {
			if(contract.multicall) {
				this.mounted()
			}
		},

		methods: {
			async mounted() {
				let CRV = new contract.web3.eth.Contract(ERC20_abi, daoabis.CRV_address)
				this.gaugeController = new contract.web3.eth.Contract(daoabis.gaugecontroller_abi, '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB')
				this.votingEscrow = new contract.web3.eth.Contract(daoabis.votingescrow_abi, '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2')
				this.myCRV = (await CRV.methods.balanceOf(contract.default_account).call() / 1e18).toFixed(2)
				this.myveCRV = (await this.votingEscrow.methods.balanceOf(contract.default_account).call() / 1e18).toFixed(2),
				this.totalveCRV = (await this.votingEscrow.methods.totalSupply().call() / 1e18).toFixed(2)

				let example_gauge = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, '0x7ca5b0a2910B33e9759DC7dDB0413949071D7575')
				let calls = Object.keys(this.gaugesNames).slice(1).map(gauge => [gauge, example_gauge.methods.balanceOf(contract.default_account).encodeABI()])
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map((hex, i) => web3.eth.abi.decodeParameter('uint256', hex))
				let gaugeIndex = decoded.findIndex(v => v > 0)
				this.selectedGauge = calls[gaugeIndex][0]

			},

			async calc() {
				let [_, boost] = await this.update_liquidity_limit()
				this.boost = boost
			},

			async maxBoost() {
				let l = this.gaugeBalance * 1e18
				let L = +this.poolLiquidity*1e18 + l
				let minveCRV = this.totalveCRV * l / L
				this.minveCRV = minveCRV

				let [_, maxBoostPossible] = await this.update_liquidity_limit(null, null, this.minveCRV)
				this.maxBoostPossible = maxBoostPossible
			},

			async update_liquidity_limit(new_l = null, new_voting_balance = null, minveCRV = null) {
				let l = this.gaugeBalance * 1e18

				let calls = [
					[this.votingEscrow._address, this.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[this.votingEscrow._address, this.votingEscrow.methods.totalSupply().encodeABI()],
					[this.gauge._address, this.gauge.methods.period_timestamp(0).encodeABI()],
					[this.gauge._address, this.gauge.methods.working_balances(contract.default_account).encodeABI()],
					[this.gauge._address, this.gauge.methods.working_supply().encodeABI()],
					[this.gauge._address, this.gauge.methods.totalSupply().encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				let voting_balance = +decoded[0]
				let voting_total = +decoded[1] - +voting_balance
				let period_timestamp = +decoded[2]
				let working_balances = +decoded[3]
				let working_supply = +decoded[4]
				let L = +this.poolLiquidity*1e18 + l


				if(new_voting_balance) {
					voting_balance = new_voting_balance * 1e18
				}

				voting_total += voting_balance


				let TOKENLESS_PRODUCTION = 40

				let lim = l * TOKENLESS_PRODUCTION / 100
				let veCRV = this.myveCRV
				if(minveCRV)
					veCRV = minveCRV
				else if(this.entertype == 0)
					veCRV = this.veCRV
				lim += L * veCRV / this.totalveCRV * (100 - TOKENLESS_PRODUCTION) / 100

				lim = Math.min(l, lim)
				
				let old_bal = working_balances
				let noboost_lim = TOKENLESS_PRODUCTION * l / 100
				let noboost_supply = working_supply + noboost_lim - old_bal
				let _working_supply = working_supply + lim - old_bal

				// let limCalc = (l * TOKENLESS_PRODUCTION / 100 + (this.poolLiquidity + l) * veCRV / this.totalveCRV * (100 - TOKENLESS_PRODUCTION) / 100)
				// boost = limCalc
				// 		/ (working_supply + limCalc - old_bal)

				return [_working_supply, (lim / _working_supply) / (noboost_lim / noboost_supply)]

			},

			shortenAddress(address) {
				if(!address) return ''
				if(address == "0x0000000000000000000000000000000000000000") return ''
				return address.slice(0,6) + '...' + address.slice(-6)
			},

			toFixed(num) {
                if(num == '' || num == undefined || +num == 0) return '0.00'
                if(!BN.isBigNumber(num)) num = +num
                if(['ren', 'sbtc'].includes(this.gaugesNames[this.selectedGauge])) return num.toFixed(8)
                return num.toFixed(2)
            },
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	label {
		margin-top: 1em;
		display: block;
	}
	input {
		margin-top: 0.1em;
		width: 10em;
	}
	select.tvision {
		box-shadow: none;
	}
	.submit {
		margin-top: 1em;
	}
	.boost {
		margin-top: 1em;
	}
	.radio:nth-of-type(1) {
		margin-right: 1em;
	}
	.radio {
		display: inline-block;
	}
	.lockperiod, .calcveCRV, .minveCRVmax {
		margin-top: 1em;
	}
</style>