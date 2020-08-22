<template>
	<div>
		<div class='window white'>
			<highcharts class='chart' :constructor-type="'stockChart'" :options='CRVAPYchartdata' ref='CRVAPYcharts'></highcharts>
		</div>

		<div class='window white'>
			<highcharts class='chart' :constructor-type="'stockChart'" :options="wschartdata" ref='wscharts'></highcharts>
		</div>

		<div class='window white'>
			<highcharts class='chart' :constructor-type="'stockChart'" :options="gwchartdata" ref='gwcharts'></highcharts>
		</div>
	</div>
</template>

<script>
	import { contract, getters } from '../../../contract'
	import allabis from '../../../allabis'
	import daoabis from '../../dao/allabis'

	import gql from 'graphql-tag'
	import { GraphQLWrapper } from '@aragon/connect-thegraph'

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

	import * as helpers from '../../../utils/helpers'

	import BN from 'bignumber.js'


	export default {
		components: {
			Highcharts: Chart,
		},

		props: ['address'],

		data: () => ({
			vesting: null,
			vestedOf: null,
			balanceOf: null,
			lockedOf: null,
			initial_locked: null,
			start_time: null,
			end_time: null,

				wschartdata: {
					chart: {
						panning: true,
						zoomType: 'x',
				        panKey: 'ctrl',
				        type: 'line',
				        height: 600,
				    },
				    title: {
				        text: 'Working supplies'
				    },
				    rangeSelector: {
				    	selected: 6,
				    },
				    xAxis: {
				    	//ordinal: false,
				    	//type: 'datetime',
		            	labels: {

			            	style: {
			            		color: 'black'
			            	}
		            	},
                  //tickInterval: 100,
		            	dateTimeLabelFormats: {
				            // second: '%Y-%m-%d<br/>%H:%M:%S',
				            // minute: '%Y-%m-%d<br/>%H:%M',
				            // hour: '%Y-%m-%d<br/>%H:%M',
				            // day: '%Y<br/>%m-%d',
				            // week: '%Y<br/>%m-%d',
				            // month: '%Y-%m',
				            year: '%Y'
				        },
				  //       units: [[
						//     'year',
						//     [1]
						// ]],
						// min: 1597363200000,
						// max: 1786579200000,

				        categories: [],
		            },
				    yAxis: {
				    	type: 'linear',
				    	opposite: false,
				        title: {
				            text: 'Working supply'
				        },
				    },
				    plotOptions: {
				    	series: {
				   //  		dataGrouping: {
							//   //forced: true,
							//   units: [
							//   	// ['day', [1]],
							//   	// ['hour', [1]],
							//     ['week', [1,2,3,4,5,6,7,8,9,10]],
							//   	['month', [1,2,3,4,5,6,7,8]],
							//   	['year', [1,2,3]],
							//   ]
							// },
				    	},
				        line: {
				            dataLabels: {
				                enabled: false,
				            },
				        },
				        area: {
				        	stacking: 'normal',
				        },
				    },
				    tooltip: {
				    	pointFormatter() {
				    		let value = helpers.formatNumber(this.y)

				    		return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
				    	},
				    },
				    series: [],
				    legend: {
				    	enabled: true
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
				},

				gwchartdata: {
					chart: {
						panning: true,
						zoomType: 'x',
				        panKey: 'ctrl',
				        type: 'area',
				        height: 600,
				    },
				    title: {
				        text: 'Relative gauge weight'
				    },
				    rangeSelector: {
				    	selected: 6,
				    },
				    xAxis: {
				    	//ordinal: false,
				    	//type: 'datetime',
		            	labels: {

			            	style: {
			            		color: 'black'
			            	}
		            	},
                  //tickInterval: 100,
		            	dateTimeLabelFormats: {
				            // second: '%Y-%m-%d<br/>%H:%M:%S',
				            // minute: '%Y-%m-%d<br/>%H:%M',
				            // hour: '%Y-%m-%d<br/>%H:%M',
				            // day: '%Y<br/>%m-%d',
				            // week: '%Y<br/>%m-%d',
				            // month: '%Y-%m',
				            year: '%Y'
				        },
				  //       units: [[
						//     'year',
						//     [1]
						// ]],
						// min: 1597363200000,
						// max: 1786579200000,

				        categories: [],
		            },
				    yAxis: {
				    	type: 'linear',
				    	opposite: false,
				        title: {
				            text: 'Relative weight %'
				        },
				    },
				    plotOptions: {
				    	series: {
				   //  		dataGrouping: {
							//   //forced: true,
							//   units: [
							//   	// ['day', [1]],
							//   	// ['hour', [1]],
							//     ['week', [1,2,3,4,5,6,7,8,9,10]],
							//   	['month', [1,2,3,4,5,6,7,8]],
							//   	['year', [1,2,3]],
							//   ]
							// },
				    	},
				        line: {
				            dataLabels: {
				                enabled: false,
				            },
				        },
				        area: {
				        	stacking: 'normal',
				        },
				    },
				    tooltip: {
				    	pointFormatter() {
				    		let value = helpers.formatNumber(this.y)

				    		return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}%</b><br/>`
				    	},
				    },
				    series: [],
				    legend: {
				    	enabled: true
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
				},

				CRVAPYchartdata: {
					chart: {
						panning: true,
						zoomType: 'x',
				        panKey: 'ctrl',
				        type: 'line',
				        height: 600,
				    },
				    title: {
				        text: 'CRV APY'
				    },
				    rangeSelector: {
				    	selected: 6,
				    },
				    xAxis: {
				    	//ordinal: false,
				    	//type: 'datetime',
		            	labels: {

			            	style: {
			            		color: 'black'
			            	}
		            	},
                  //tickInterval: 100,
		            	dateTimeLabelFormats: {
				            // second: '%Y-%m-%d<br/>%H:%M:%S',
				            // minute: '%Y-%m-%d<br/>%H:%M',
				            // hour: '%Y-%m-%d<br/>%H:%M',
				            // day: '%Y<br/>%m-%d',
				            // week: '%Y<br/>%m-%d',
				            // month: '%Y-%m',
				            year: '%Y'
				        },
				  //       units: [[
						//     'year',
						//     [1]
						// ]],
						// min: 1597363200000,
						// max: 1786579200000,

				        categories: [],
		            },
				    yAxis: {
				    	type: 'logarithmic',
				    	opposite: false,
				        title: {
				            text: 'CRV APY %'
				        },
				    },
				    plotOptions: {
				    	series: {
				   //  		dataGrouping: {
							//   //forced: true,
							//   units: [
							//   	// ['day', [1]],
							//   	// ['hour', [1]],
							//     ['week', [1,2,3,4,5,6,7,8,9,10]],
							//   	['month', [1,2,3,4,5,6,7,8]],
							//   	['year', [1,2,3]],
							//   ]
							// },
				    	},
				        line: {
				            dataLabels: {
				                enabled: false,
				            },
				        },
				        area: {
				        	stacking: 'normal',
				        },
				    },
				    tooltip: {
				    	pointFormatter() {
				    		let value = helpers.formatNumber(this.y)

				    		return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}%</b><br/>`
				    	},
				    },
				    series: [],
				    legend: {
				    	enabled: true
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
				},

				wschart: null,

				gwchart: null,

				CRVAPYchart: null,


        CRVLocked: null,

		}),

		async mounted() {
			this.$watch(() => contract.multicall, (val, oldval) => {
				if(val)
					this.mounted()
			}, {
				immediate: true
			})
		},

	    computed: {
	      publicPath() {
	          return process.env.BASE_URL
	      },
	    },

	    watch: {
	    	
	    },

		methods: {
			async mounted() {
				
				this.wschart = this.$refs.wscharts.chart

				this.gwchart = this.$refs.gwcharts.chart

				this.CRVAPYchart = this.$refs.CRVAPYcharts.chart

				this.wschart.showLoading()
				this.gwchart.showLoading()
				this.CRVAPYchart.showLoading()

				let statsData = await fetch('https://pushservice.curve.fi/static/CRVAPYs.json')
				statsData = await statsData.json()
				statsData = statsData.filter(v=>v[1][0] > 0).slice(-1000)

				let pools = ['compound', 'usdt', 'y', 'busd', 'pax', 'ren', 'susdv2', 'sbtc',]

				for(let [i, pool] of pools.entries()) {
					this.wschart.addSeries({
						name: pool,
						data: statsData.map((p, j) => [p[0] * 1000,  +p[1][i*4] / 1e18])
					})

					this.gwchart.addSeries({
						name: pool,
						data: statsData.map((p, j) => [p[0] * 1000,  +p[1][i*4 + 2] / 1e18 * 100])
					})

					this.CRVAPYchart.addSeries({
						name: pool,
						data: statsData.map(p => {
							let working_supply = +p[1][i*4] / 1e18
							let inflation_rate = +p[1][i*4 + 1] / 1e18
							let relative_weight = +p[1][i*4 + 2] / 1e18
							let virtual_price = +p[1][i*4 + 3] / 1e18
							let rate = (inflation_rate * relative_weight * 31536000 / working_supply * 0.4) / virtual_price
							let apy = rate * 100
							return [
								p[0] * 1000,
								apy,
							]
						})
					})

					let len = statsData.length - 1
				}

				this.wschart.hideLoading()
				this.gwchart.hideLoading()
				this.CRVAPYchart.hideLoading()

			},
		},
	}
</script>

<style scoped>
	.buttons {
		margin-top: 1em;
	}
	.vestingchart {
		margin-top: 1em;
	}
  .supply img {
    vertical-align: middle;
  }
  .chart {
    margin-top: 1em;
  }
  .supply div:nth-child(2) {
    margin-top: 1em;
  }
  label[for='showpercentage'] {
  	margin-left: 1em;
  }
</style>