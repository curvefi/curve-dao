<template>
	<div class='window white'>
		<div class='chartoptions'>
			<input id='showbars' type='checkbox' v-model='showbars'>
			<label for='showbars'>Show bars</label>

			<input id='showline' type='checkbox' v-model='showline'>
			<label for='showline'>Show line</label>
		</div>
		<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
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
	import * as helpers from '../utils/helpers'

	export default {
		components: {
			highcharts: Chart,
		},
		data: () => ({
			chartdata: {
				chart: {
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl',
			        type: 'column',
			        height: 600,
				},
		        title: {
		        	text: 'Total USD Deposits', 
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
	            		text: 'Total deposits',
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
	                	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(2)}</b><br/>`
	                },
	            },
	            legend: {
	            	enabled: true,
	            },
			},
			showbars: true,
			showline: true,
		}),

		watch: {
			showbars(val) {
				if(val == false && !this.showline) return;
				let toggle = 'show'
				if(!val) {
					toggle = 'hide'
				}
				for(let i = 0; i < this.chart.series.length - 2; i++) {
					this.chart.series[i][toggle]()
				}
			},
			showline(val) {
				if(val == false && !this.showbars) return
				let toggle = 'show'
				if(!val) toggle = 'hide'
				this.chart.series[this.chart.series.length - 2][toggle]()
			}
		},

		async mounted() {
			this.chart = this.$refs.highcharts.chart;
			this.chart.showLoading()
			let pools = Object.keys(allabis).filter(pool => pool != 'susd' && pool != 'y' && pool != 'tbtc')
			await volumeStore.fetchVolumeData(pools, false, 1440)
			let data = volumeStore.state.volumeData[1440]
			let btcPrices = await helpers.retry(fetch(`https://api.coinpaprika.com/v1/tickers/btc-bitcoin/historical?start=1589587198&interval=1d&limit=5000`))
			btcPrices = await btcPrices.json()
			for(let btcPool of ['ren', 'sbtc']) {
				data[btcPool] = data[btcPool].map(d => {
					d.balances = d.balances.map(bal => bal * volumeStore.findClosestPrice(d.timestamp, btcPrices))
					return d;
				})
			}
			data = Object.keys(data).reduce((obj, key) => {
				return {...obj, [key]: (new Array(Math.max(...Object.values(data).map(arr=>arr.length))-data[key].length).fill({})).concat(data[key])}
			}, {})

			let volumes = {}

			for(let [pool, points] of Object.entries(data)) {
				volumes[pool] = []
				for(let point of points) {
				if(!point.timestamp) continue
					volumes[pool].push([
						point.timestamp * 1000,
						point.balances.map((bal, i) => {
							return bal * point.rates[i] / 1e18 / allabis[pool == 'susd' ? 'susdv2' : pool].coin_precisions[i]
						}).reduce((a, b) => a + b, 0)
					])
				}
			}


			for(let [pool, volume] of Object.entries(volumes)) {
				if(pool == 'tbtc') continue
				this.chart.addSeries({
					type: 'column',
					name: pool,
					data: volume,
				}, false, false)
			}

			this.chart.hideLoading()
			this.chart.redraw()

			let balances = Object.keys(volumes).reduce((obj, key) => {
				return {...obj, [key]: (new Array(Math.max(...Object.values(volumes).map(arr=>arr.length))-volumes[key].length).fill({})).concat(volumes[key])}
			}, {})


			let line = []

			for(let [i, balance] of balances.compound.entries()) {
				let v = Object.values(balances).map(v => v[i]).filter(v=>v[0])
				line.push([v[0][0], v.map(v=>v[1]).reduce((a, b) => a + b, 0)])
			}

			this.chart.addSeries({
				type: 'line',
				name: `Total USD Deposits`,
				data: line,
			})

			this.chart.update({
				title: {
					text: `Total USD Deposits ${helpers.formatNumber(line[line.length-1][1], 0)}$`
				},
			})
		
		}
	}
</script>

<style scoped>
	.chartoptions label:nth-of-type(2) {
		margin-left: 1em;
	}
	.chartoptions {
		margin-bottom: 1em;
	}
</style>