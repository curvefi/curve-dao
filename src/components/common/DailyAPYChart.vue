<template>
	<fieldset>
		<legend>Daily APY %</legend>
		<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
    	<p v-show='volume != -1'>Daily volume: 
    		<span :class="{'loading line': !volume}">
    			<span v-show='volume'> {{(volume | 0) | formatNumber}}$</span>	
    		</span>
    	</p>
	</fieldset>
</template>

<script>
	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)

	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'

	import * as helpers from '../../utils/helpers'
	import abis from '@/allabis'


	stockInit(Highcharts)

	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})

	export default {
		props: {
			data: Array,
			volume: {
				type: Number,
				default: -1
			},
			pool: String,
		},
		components: {
			highcharts: Chart,
		},
		data: () => ({
			chartdata: {
				chart: {
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl',
			        height: 600,
				},
                rangeSelector: {
		            selected: 1
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
	            yAxis: [
		            {
		            	opposite: false,
		            	type: 'logarithmic',
	        			title: {
	        				text: 'Daily APY [%]',
	        				style: {
	        					color: 'black'
	        				},
	        				margin: 10,
	        			},
		            	labels: {
		            		align: 'right',
		            		x: -30,
		            		formatter() {
		            			return (Math.floor(this.value * 100) / 100).toFixed(2);
		            		},
			            	style: {
			            		color: 'black'
			            	},
		            	},
		            	tickPixelInterval: 10,
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
	            xAxis: {
	            	labels: {
		            	style: {
		            		color: 'black'
		            	}
	            	}
	            },
		        series: [/*{
		        	name: 'Daily APY',
		        	lineWidth: 2,
		        	data: [],
		        	color: '#0b0a57'
		        }*/],
		        tooltip: {
		        	split: true,
	                valueDecimals: 3,
	                pointFormatter() {
                		let value = Math.floor(this.y * 100) / 100 + '%';
	                	if(this.series.name == 'Daily APY') return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
	                	if(this.series.name === 'Volume') return `<span style="color:${this.color}">●</span> ${this.series.name} : <b>${this.y.toFixed(2)}</b><br/>`
	                }
	            },
			},
			chart: null,
		}),
		watch: {
			'data.length'(val) {
				this.mounted()
			}
		},
		mounted() {	
			this.chart = this.$refs.highcharts.chart;
	        this.chart.showLoading();
		},
		methods: {
			loaded() {
				this.loading = false;
			},
			async mounted() {
		        let chartData = [];
		        for(let i = 1440; i < this.data.length; i+=300) {
		        	var el = this.data[i];
		        	let profit = (el[1] / this.data[i-1440][1]) ** 365 - 1
		        	chartData.push([
		        		el[0] * 1000,
		        		profit * 100,
		        	])
		        }

		        if(this.pool == 'susd') {
		        	this.chart.get('volumeAxis').remove();
		        	this.chart.yAxis[0].update({
		            	type: 'linear',
		            	height: '100%',
		        	}, true)
		        }
		        this.chart.setSize(undefined, 600)
		        this.chart.addSeries({
		        	name: 'Daily APY',
		        	lineWidth: 2,
		        	data: chartData,
		        	color: '#0b0a57'
		        }, true)
		        if(this.pool != 'susd') {
			        let pool = this.pool == 'iearn' ? 'y' : this.pool
			        let pools = [pool]
			        let volumes = pools.map(p => fetch(`https://beta.curve.fi/raw-stats/${pool}-30m.json`))
					volumes = await Promise.all(volumes)
					let volumeSeries = []
					for(let i = 0; i < volumes.length; i++) {
				    	let json = await volumes[i].json();
						let pool = pools[i] == 'y' ? 'iearn' : pools[i]
				    	for(let j = 0; j <= json.length-48; j += 48) {
				    		volumeSeries.push([
				    			json[j+48].timestamp * 1000,
				    			json.slice(j, j+48).map(data => { 
				    				return Object.entries(data.volume).map(([k, v]) => {
						    			let precisions = abis[pool].coin_precisions[k.split('-')[0]]
						    			return v[0] / precisions
						    		}).reduce((a, b) => a + b, 0)
						    	}).reduce((a, b) => a + b, 0)
				    		])
				    	}
				    }

			        this.chart.addSeries({
			        	type: 'column',
			        	name: 'Volume',
			        	data: volumeSeries,
			        	color: '#0b0a57',
			        	yAxis: 1,
			        })
		    	}
		        this.chart.redraw();
		        this.chart.hideLoading();

		        this.loading = false;
			},
		}
	}
</script>