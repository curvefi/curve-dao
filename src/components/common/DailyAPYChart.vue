<template>
	<fieldset>
		<legend>Daily APY %</legend>
		<div class='loading matrix' v-show='loading'></div>
		<highcharts :constructor-type="'stockChart'" :options="chartdata" v-if='!loading'></highcharts>
	</fieldset>
</template>

<script>
	import Highcharts from 'highcharts'
	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'

	stockInit(Highcharts)

	export default {
		props: ['data'],
		components: {
			highcharts: Chart,
		},
		data: () => ({
			chartdata: {
				chart: {
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl'
				},
                rangeSelector: {
		            selected: 1
		        },
	            yAxis: {
	            	opposite: false,
	            	type: 'logarithmic',
        			title: {
        				text: 'Daily APY [%]',
        				style: {
        					color: 'black'
        				}
        			},
	            	labels: {
	            		formatter() {
	            			return (Math.floor(this.value * 100) / 100).toFixed(2);
	            		},
		            	style: {
		            		color: 'black'
		            	}
	            	},
	            	tickPixelInterval: 10,
	            },
	            xAxis: {
	            	labels: {	
		            	style: {
		            		color: 'black'
		            	}
	            	}
	            },
		        series: [{
		        	name: 'Daily APY',
		        	lineWidth: 2,
		        	data: [],
		        	color: '#0b0a57'
		        }],
		        tooltip: {
	                valueDecimals: 3,
	                pointFormatter() {
                		let value = Math.floor(this.y * 100) / 100 + '%';
	                	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
	                }
	            },
			},
			loading: true,
		}),
		watch: {
			'data.length'(val) {
				this.mounted()
			}
		},
		methods: {
			async mounted() {
				this.loading = true;
		        let chartData = [];
		        for(let i = 1440; i < this.data.length; i+=300) {
		        	var el = this.data[i];
		        	console.log(el[1],this.data[i-288][1])
		        	let profit = (el[1] / this.data[i-1440][1]) ** 365 - 1
		        	chartData.push([
		        		el[0] * 1000,
		        		profit * 100,
		        	])
		        }

		        this.chartdata.series[0].data = chartData;
		        this.loading = false;
			},
		}
	}
</script>