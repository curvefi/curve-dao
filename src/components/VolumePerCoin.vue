<template>
	<div>
		<div class='window white'>
			<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
		</div>
		<div v-for='(currency, n) in currencies'>
			<volume-per-coin-stats :data = 'volumes[n]' :currency = 'currency'></volume-per-coin-stats>
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

	import * as volumeStore from './common/volumeStore'
	import allabis from '../allabis'

	import VolumePerCoinStats from './VolumePerCoinStats.vue'

	import * as Comlink from 'comlink'

	import Worker from 'worker-loader!./graphs/worker.js';
	const worker = new Worker();
	const volumeWorker = Comlink.wrap(worker);

	export default {
		components: {
			highcharts: Chart,
			VolumePerCoinStats,
		},
		data: () => ({
			chartdata: {
				chart: {
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl',
			        type: 'column',
				},
                rangeSelector: {
		            selected: 1
		        },
		        plotOptions: {
					series: {
						dataGrouping: {
						  forced: true,
						  units: [
						    ['day', [1]]
						  ]
						}
					},
					column: {
						stacking: 'normal',
						dataLabels: {
							enabled: false
						}
					},
				},
		        exporting: {
					buttons: {
						contextButton: {
							menuItems: ["printChart",
					                    "separator",
					                    "downloadPNG",
					                    "downloadJPEG",
					                    "downloadPDF",
					                    "downloadSVG",
					                    "separator",
					                    "downloadCSV",
					                    "downloadXLS",
					                    //"viewData",
					                    "openInCloud"]
						}
					}
				},
	            yAxis: {
	            	opposite: false,
	            	title: {
	            		text: 'Total volume per day per coin',
	            		style: {
	            			color: 'black'
	            		},
	            	},
            		stackLabels: {
			            enabled: false,
			            style: {
			                fontWeight: 'bold',
			                color: ( // theme
			                    Highcharts.defaultOptions.title.style &&
			                    Highcharts.defaultOptions.title.style.color
			                ) || 'gray'
			            }
			        },
	            	tickPixelInterval: 10,
	            },
	            xAxis: {
	            	labels: {	
		            	style: {
		            		color: 'black'
		            	}
	            	},
	            },
		        series: [],
		        tooltip: {
	                valueDecimals: 5,
	                pointFormatter() {
                		let value = this.y.toFixed(2)
	                	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
	                }
	            },
	            legend: {
	            	enabled: true,
	            }
			},
			currencies: ['DAI', 'USDC', 'USDT', 'TUSD', 'BUSD', 'sUSD'],
			volumes: [],
			chart: null,
		}),
		async created() {
			let pools = Object.keys(allabis).filter(pool => pool != 'susd' && pool != 'y')
			await volumeStore.fetchVolumeData(pools, false, 30)
			let data = volumeStore.state.volumeData[30]
			data.susd = (new Array(1000-data.susd.length).fill({})).concat(data.susd)
			pools = Object.entries(data)

			this.volumes = await volumeWorker.getVolumePerCoin(data, pools, allabis)
		},
		watch: {
			volumes(val) {
				if(val.length)
					this.mounted()
			}
		},
		async mounted() {
			this.chart = this.$refs.highcharts.chart;
			this.chart.showLoading();
		},
		methods: {
			async mounted() {
				for(let [i,volume] of this.volumes.entries()) {
					this.chart.addSeries({
						name: this.currencies[i],
						data: volume,
					})
				}
				this.chart.hideLoading();
			}
		}
	}
</script>