<template>
	<div>
		<div class='window white' v-if='showChart'>
			<highcharts :options="piechartdata" ref='piecharts'></highcharts>
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

				<button @click='claim'>Claim all</button>
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
			        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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

			showChart: true,

			loading: true,
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
		},

		methods: {
			async mounted() {
				gaugeStore.state.totalClaimableCRV = null
				this.piechart = this.$refs.piecharts.chart
				this.piechart.showLoading()

				await gaugeStore.getState()
				this.loading = false

				this.pools = gaugeStore.state.pools
				this.mypools = gaugeStore.state.mypools

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

			},

			async claim() {
				console.log(gaugeStore.state.mypools, "MY POOLS")
				let gauges = gaugeStore.state.mypools.filter(gauge=>+gauge.claimable_tokens > 0).map(gauge => gauge.gauge)
				let fillarray = new Array(8-gauges.length).fill('0x0000000000000000000000000000000000000000')
				gauges.push(...fillarray)
				console.log(gauges, "ALL GAUGES")
				let gas = await gaugeStore.state.minter.methods.mint_many(gauges).estimateGas()

				var { dismiss } = notifyNotification(`Please confirm claiming CRV from all gauges you've deposited to`)

				await gaugeStore.state.minter.methods.mint_many(gauges).send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: gas * 1.5 | 0,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
				})
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
</style>