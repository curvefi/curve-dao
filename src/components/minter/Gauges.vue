<template>
	<div>
		<div class='window white' v-if='showChart'>
			<highcharts :options="piechartdata" ref='piecharts'></highcharts>
		</div>
		<div class='window white'>
			<voting-escrow :showchart='false'></voting-escrow>
		</div>
		<div class='window white'>
			All claimable CRV from gauges: {{ totalClaimableCRVFormat }}

			<button @click='claim'>Claim all</button>
		</div>
		<gauge v-for='(pool, i) in mypools' :key = 'i' :i = 'i'></gauge>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
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

	export default {
		components: {
			Gauge,
			VotingEscrow,
			Highcharts: Chart,
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
		},

		methods: {
			async mounted() {
				console.log(this.$refs, "THE REFS")
				this.piechart = this.$refs.piecharts.chart
				this.piechart.showLoading()

				await gaugeStore.getState()
				this.pools = gaugeStore.state.pools
				this.mypools = gaugeStore.state.mypools

				let total = this.mypools.reduce((a,b) => +a + +b.gaugeBalance, 0)

				if(total == 0) {
					this.showChart = false
					return;
				}

				let piedata = this.mypools.map(pool => ({ name: pool.name, y: total == 0 ? 0 : pool.gaugeBalance / total}))

				this.piechart.addSeries({
					name: 'Gauge Allocation',
					data: piedata,
				})


				this.piechart.hideLoading()

			},

			async claim() {
				let gauges = gaugeStore.state.mypools.map(gauge => gauge.gauge)
				let fillarray = new Array(8-gauges.length).fill('0x0000000000000000000000000000000000000000')
				gauges.push(...fillarray)
				await gaugeStore.state.minter.methods.mint_many(gauges).send({
					from: contract.default_account,
				})
			},
		},
	}
</script>

<style scoped>
	
</style>