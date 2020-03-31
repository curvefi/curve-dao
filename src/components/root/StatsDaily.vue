<template>
	<div>
 		<div class='window white'>
 			<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
 		</div>

		<div class='window white' v-for='(currency, i) in Object.keys(pools)'>
			<p class='text-center'>
		      	<router-link :to="currency" v-show="currency != 'susd'">{{currency == 'iearn' ? 'y' : currency}}.curve.fi</router-link>
		      	<a href='https://iearn.finance/pool' v-show="currency == 'susd'">susd</a>
	      	</p>
			<daily-chart :data = 'poolData[i]' :pool='currency' :volume = 'volumesData[currency]' />
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
				susd: 'synthetix',
			},
			chartdata: {
				title: 'Daily APY % on all pools',
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
		            		text: 'Volume',
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
                		if(this.series.name == 'Volume') return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toFixed(0)}</b><br/>`
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
		}),
		computed: {
			volumesData() {
				return volumeStore.state.volumes;
			}
		},
		async mounted() {
			this.chart = this.$refs.highcharts.chart
			var start = new Date();
			start.setHours(0,0,0,0);
			this.start = start.getTime() / 1000

			var end = new Date();
			end.setHours(23,59,59,999);
			this.end = end.getTime() / 1000

			let requests = Object.values(this.pools).map(p => fetch(`https://${p}.curve.fi/stats.json`))
			let data = await Promise.all(requests)
			for(let [key, res] of data.entries()) {
				let json = await res.json();

				let chartData = [];
		        for(let i = 1440; i < json.data.length; i+=300) {
		        	var el = json.data[i];
		        	let profit = (el[1] / json.data[i-1440][1]) ** 365 - 1
		        	chartData.push([
		        		el[0] * 1000,
		        		profit * 100,
		        	])
		        }

		        this.chart.addSeries({
		        	name: key == 2 ? 'y' : Object.keys(this.pools)[key],
		        	data: chartData,
		        })

				this.poolData.push(json.data);
			}

			let pools = Object.values(this.pools).slice(0, 3)
	        requests = pools.map(p => fetch(`https://beta.curve.fi/raw-stats/${p}-30m.json`))
			requests = await Promise.all(requests)
			let jsons = await Promise.all(requests.map(r => r.json()))
			let volumeSeries = []
			for(let [key, data] of jsons[1].entries()) {
				let allVolumeData = jsons.map(json => json[key].volume)
				let volume = allVolumeData.map((volData, i) => {
					let pool = pools[i] == 'y' ? 'iearn' : pools[i]
					return Object.entries(volData).map(([k, v]) => {
		    			let precisions = abis[pool].coin_precisions[k.split('-')[0]]
		    			return v[0] / precisions
		    		}).reduce((a, b) => a + b, 0)
				}).reduce((a, b) => a + b, 0)
				volumeSeries.push([
					data.timestamp * 1000,
					volume,
				])
			}

			this.chart.addSeries({
	        	type: 'column',
				name: 'Volume',
				data: volumeSeries,
				color: '#0b0a57',
				yAxis: 1,
			})

			console.log(volumeSeries, "VOLUME SERIES")

            volumeStore.getVolumes(Object.values(this.pools));
		},
	}
</script>