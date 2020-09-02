<template>
	<div>
		<fieldset :class="{'ismodal': ismodal}">
			<legend v-show='!ismodal'>Proposed Gauge Weight changes</legend>
			<highcharts :options="piechartdata" ref='piecharts'></highcharts>
		</fieldset>
	</div>
</template>

<script>
	import Vue from 'vue'

	import { contract, getters } from '../../../contract'
	import { notify, notifyHandler, notifyNotification } from '../../../init'

	import daoabis from '../../dao/allabis'

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

	import * as helpers from '../../../utils/helpers'

	export default {
		components: {
			Highcharts: Chart,
		},

		props: {
			included: {
				type: Boolean,
				default: false,
			},
			future_weights: Array,
			ismodal: {
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
		}),

		watch: {
			future_weights(val) {
				console.log("FUTURE WEIGHTS")
				if(val.length)
					this.mounted()
			}
		},

		computed: {
			publicPath() {
                return process.env.BASE_URL
            },
            nextTime() {
            	return 1599091200
            },
		},

		mounted() {
			console.log("I AM MOUNTED")
			this.piechart = this.$refs.piecharts.chart
			this.piechart.showLoading()
			if(this.future_weights.length)
				this.mounted()
		},

		methods: {
			async mounted() {

				while(this.piechart.series[0])
					this.piechart.series[0].remove()

				let name = 'Proposed gauge weights'
				if(this.ismodal)
					name = 'Historic gauge weights'

				this.piechart.addSeries({
					name: name,
					data: this.future_weights,
				})

				if(!this.ismodal) {
					this.piechart.update({
						title: {
							text: `Proposed future gauge weight changes <br> taking effect on ${this.formatDate(this.nextTime).split(' ')[0]} UTC`,
						},
					})
				}
				else {
					this.piechart.update({
						title: {
							text: `Historic gauge weights`,
						},
					})
				}

				this.piechart.hideLoading()
				
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

	fieldset.ismodal {
		border: none;
	}
</style>