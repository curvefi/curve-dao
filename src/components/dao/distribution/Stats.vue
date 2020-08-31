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

		<div class='window white'>
			<highcharts :options="piechartdata" ref='piecharts'></highcharts>
		</div>

		<div class='window white'>
			<highcharts :options="stakedpercentageschartdata" ref='stakedpercentagescharts'></highcharts>
		</div>

	</div>
</template>

<script>
	import Vue from 'vue'

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

	import * as volumeStore from '../../common/volumeStore'

	import * as helpers from '../../../utils/helpers'

	import BN from 'bignumber.js'


	export default {
		components: {
			Highcharts: Chart,
		},

		props: ['address'],

		data() {
			return {
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

	        gaugesNames: {
	        	"0x7ca5b0a2910B33e9759DC7dDB0413949071D7575": 'compound',
				"0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53": 'usdt',
				"0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1": 'y',
				"0x69Fb7c45726cfE2baDeE8317005d3F94bE838840": 'busd',
				"0x64E3C23bfc40722d3B649844055F1D51c1ac041d": 'pax',
				"0xB1F2cdeC61db658F091671F5f199635aEF202CAC": 'ren',
				"0xA90996896660DEcC6E997655E065b23788857849": 'susdv2',
				"0x705350c4BcD35c9441419DdD5d2f097d7a55410F": 'sbtc',
	        },

	        piechartdata: {
				chart: {
			        plotBackgroundColor: null,
			        plotBorderWidth: null,
			        plotShadow: false,
			        type: 'pie'
			    },
			    title: {
			        text: 'Gauge supply'
			    },
			    tooltip: {
			        pointFormatter() {
			        	let value = this.y.toFixed(2)
			        	let supply = helpers.formatNumber(this.supply / 1e18)
			        	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}% (${supply}$)</b><br/>`
			        },
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
			        }
			    },
			    series: [],
			},

			piechart: null,

			stakedpercentageschartdata: {
				chart: {
			        plotBackgroundColor: null,
			        plotBorderWidth: null,
			        plotShadow: false,
			        type: 'column'
			    },
			    title: {
			        text: 'Staked % in gauge'
			    },
			    tooltip: {
			        pointFormatter() {
			        	let value = this.y.toFixed(2)
			        	return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}%</b><br/>`
			        },
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
			        }
			    },
			    xAxis: {
			    	categories: ['compound', 'usdt', 'y', 'busd', 'pax', 'ren', 'susdv2', 'sbtc'],
			    },
			    series: [],
			},

			supplies: {},

			}
		},

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

				this.loadStats()
				
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
			async loadStats() {
				this.piechart = this.$refs.piecharts.chart
				this.stakedpercentagechart = this.$refs.stakedpercentagescharts.chart
				this.piechart.showLoading()
				this.stakedpercentagechart.showLoading()

				let btcPrice = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`)
				btcPrice = await btcPrice.json()
				btcPrice = btcPrice.bitcoin.usd
				let calls = Object.keys(this.gaugesNames).map(gauge => [gauge, '0x18160ddd'])
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				decoded = decoded.map((v, i) => {
					let supply = v
					let gaugeName = this.gaugesNames[calls[i][0]]
					if(['ren', 'sbtc'].includes(gaugeName))
						supply *= btcPrice
					Vue.set(this.supplies, gaugeName, supply)
					return supply
				})
				let totalSupply = decoded.reduce((a, b) => +a + +b, 0)
				let piedata = decoded.map((v, i) => ({ name: this.gaugesNames[calls[i][0]], y: +v * 100 / totalSupply, supply: v }))

				this.piechart.addSeries({
					name: 'Gauge supply',
					data: piedata,
				}, false, false)

				this.piechart.update({
					title: {
						text: `Gauge supply - total ${helpers.formatNumber(totalSupply / 1e18)}$`
					}
				})

				this.piechart.hideLoading()

				await volumeStore.fetchVolumeData(['compound', 'usdt', 'y', 'busd', 'susdv2', 'pax', 'ren', 'sbtc'], true, 1440)
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

				delete data.tbtc

				data = Object.fromEntries(Object.entries(data).map(([k, v]) => {
					let point = v[v.length - 1]
					console.log(k, point, "THE POINT")
					let totalBalance = point.balances.map((bal, i) => {
						return bal * point.rates[i] / 1e18 / allabis[k == 'susd' ? 'susdv2' : k].coin_precisions[i]
					}).reduce((a, b) => a + b, 0)
					return [k, {...point, totalBalance: totalBalance}]
				}))

				let stakedPercentage = piedata.map(v => {
					console.log(v.name, "NAME")
					return (v.supply / 1e18) * 100 / data[v.name == 'susdv2' ? 'susd' : v.name].totalBalance
				})

				this.stakedpercentagechart.addSeries({
					name: 'Staked % in gauge',
					data: stakedPercentage,
				})

				this.stakedpercentagechart.hideLoading()
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