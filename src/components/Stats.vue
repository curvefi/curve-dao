<template>
	<div>
		<div :class="{'window white': !pool}">
	        <fieldset>
	            <legend>Average liquidity provider profit [
		            	<span id="apr-profit" :class="{'loading line': loading}">
		            		<span v-show='!loading'> {{apr*100 | toFixed2}}%</span>
	            	</span> APY ]
	        	</legend>
	            <div class='loading matrix' v-show='loading'></div>
				<highcharts :constructor-type="'stockChart'" :options="chartdata" v-if='!loading'></highcharts>
	        </fieldset>
	        <p>Recent daily APY: <span id="daily-apr" :class="{'loading line': loading}">
	        	<span v-show='!loading'> {{daily_apr*100 | toFixed2}}% </span>
	    	</span></p>
	        <p>Recent weekly APY: <span id="weekly-apr" :class="{'loading line': loading}">
	        	<span v-show='!loading'> {{weekly_apr*100 | toFixed2}}% </span>
	    	</span></p>
	    	<daily-chart :data='data' v-if='!pool'/>
	    </div>
	</div>
</template>

<script>
    import * as helpers from '../utils/helpers'
    import { getters, contract as currentContract } from '../contract'
    import Highcharts from 'highcharts'
	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'
	import DailyChart from './common/DailyAPYChart.vue'

	stockInit(Highcharts)


	export default {
		components: {
			highcharts: Chart,
			DailyChart,
		},
		watch: {
			currentPool(val) {
				this.mounted();
			}
		},
		props: ['pool'],
		data: () => ({
			data: [],
			apr: '',
			daily_apr: '',
			weekly_apr: '',
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
	            	title: {
	            		text: 'Profit [%]',
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
		        	name: 'Virtual growth of liquidity share',
		        	lineWidth: 2,
		        	data: [],
		        	color: '#0b0a57'
		        }],
		        tooltip: {
	                valueDecimals: 5,
	                pointFormatter() {
                		let value = Math.floor(this.y * 100000) / 100000 + '%';
	                	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
	                }
	            },
			},
			chartdataDaily: null,
			loading: true,
			loadingDaily: true,
		}),
        computed: {
          ...getters,
        },
        created() {
/*            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            })*/
            this.$watch(()=>currentContract.currentContract, val => {
            	if(currentContract.initializedContracts) this.mounted();
            })
        },
        mounted() {
            this.mounted();
        },

		methods: {
			async mounted() {
				this.loading = true;
				this.loadingDaily = true;
				let subdomain = this.pool || this.currentPool
				if(subdomain == 'iearn') subdomain = 'y'
				if(subdomain == 'susd') subdomain = 'synthetix'
				let res = await fetch(`https://${subdomain}.curve.fi/stats.json`);
				let json = await res.json()

				this.apr = json.apr;
				this.daily_apr = json.daily_apr;
				this.weekly_apr = json.weekly_apr;
		        var data = json.data
		        this.data = data;
		        var step_size = Math.max(Math.round(data.length / 500), 1);
		        var start_profit = data[0][1]
		        var chartData = [];
		        for (let i = 0; i < data.length; i++) {
		            if ((i % step_size == 0) | (i == data.length - 1)) {
		                var el = data[i];
		                chartData.push([
		                    el[0] * 1000,
		                    (el[1] / start_profit - 1) * 100
		                ]);
		            }
		        }
		        this.chartdata.series[0].data = chartData;
		        this.loading = false;
			},
		}
	}
</script>

<style>
	.loading.matrix {
		display: flex;
		justify-content: center;
	}
</style>