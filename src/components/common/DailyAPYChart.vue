<template>
	<fieldset>
		<legend>Daily APY %</legend>
		<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
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

	stockInit(Highcharts)

	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})

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
			        panKey: 'ctrl',
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
		            	},
		            	padding: 30,
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
		        this.chart.addSeries({
		        	name: 'Daily APY',
		        	lineWidth: 2,
		        	data: chartData,
		        	color: '#0b0a57'
		        }, true)
		        this.chart.redraw();
		        this.chart.hideLoading();
		        this.loading = false;
			},
		}
	}
</script>