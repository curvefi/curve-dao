<template>
	<div>
		
		<div :class="{'window white': !included}">
			<proposed-gauge-weight :future_weights='future_weights'></proposed-gauge-weight>
		</div>
		<div :class="{'window white': !included, 'futureCRVAPYs': true}">
			<fieldset class='poolsdialog'>
				<legend>
					Proposed future <img class='icon small' :src="publicPath + 'logo.png'"> CRV APYs
					<br> taking effect on {{ formatDate(nextTime).split(' ')[0] }} UTC
				</legend>
				<table class='tui-table'>
					<thead>
						<tr>
							<th></th>
							<th>Pool</th>
							<th>Current <img class='icon small' :src="publicPath + 'logo.png'"> CRV APY</th>
							<th>Future <img class='icon small' :src="publicPath + 'logo.png'"> CRV APY</th>
						</tr>
					</thead>
					<tbody>
						<tr v-show='!futureCRVAPYs.sbtc'>
							<td><span class='loading line'></span></td>
							<td><span class='loading line'></span></td>
							<td><span class='loading line'></span></td>
							<td><span class='loading line'></span></td>
						</tr>
						<tr v-show='futureCRVAPYs.sbtc' v-for='(pool, i) in Object.values(gaugesNames)'>
							<td>
								<a :href="'https://curve.fi/' + pool">
									{{ i }}.
								</a>
							</td>
							<td>
								<a :href="'https://curve.fi/' + pool">
									{{ pool }}
								</a>
							</td>
							<td>
								<a :href="'https://curve.fi/' + pool">
									<span>
										{{ currentCRVAPYs[pool] && currentCRVAPYs[pool].toFixed(2) }}% 
										<span v-show="currentCRVAPYs[pool] > 0">
											to {{ currentCRVAPYs[pool] && (currentCRVAPYs[pool] * 2.5).toFixed(2) }}%
										</span>
									</span>
								</a>
							</td>
							<td>
								<a :href="'https://curve.fi/' + pool">
									<span>
										{{ futureCRVAPYs[pool] && futureCRVAPYs[pool].toFixed(2) }}% 
										<span v-show="futureCRVAPYs[pool] > 0">
											to {{ futureCRVAPYs[pool] && (futureCRVAPYs[pool] * 2.5).toFixed(2) }}%
										</span>
									</span>
								</a>
							</td>

						</tr>
					</tbody>
				</table>
			</fieldset>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue'

	import { contract, getters } from '../../../contract'
	import { notify, notifyHandler, notifyNotification } from '../../../init'

	import daoabis from '../../dao/allabis'

	import * as gasPriceStore from '../../common/gasPriceStore'
    import GasPrice from '../../common/GasPrice.vue'

	import BN from 'bignumber.js'

	const WEEK = 604800

	const WEIGHT_VOTE_DELAY = 10 * 86400

	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)
	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'
	stockInit(Highcharts)

	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})

	import ProposedGaugeWeight from './ProposedGaugeWeight.vue'

	import * as statsStore from './statsStore'

	import * as helpers from '../../../utils/helpers'

	export default {
		components: {
			GasPrice,
			Highcharts: Chart,
			ProposedGaugeWeight: ProposedGaugeWeight,
		},

		props: {
			included: {
				type: Boolean,
				default: false,
			},
		},

		data: () => ({
			votingEscrow: null,
			gaugeController: null,

			gaugesNames: {
			  "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575": 'compound',
			  "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53": 'usdt',
			  "0x64E3C23bfc40722d3B649844055F1D51c1ac041d": 'pax',
			  "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1": 'y',
			  "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840": 'busd',
			  "0xA90996896660DEcC6E997655E065b23788857849": 'susdv2',
			  "0xB1F2cdeC61db658F091671F5f199635aEF202CAC": 'ren',
			  "0x705350c4BcD35c9441419DdD5d2f097d7a55410F": 'sbtc',
			},
			selectedGauge: "0x0000000000000000000000000000000000000000",
			weight: 1,
			balance: null,
			lock_end: null,
			next_time: null,
			last_user_vote: null,
			old_slope: null,
			power_used: null,

			message: '',

			piechartdata: {
					chart: {
				        plotBackgroundColor: null,
				        plotBorderWidth: null,
				        plotShadow: false,
				        type: 'pie'
				    },
				    title: {
				        text: 'Proposed future gauge weights'
				    },
				    tooltip: {
				        pointFormat: '{series.name}: <b>{point.y:.2f}%</b>'
				    },
				    accessibility: {
				        point: {
				            valueSuffix: '%'
				        }
				    },
				    plotOptions: {
				        pie: {
				            allowPointSelect: true,
				            cursor: 'pointer',
				            dataLabels: {
				                enabled: true,
				                formatter: (function(self) {
				                	return function(point) { 
				                		return `<b>${this.key}</b>: 
				                		(${this.y.toFixed(2)}%)`
				                	}
				                })(this),
				            }
				        }
				    },
				    series: [],
				},

				currentWeights: {},
				futureWeights: {},

				currentCRVAPYs: {},
				futureCRVAPYs: {},

				future_weights: [],

				poolInfo: {
					compound: {
						swap: '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56',
						swap_token: '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2',
						name: 'compound',
						gauge: '0x7ca5b0a2910B33e9759DC7dDB0413949071D7575',
					},
					usdt: {
						swap: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
						swap_token: '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23',
						name: 'usdt',
						gauge: '0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53',
					},
					y: {
						swap: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
						swap_token: '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
						name: 'y',
						gauge: '0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1',
					},
					busd: {
						swap: '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
						swap_token: '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B',
						name: 'busd',
						gauge: '0x69Fb7c45726cfE2baDeE8317005d3F94bE838840',
					},
					susdv2: {
						swap: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
						swap_token: '0xC25a3A3b969415c80451098fa907EC722572917F',
						name: 'susdv2',
						gauge: '0xA90996896660DEcC6E997655E065b23788857849',
					},
					pax: {
						swap: '0x06364f10B501e868329afBc005b3492902d6C763',
						swap_token: '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8',
						name: 'pax',
						gauge: '0x64E3C23bfc40722d3B649844055F1D51c1ac041d',
					},
					ren: {
						swap: '0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
						swap_token: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
						name: 'ren',
						gauge: '0xB1F2cdeC61db658F091671F5f199635aEF202CAC',
					},
					sbtc: {
						swap: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
						swap_token: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
						name: 'sbtc',
						gauge: '0x705350c4BcD35c9441419DdD5d2f097d7a55410F',
					},
				}
		}),

		async created() {
			this.$watch(() => contract.multicall, (val, oldval) => {
			 	if(val) this.mounted()
			})
		},

		async mounted() {
			if(contract.multicall) {
				this.mounted()
			}
		},

		watch: {
			
		},

		computed: {
			publicPath() {
                return process.env.BASE_URL
            },
            nextTime() {
            	return 1599091200
            },
		},

		methods: {
			async mounted() {

				this.gaugeController = new contract.web3.eth.Contract(daoabis.gaugecontroller_abi, '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB')
				let example_gauge = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, '0x7ca5b0a2910B33e9759DC7dDB0413949071D7575')

				let calls = [
					[this.gaugeController._address, this.gaugeController.methods.get_total_weight().encodeABI()],
				]
				calls.push(...Object.keys(this.gaugesNames).map(gauge => [this.gaugeController._address, this.gaugeController.methods.get_gauge_weight(gauge).encodeABI()]))

				let aggcalls = await contract.multicall.methods.aggregate(calls).call()

				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				let total_weight = +decoded[0]

				decoded.slice(1).map((v, i) => statsStore.state.gaugesWeights[web3.utils.toChecksumAddress('0x' + calls[i+1][1].slice(34))] = v)
				decoded.slice(1).map((v, i) => statsStore.state.calculatedWeights[web3.utils.toChecksumAddress('0x' + calls[i+1][1].slice(34))] = v)

				let future_weights = decoded.slice(1).map((v, i) => ({name: this.gaugesNames[web3.utils.toChecksumAddress('0x' + calls[i+1][1].slice(34))], y: v * 1e18 * 100 / total_weight}))

				decoded.slice(1).map((v, i) => {
					statsStore.state.pieGaugeWeights[web3.utils.toChecksumAddress('0x' + calls[i+1][1].slice(34))] = v * 1e18 * 100 / total_weight
				})

				Object.values(future_weights.map(v => this.futureWeights[v.name] = v.y))

				this.future_weights = future_weights

				await this.getCRVAPY()
				console.log(this.currentCRVAPYs)
				for(let pool of Object.keys(this.currentCRVAPYs)) {
					let change = this.futureWeights[pool] / this.currentWeights[pool]
					if(!isFinite(change)) change = 0
					Vue.set(this.futureCRVAPYs, pool, this.currentCRVAPYs[pool] * change)
					statsStore.state.currentCRVAPYs[Object.values(this.poolInfo).find(v => v.name == pool).gauge] = this.currentCRVAPYs[pool] * change
				}
				console.log(this.futureCRVAPYs)				
			},

			async getCRVAPY() {

				let decodedGauges = [
				  "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575",
				  "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53",
				  "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1",
				  "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840",
				  "0x64E3C23bfc40722d3B649844055F1D51c1ac041d",
				  "0xB1F2cdeC61db658F091671F5f199635aEF202CAC",
				  "0xA90996896660DEcC6E997655E065b23788857849",
				  "0x705350c4BcD35c9441419DdD5d2f097d7a55410F"
				]

				let gaugeController_address = '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB'
				let gauge_relative_weight = '0x6207d866000000000000000000000000'

				let pools = ['compound','usdt','iearn','busd','susdv2','pax','ren','sbtc']

				let prices = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,curve-dao-token&vs_currencies=usd')
				prices = await prices.json()
				let btcPrice = prices.bitcoin.usd
				let CRVprice = prices['curve-dao-token'].usd

				let weightCalls = decodedGauges.map(gauge => [gaugeController_address, gauge_relative_weight + gauge.slice(2)])

				let aggCallsWeights = await contract.multicall.methods.aggregate(weightCalls).call()
				let decodedWeights = aggCallsWeights[1].map((hex, i) => [weightCalls[i][0], web3.eth.abi.decodeParameter('uint256', hex) / 1e18])

				let ratesCalls = decodedGauges.map(gauge => [
					[gauge, "0x180692d0"],
					[gauge, "0x17e28089"],
				])

				let aggRates = await contract.multicall.methods.aggregate(ratesCalls.flat()).call()
				let decodedRate = aggRates[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				let gaugeRates = decodedRate.filter((_, i) => i % 2 == 0).map(v => v / 1e18)
				let workingSupplies = decodedRate.filter((_, i) => i % 2 == 1).map(v => v / 1e18)

				let virtualPriceCalls = Object.values(this.poolInfo).map(v => [v.swap, "0xbb7b8b80"])
				let aggVirtualPrices = await contract.multicall.methods.aggregate(virtualPriceCalls).call()
				let decodedVirtualPrices = aggVirtualPrices[1].map((hex, i) => [virtualPriceCalls[i][0], web3.eth.abi.decodeParameter('uint256', hex) / 1e18])

				let weightData = decodedWeights.map((w, i) => {
					let pool = Object.values(this.poolInfo).find(v => v.gauge.toLowerCase() == '0x' + weightCalls[i][1].slice(34).toLowerCase()).name
					let swap_address = this.poolInfo[pool].swap
					let virtual_price = decodedVirtualPrices.find(v => v[0].toLowerCase() == swap_address.toLowerCase())[1]
					let _working_supply = workingSupplies[i]
					if(['ren', 'sbtc'].includes(pool))
						_working_supply *= btcPrice
					let rate = (gaugeRates[i] * w[1] * 31536000 / _working_supply * 0.4) / virtual_price
					let apy = rate * CRVprice * 100
					if(isNaN(apy))
						apy = 0
					Object.values(this.poolInfo).find(v => v.name == pool).gauge_relative_weight = w[1]
					Vue.set(this.currentWeights, pool, w[1] * 100)
					Vue.set(this.currentCRVAPYs, pool, apy)
					//Vue.set(this.CRVAPYs, pool, apy)
				})
			},
			formatDate(timestamp) {
				return helpers.formatDateToHuman(timestamp)
			},

		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	select.tvision {
		box-shadow: none
	}
	.weight {
		margin-top: 1em;
	}
	.weight input {
		width: 4em;
	}
	.weight input.invalid {
		background: red;
	}
	.allocationInfo {
		margin-top: 1em;
	}
	button {
		margin-top: 1em;
	}
	.gaugeweight {
		margin-top: 1em;
	}
	select option {
		text-align: justify;
	}

	table {
		width: 100%;
		margin-top: 0.4em;
	}
	tbody tr td a {
		display: inline-block;
		min-height: 100%;
		width: 100%;
		font-weight: normal;
	}
	tbody tr td {
		cursor: pointer;
	}
	tbody tr:hover {
		background: blue;
		color: white;
	}
	tbody tr:hover td {
		color: white;
	}
	thead tr {
		border-bottom: 1px solid #a8a8a8;
	}
	thead tr th {
		color: #202020;
	}
	tbody tr td {
		padding-top: 10px;
		padding-left: 1em;
		color: black;
	}
	tbody tr td:nth-child(6) a {
		font-weight: normal;
	}

	.futureCRVAPYs {
		margin-top: 3em;
	}
</style>