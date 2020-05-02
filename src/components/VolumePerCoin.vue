<template>
	<div>
		<div class='window white'>
			<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
		</div>
		<div class='window white'>
			<highcharts :options="piechartdata" ref='piecharts'></highcharts>
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
			piechartdata: {
				chart: {
			        plotBackgroundColor: null,
			        plotBorderWidth: null,
			        plotShadow: false,
			        type: 'pie'
			    },
			    title: {
			        text: 'Share of volume per coin for last week'
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
			                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
			            }
			        }
			    },
			    series: [],
			    legend: {
			    	enabled: true,
			    }
			},
			currencies: ['DAI', 'USDC', 'USDT', 'TUSD', 'BUSD', 'sUSD'],
			volumes: [],
			chart: null,
			piechart: null,
		}),
		async created() {
			let pools = Object.keys(allabis).filter(pool => pool != 'susd' && pool != 'y')
			await volumeStore.fetchVolumeData(pools, false, 1440)
			let data = volumeStore.state.volumeData[1440]
			data.busd = (new Array(data.compound.length-data.busd.length).fill({})).concat(data.busd)
			data.susd = (new Array(data.compound.length-data.susd.length).fill({})).concat(data.susd)
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

			this.piechart = this.$refs.piecharts.chart;
			this.piechart.showLoading()
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

				let day = 24 * 60 * 60 * 1000
				let week = 7 * day
				let month = 30.42 * day
				let all = Date.now()
				let interval = 1000 * 60 * 60 * 24;
				let startDayUTC = Math.floor(Date.now() / interval) * interval
				let filtered = this.volumes.map(vol=> {
					return vol.filter(data=>{
						return data[0] > startDayUTC - week
					})
					.map(data => data[1])
					.reduce((a, b) => {
						return (+a) + (+b)
					}, 0)
				})
				let piechartdata = []
				filtered
					.forEach((vol, i, arr) => {
						piechartdata.push({
							name: this.currencies[i],
							y: (vol / arr.reduce((a, b) => a + b, 0)) * 100
						})
					})
				let highest = piechartdata.map(data=>data.y).indexOf(Math.max(...piechartdata.map(data => data.y)))
				piechartdata[highest].sliced = true;
				piechartdata[highest].selected = true;
				this.piechart.addSeries({
					name: 'Volume %',
					data: piechartdata,
				})
				this.piechart.hideLoading()
			}
		}
	}
</script>