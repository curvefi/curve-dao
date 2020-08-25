<template>
	<div>
		<div id='modal' class='modal' v-show='showChartModal' @click.self='hideModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideModal'>
						[<span class='greentext'>■</span>]
					</div>
					<div class='content'>
						<div>
							<highcharts :options="piechartdata" ref='piecharts'></highcharts>
						</div>
					</div>
					<button @click='hideModal'>Close</button>
				</fieldset>
			</div>
		</div>
	</div>
</template>

<script>
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

	export default {
		components: {
			Highcharts: Chart,
		},

		props: ['chartdata', 'name', 'showModal'],

		data() {
			return {
				piechartdata: {
					chart: {
				        plotBackgroundColor: null,
				        plotBorderWidth: null,
				        plotShadow: false,
				        type: 'pie'
				    },
				    title: {
				        text: 'veCRV distribution'
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
				                		return `<b>${self.shortenAddress(this.key)}</b>: 
				                		(${this.y.toFixed(2)}%)`
				                	}
				                })(this),
				            }
				        }
				    },
				    series: [],
				},

				piechart: null,

				showChartModal: false,
			}
		},

		watch: {
			showModal(val) {
				console.log(val, "SHOW MODAL ON CASTS VAL")
				this.showChartModal	= val
			},
			name(val) {
				this.showChartModal = true
				console.log(val, "THE VAL ON CASTS CHART")
				this.loadChart()
			},
		},

		mounted() {
		},

		created() {
			this.showChartModal = this.showModal
		},

		methods: {
			hideModal() {
				this.showChartModal = false
				this.$emit('hide')
			},
			loadChart() {
				console.log(this.piechart, "THE PIE CHART")
				this.piechart = this.$refs.piecharts.chart
				this.piechart.showLoading()

				while(this.piechart.series[0])
					this.piechart.series[0].remove()

				let totalVotes = this.chartdata.reduce((a, b) => +a + +b.voterStake, 0)

				this.piechart.addSeries({
					name: this.name,
					data: this.chartdata.map(v => ({ name: this.shortenAddress(v.voter), y: v.voterStake * 100 / totalVotes }))
				}, false, false)

				this.piechart.update({
					title: {
						text: this.name,
					},
				})

				this.piechart.hideLoading()
			},
			shortenAddress(address) {
				if(!address) return ''
				return address.slice(0,6) + '...' + address.slice(-6)
			},
		},
	}
</script>

<style scoped>
	#modal {
		z-index: 3;
	}
	.modal-content {
		text-align: center;
		padding: 0;
		border: none;
		width: 800px;
	}
	.modal-content fieldset {
		color: white;
		font-weight: bolder;
		border: 6px double white;
		padding-block-start: 1em;
		padding-block-end: 1em;
	}
	.modal-content legend {
		color: black;
	}
	.modal-content button {
		margin-top: 0.6em;
		padding: 0 2em;
	}
	.legend2 {
	  position: absolute;
	  top: 0;
	  left: 2em;
	  background: #c0c0c0;
	  line-height:1.2em;
	}
	.greentext {
		color: green;
	}
	.legend2 .greentext {
		display: inline-block;
		transform: translate3d(0,-0.1em,10em);
	}
	.legend2 .greentext:hover {
		transform: none;
	}
	.hoverpointer {
		cursor: pointer;
	}
	.content {
		color: black;
		text-align: left;
	}
</style>