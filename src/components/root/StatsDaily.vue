<template>
	<div>
 		<div class='window white'>
 			<fieldset>
 				<legend>Daily APY % and trading volume <span class='tooltip'>[?]<span class='tooltiptext long'>Daily Pool APY + Lending APY (annualized)</span></span></legend>
 				<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
 			</fieldset>
 		</div>

 		<div class='window white'>
 			<fieldset>
 				<legend>Total trading volume</legend>
 				<highcharts :constructor-type="'stockChart'" :options="volumeChartdata" ref='highcharts2'></highcharts>
 			</fieldset>
 		</div>

		<div class='window white' v-for='(currency, i) in Object.keys(pools)'>
			<p class='text-center'>
		      	<router-link :to="currency == 'susd' ? 'susdv2' : currency" v-show="currency != 'susd'">
		      		curve.fi/{{currency == 'iearn' ? 'y' : currency == 'susd' ? 'susdv2' : currency}}
		      	</router-link>
		      	<a href='https://iearn.finance/pool' v-show="currency == 'susd'">susd</a>
	      	</p>
			<daily-chart 
				:data = 'poolData[i]' 
				:pool="currency == 'iearn' ? 'y' : currency" 
				:volume = "volumesData[currency == 'iearn' ? 'y' : currency == 'susdv2' ? 'susd' : currency]" />
		</div>
	</div>
</template>

<script>
	import DailyChart from '../common/DailyAPYChart.vue'
	import TotalBalances from './TotalBalances.vue'
    import { allCurrencies } from '../../contract'
	import * as volumeStore from '@/components/common/volumeStore'

	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)

	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'

	import abis from '../../allabis'

	import * as helpers from '../../utils/helpers'

	stockInit(Highcharts)

	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})

	export default {
		components: {
			DailyChart,
			highcharts: Chart,
		},
		data: () => ({
			pools: {
				compound: 'compound',
				usdt: 'usdt',
				iearn: 'y',
				busd: 'busd',
				susdv2: 'susdv2',
				pax: 'pax',
				tbtc: 'tbtc',
				ren: 'ren',
				sbtc: 'sbtc',
			},
			chartdata: {
				title: {
					text: ''
				},
				chart: {
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl',
			        height: 800,
				},
				yAxis: [
					{
						opposite: false,
						title: {
							text: 'Daily APY %',
						},
						type: 'logarithmic',
		            	height: '60%',
					},
					{
		            	id: 'volumeAxis',
		            	//type: 'logarithmic',
		            	opposite: false,
		            	title: {
		            		text: 'Trading volume',
		            		style: {
		            			color: 'black'
		            		},
		            		margin: 10,
		            	},
		            	labels: {
		            		style: {
		            			color: 'black',
		            		},
		            		align: 'right',
		            		x: -30,
		            	},
		            	top: '65%',
		            	height: '35%',
			            offset: 0,
		            }
	            ],
				tooltip: {
	                valueDecimals: 3,
	                pointFormatter() {
                		let value = Math.floor(this.y * 100) / 100 + '%';
                		if(this.series.name == 'Trading Volume') return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(0)}</b><br/>`
	                	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
	                }
	            },
	            legend: {
	            	enabled: true,
	            },
				series: [],
			},
			volumeChartdata: {
				title: {
					text: 'Total Trading Volume'
				},
				chart: {
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl',
			        height: 600,
				},
				yAxis: [
					{
		            	id: 'volumeAxis',
		            	//type: 'logarithmic',
		            	opposite: false,
		            	title: {
		            		text: 'Trading volume',
		            		style: {
		            			color: 'black'
		            		},
		            		margin: 10,
		            	},
		            	labels: {
		            		style: {
		            			color: 'black',
		            		},
		            		align: 'right',
		            		x: -30,
		            	},
			            offset: 0,
		            }
	            ],
				tooltip: {
	                valueDecimals: 3,
	                pointFormatter() {
                		let value = Math.floor(this.y * 100) / 100 + '%';
                		if(this.series.name == 'Trading Volume') return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(0)}</b><br/>`
	                	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
	                }
	            },
	            legend: {
	            	enabled: true,
	            },
				series: [],
			},
			poolData: [],
			start: 0,
			end: 0,
			chart: null,
			volumeChart: null,
		}),
		computed: {
			volumesData() {
				return volumeStore.state.volumes;
			}
		},
		async mounted() {
			this.$watch(()=>volumeStore.state.allVolume.ren.length, val => {
				if(val) {
					let volumeSeries = []
					let allPools = ['compound', 'usdt', 'y', 'busd', 'susd', 'pax', 'tbtc', 'ren']
					let data = volumeStore.state.allVolume
					let maxlenpool = Object.keys(data).reduce((a, b) => data[a].length > data[b].length ? a : b)
					data = Object.keys(data).reduce((obj, key) => {
						return {...obj, [key]: (new Array(Math.max(...Object.values(data).map(arr=>arr.length))-data[key].length).fill({})).concat(data[key])}
					}, {})
					data.susdv2 = data.susd
					for(let i = 0; i < data[maxlenpool].length; i++) {
						volumeSeries.push([
							data[maxlenpool][i][0],
							allPools.map(p=>{
								p = p == 'susd' ? 'susdv2' : p
								return data[p] && data[p][i] && data[p][i][1] || 0
							}).reduce((a ,b) => (+a) + (+b), 0)
						])
					}

					this.chart.addSeries({
			        	type: 'column',
						name: 'Trading Volume',
						data: volumeSeries,
						color: '#0b0a57',
						yAxis: 1,
					})

					this.volumeChart.addSeries({
						type: 'line',
						name: 'Trading Volume',
						data: volumeSeries,
						color: '#0b0a57',
					})

					this.volumeChart.hideLoading()

					this.chart.hideLoading()
				}

			})
			this.chart = this.$refs.highcharts.chart
			this.volumeChart = this.$refs.highcharts2.chart
			this.volumeChart.showLoading()
			this.chart.showLoading()
			var start = new Date();
			start.setHours(0,0,0,0);
			this.start = start.getTime() / 1000

			var end = new Date();
			end.setHours(23,59,59,999);
			this.end = end.getTime() / 1000

			let requests = Object.values(this.pools)
							.map(p => p == 'susdv2' ? 'susd' : p == 'ren' ? 'ren2' : p == 'sbtc' ? 'rens' : p)
							.map(p => fetch(`${window.domain}/raw-stats/${p}-1440m.json`))
			let data = await Promise.all(requests)
			for(let [key, res] of data.entries()) {
				let json = await res.json();
				let chartData = [];
		        for(let i = 1; i < json.length; i++) {
		        	var el = json[i];
		        	let daylen = el.timestamp - json[i-1].timestamp
		        	let profit = ((el.virtual_price / 1e18) / (json[i-1].virtual_price / 1e18)) ** (365 * 86400 / daylen) - 1
		        	chartData.push([
		        		el.timestamp * 1000,
		        		profit * 100,
		        	])
		        }

		        this.chart.addSeries({
		        	name: key == 2 ? 'y' : Object.keys(this.pools)[key],
		        	data: chartData,
		        })

				this.poolData.push(json);
			}

/*			let pools = Object.values(this.pools).slice(0, 4)
	        requests = pools.map(p => fetch(`https://beta.curve.fi/raw-stats/${p}-30m.json`))
			requests = await Promise.all(requests)
			let jsons = await Promise.all(requests.map(r => r.json()))
			console.log(jsons)*/

            volumeStore.getVolumes(Object.values(this.pools));
		},
	}
</script>