<template>
	<div>
		<div class='window white' v-if='showChart'>
			<highcharts :options="piechartdata" ref='piecharts'></highcharts>
		</div>
		<div class='window white' v-if='showChart'>
			<highcharts :options="piegaugechartdata" ref='piegaugecharts'></highcharts>
		</div>
		<div class='window white'>
			<voting-escrow :showchart='false'></voting-escrow>
		</div>
		<div class='window white' v-show='loading'>
			<span class='loading matrix'></span>
		</div>
		<div class='window white' v-show='totalClaimableCRV > 0 || totalMintedCRV > 0'>
			<div v-show='totalMintedCRV > 0'>
				Total minted CRV from gauges: {{ totalMintedCRVFormat }}
			</div>

			<div v-show='totalClaimableCRV > 0' class='totalClaimableCRV'>
				All claimable CRV from gauges: {{ totalClaimableCRVFormat }}

				<p>
					Choose gauges to claim from: <span v-for='gauge in myGauges' class='claimGaugeSelect'>
						<input :id="'gauge' + gauge.name" type='checkbox' v-model='claimFromGauges' :value='gauge'>
						<label :for="'gauge' + gauge.name">{{ gauge.name }}</label>
					</span>

					<p class='info-message gentle-message claimAllWarning'>
						Claiming from a gauge will update your boost
					</p>

					<p>
						<button @click='claim'>Claim {{ claimFromGauges.length == myGauges.length ? 'all' : '' }}</button>
					</p>
				</p>
			</div>

			<div class='applyBoostAll' v-show='showApplyBoostAll'>
				Apply boost to {{ gaugesNeedApplyNames.join(', ') }} gauges
				<button @click='applyBoostAll'>Apply all</button>
			</div>
		</div>
		<div class='window white' v-show='totalBalance == 0 && totalGaugeBalance == 0'>
			<div class='info-message gentle-message'>
				You don't have any Curve pool LP tokens
			</div>
		</div>
		<div class='window white'>
			<gas-price></gas-price>
		</div>
		<gauge v-for='(pool, i) in mypools' :key = 'i' :i = 'i'></gauge>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
    import { notify, notifyHandler, notifyNotification } from '../../init'

	import allabis from '../../allabis'
	import daoabis from '../dao/allabis'

	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)

	import {Chart} from 'highcharts-vue'
	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})

	import * as gaugeStore from './gaugeStore'

	import Gauge from './Gauge'

	import VotingEscrow from './VotingEscrow'

	import * as gasPriceStore from '../common/gasPriceStore'
    import GasPrice from '../common/GasPrice.vue'

    import { getBTCPrice } from '../common/priceStore'

	export default {
		components: {
			Gauge,
			VotingEscrow,
			Highcharts: Chart,
			GasPrice,
		},

		data: () => ({
			pools: [],
			mypools: [],

			piechartdata: {
				chart: {
			        plotBackgroundColor: null,
			        plotBorderWidth: null,
			        plotShadow: false,
			        type: 'pie'
			    },
			    title: {
			        text: 'Gauge allocation'
			    },
			    tooltip: {
			        pointFormat: '{series.name}: <b>{point.percentage:.3f}%</b>'
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
			                // formatter: (function(self) {
			                // 	return function(point) { 
			                // 		return `<b>${this.key}</b>: 
			                // 		${helpers.formatNumber(self.allPools[this.key], 0)}$
			                // 		(${this.percentage.toFixed(2)}%)`
			                // 	}
			                // })(this),
			            }
			        }
			    },
			    series: [],
			},

			piegaugechartdata: {
				chart: {
			        plotBackgroundColor: null,
			        plotBorderWidth: null,
			        plotShadow: false,
			        type: 'pie'
			    },
			    title: {
			        text: 'Gauge relative weight'
			    },
			    tooltip: {
			        pointFormat: '{series.name}: <b>{point.percentage:.3f}%</b>'
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
			                // formatter: (function(self) {
			                // 	return function(point) { 
			                // 		return `<b>${this.key}</b>: 
			                // 		${helpers.formatNumber(self.allPools[this.key], 0)}$
			                // 		(${this.percentage.toFixed(2)}%)`
			                // 	}
			                // })(this),
			            }
			        }
			    },
			    series: [],
			},

			piechart: null,

			piegaugechart: null,

			showChart: true,

			loading: true,

			claimFromGauges: [],
		}),

		async created() {
			this.$watch(() => contract.default_account && contract.multicall, (val, oldval) => {
				//if(val != null && oldval != null)
					this.mounted()
			})
		},

		async mounted() {
			if(contract.default_account && contract.multicall)
				this.mounted()
		},

		computed: {
			totalClaimableCRV() {
				return gaugeStore.state.totalClaimableCRV
			},
			totalClaimableCRVFormat() {
				return (this.totalClaimableCRV / 1e18).toFixed(2)
			},

			totalMintedCRV() {
				return gaugeStore.state.totalMintedCRV
			},
			totalMintedCRVFormat() {
				return (this.totalMintedCRV / 1e18).toFixed(2)
			},

			totalBalance() {
				return gaugeStore.state.totalBalance
			},
			totalGaugeBalance() {
				return gaugeStore.state.totalGaugeBalance
			},
			gasPrice() {
                return gasPriceStore.state.gasPrice
            },
            gasPriceWei() {
                return gasPriceStore.state.gasPriceWei
            },
            showApplyBoostAll() {
            	return gaugeStore.state.gaugesNeedApply.length > 0
            },
            gaugesNeedApplyNames() {
            	return gaugeStore.state.gaugesNeedApply.map(gauge => gaugeStore.state.mypools.find(v => v.gauge == gauge).name)
            },
            myGauges() {
            	return gaugeStore.state.mypools.filter(pool => +pool.claimable_tokens > 0)
            },
		},

		methods: {
			async mounted() {
				gaugeStore.state.totalClaimableCRV = null
				gaugeStore.state.totalMintedCRV = null
				this.piechart = this.$refs.piecharts.chart
				this.piegaugechart = this.$refs.piegaugecharts.chart

				this.piechart.showLoading()

				this.piegaugechart.showLoading()

				await gaugeStore.getState()
				this.loading = false

				this.pools = gaugeStore.state.pools
				this.mypools = gaugeStore.state.mypools

				this.claimFromGauges = this.myGauges

				let btcPrice = await getBTCPrice()

				let total = this.mypools.reduce((a,b,i) => {
					let balance = +b.gaugeBalance
					if(['ren','sbtc'].includes(this.mypools[i].name))
						balance *= btcPrice
					return +a + balance
				}, 0)

				if(total == 0) {
					this.showChart = false
					return;
				}

				let piedata = this.mypools.map(pool => {
					let balance = pool.gaugeBalance
					if(['ren','sbtc'].includes(pool.name))
						balance = pool.gaugeBalance * btcPrice
					return { 
						name: pool.name,
				 		y: total == 0 ? 0 : balance / total
				 	}
				})
				piedata = piedata.filter(pool => pool.y > 0)

				this.piechart.addSeries({
					name: 'Gauge Allocation',
					data: piedata,
				})


				this.piechart.hideLoading()

				let gaugeSum = Object.values(gaugeStore.state.pools).reduce((a,b) => +a + +b.gauge_relative_weight, 0)
				let piegauges = Object.values(gaugeStore.state.pools).map(v => ({ name: v.name, y: v.gauge_relative_weight / gaugeSum}))

				let highest = piegauges.map(data=>data.y).indexOf(Math.max(...piegauges.map(data => data.y)))
				piegauges[highest].sliced = true;
				piegauges[highest].selected = true;

				this.piegaugechart.addSeries({
					name: 'Gauge relative weights',
					data: piegauges,
				})


				this.piegaugechart.hideLoading()

			},

			async claim() {
				console.log(gaugeStore.state.mypools, "MY POOLS")
				let gauges = this.claimFromGauges.map(gauge => gauge.gauge)
				let fillarray = new Array(8-gauges.length).fill('0x0000000000000000000000000000000000000000')
				gauges.push(...fillarray)
				console.log(gauges, "ALL GAUGES")
				let mintMethod = gaugeStore.state.minter.methods.mint_many(gauges)
				if(gauges.filter(address => +address > 0).length == 1)
					mintMethod = gaugeStore.state.minter.methods.mint(gauges.find(address => +address > 0))
				let gas = await mintMethod.estimateGas()

				var { dismiss } = notifyNotification(`Please confirm claiming CRV from all gauges you've deposited to`)

				await mintMethod.send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: gas * 1.5 | 0,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
				})
			},

			async applyBoostAll() {
				gaugeStore.applyBoostAll()
			},
		},
	}
</script>

<style scoped>
	.totalClaimableCRV {
		margin-top: 1em;
	}
	.info-message.gentle-message {
		margin-top: 0;
	}
	.applyBoostAll {
		margin-top: 1em;
	}
	.claimGaugeSelect {
		display: inline;
	}
	.claimGaugeSelect:nth-of-type(1) label {
		margin-left: 0;
	}
	.claimGaugeSelect label {
		margin-left: 0.4em;
	}
	.claimAllWarning.claimAllWarning {
		margin-top: 1em;
	}
	input[type='checkbox'] + label {
		cursor: pointer;
	}
</style>