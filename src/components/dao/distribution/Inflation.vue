<template>
	<div>
		<div class='window white'>
		    <div class='info-message gentle-message supply'>
		      <div>Circulating supply: <span :class="{'loading line': circ_supply === null}"></span> {{ circSupplyFormat }} <img class='icon small' :src="publicPath + 'logo.png'"> CRV</div>
		      <div class='totalCRVlocked'>
				Total <img class='icon small' :src="publicPath + 'logo.png'"> CRV Locked: 
				<span :class="{'loading line': CRVLocked === null}"></span> 
				<span v-show='CRVLocked > 0'> {{ CRVLockedFormat }} </span>
				<span v-show='supply > 0'> ({{ CRVLockedPercent }}% of all circulating CRV) </span>
			  </div>
		      <div>Total supply: 3.03B <img class='icon small' :src="publicPath + 'logo.png'"> CRV</div>
		    </div>
		    <p>
		    	<input id='showlinear' type='radio' v-model='showtype' value='0'>
		    	<label for='showlinear'>Show linear</label>

		    	<input id='showpercentage' type='radio' v-model='showtype' value='1'>
		    	<label for='showpercentage'>Show percentage</label>
			</p>
			<highcharts class='chart' :options="chartdata" ref='highcharts'></highcharts>

			<highcharts class='chart' :constructor-type="'stockChart'" :options="linechartdata" ref='linecharts'></highcharts>
		</div>

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

			chartdata: {
					chart: {
						panning: true,
						zoomType: 'x',
				        panKey: 'ctrl',
				        type: 'area',
				    },
				    title: {
				        text: 'Inflation'
				    },
				    rangeSelector: {
				    	selected: 6,
				    },
				    xAxis: {
				    	//ordinal: false,
				    	type: 'datetime',
		            	labels: {
		            		formatter: function() {
					          return Highcharts.dateFormat('%b/%e/%Y', this.value);
					        },
 	
			            	style: {
			            		color: 'black'
			            	}
		            	},
                  tickInterval: 100,
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
				            text: 'CRV inflation'
				        },
				    },
				    plotOptions: {
				    	series: {
				    		dataGrouping: {
							  //forced: true,
							  units: [
							  	// ['day', [1]],
							  	// ['hour', [1]],
							    ['week', [1,2,3,4,5,6,7,8,9,10]],
							  	['month', [1,2,3,4,5,6,7,8]],
							  	['year', [1,2,3]],
							  ]
							},
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
				    		let total = helpers.formatNumber(this.total)

				    		return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b>
				    				<br/>Total: ${total}`
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

			linechartdata: {
					chart: {
						panning: true,
						zoomType: 'x',
				        panKey: 'ctrl',
				        type: 'line',
				    },
				    title: {
				        text: 'CRV inflation / Locked CRV'
				    },
				    rangeSelector: {
				    	selected: 6,
				    },
				    xAxis: {
				    	//ordinal: false,
				    	//type: 'datetime',
		            	labels: {
		           //  		formatter: function() {
					        //   return Highcharts.dateFormat('%b/%e/%Y', this.value);
					        // },

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
				            text: 'CRV inflation / Amount locked'
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
				    		let total = helpers.formatNumber(this.total)

				    		return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b>
				    				<br/>Total: ${total}`
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

				wschartdata: {
					chart: {
						panning: true,
						zoomType: 'x',
				        panKey: 'ctrl',
				        type: 'line',
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

				chart: null,

				linechart: null,

				wschart: null,

				gwchart: null,

				CRVAPYchart: null,

        dates: [],

        inflation: [],
        earlyusers: [],
        employees: [],
        investors: [],
        founder: [],

        supply: null,
        circ_supply: null,

        CRVLocked: null,

        showtype: 0,

		}),

		async created() {
			this.address = daoabis.vesting_address

			this.$watch(() => contract.default_account && contract.multicall, (val, oldval) => {
				if(val != null && oldval != null)
					this.mounted()
			}, {
				immediate: true
			})
		},

		async mounted() {
			if(contract.default_account && contract.multicall)
				this.mounted()
		},

	    computed: {
	      circSupplyFormat() {
	        return helpers.formatNumber(this.circ_supply)
	      },
	      publicPath() {
	          return process.env.BASE_URL
	      },
	      CRVLockedFormat() {
	    	return helpers.formatNumber(this.CRVLocked / 1e18)
		  },
		  CRVLockedPercent() {
		  	return ((this.CRVLocked / this.supply) * 100).toFixed(2)
		  },
	    },

	    watch: {
	    	showtype(val) {
	    		if(val == 0)
	    			this.chart.update({ plotOptions: { area: { stacking: 'normal' } } })
	    		if(val == 1)
	    			this.chart.update({ plotOptions: { area: { stacking: 'percent' } } })
	    	},
	    },

		methods: {
			async mounted() {

				let statsData = await fetch('https://pushservice.curve.fi/CRVAPY')
				statsData = await statsData.json()
				statsData = statsData.APYs.slice(3)

				this.chart = this.$refs.highcharts.chart

				this.linechart = this.$refs.linecharts.chart

				this.wschart = this.$refs.wscharts.chart

				this.gwchart = this.$refs.gwcharts.chart

				this.CRVAPYchart = this.$refs.CRVAPYcharts.chart

				let pools = ['compound', 'usdt', 'y', 'busd', 'pax', 'ren', 'susdv2', 'sbtc',]

				for(let [i, pool] of pools.entries()) {
					this.wschart.addSeries({
						name: pool,
						data: statsData.map((p, j) => [p[0] * 1000,  +p[1][i*4] / 1e18])
					})

					console.log(i*4 + 3)

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
				}

				this.linechart.showLoading()
				
				this.chart.showLoading()

				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-votingescrow-mainnet')
				let currentBlock = +(await web3.eth.getBlockNumber())
				let veStartingBlock = 10647812
				
				let QUERY = `
					{
						crvlockeds {
							CRV
						}

						crvlockedHistories {
							id
							CRV
							timestamp
						}
					}
				`

				let results = await wrapper.performQuery(QUERY)
				this.CRVLocked = +results.data.crvlockeds[0].CRV

				const start_epoch_supply = 1303030303 * 10 ** 18

				let CRV = new web3.eth.Contract(daoabis.CRV_abi, daoabis.CRV_address)

				let vestingContracts = [
					'0x575ccd8e2d300e2377b43478339e364000318e2c',
					'0xd2D43555134dC575BF7279F4bA18809645dB0F1D',
					'0x2A7d59E327759acd5d11A8fb652Bf4072d28AC04',
					'0xf7dBC322d72C1788a1E37eEE738e2eA9C7Fa875e',
					'0x679FCB9b33Fc4AE10Ff4f96caeF49c1ae3F8fA67',
					'0x81930d767a75269dc0e9b83938884e342c1fa5f6',
					'0x629347824016530fcd9a1990a30658ed9a04c834',
					//'0xe3997288987e6297ad550a69b31439504f513267',
					// '0x41df5d28c7e801c4df0ab33421e2ed6ce52d2567',
					// '0xf22995a3ea2c83f6764c711115b23a88411cafdd',
				]

				let exampleVesting = new web3.eth.Contract(daoabis.vesting_abi, vestingContracts[0])

				let calls = [
					[CRV._address, CRV.methods.available_supply().encodeABI()],
					...vestingContracts.map(address => [address, exampleVesting.methods.vestedSupply().encodeABI()]),
				]

				let aggcalls = await contract.multicall.methods.aggregate(calls).call()

				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))

				let available_supply = +decoded[0]

				this.supply = available_supply - start_epoch_supply + decoded.slice(1).reduce((a, b) => +a + +b, 0)

				this.circ_supply = (this.supply - this.CRVLocked) / 1e18

		        let jsons = ['founder', 'investors', 'employees', 'users', 'inflation', 'dates']
		        let data = await Promise.all(jsons.map(json => fetch(`https://www.curve.fi/raw-stats/${json}.json`)))
		        data = await Promise.all(data.map(r => r.json()))
		        this.founder = data[0]
		        this.investors = data[1]
		        this.employees = data[2]
		        this.earlyusers = data[3]
		        this.inflation = data[4]
		        this.dates = data[5]

		        let totalsum = this.founder.map((v, i) => v + this.investors[i] + this.employees[i] + this.earlyusers[i] + this.inflation[i])

		        let start_epoch_time = 1597357048
		        let now = Date.now() / 1000

		        let launchDays = Math.ceil((now - start_epoch_time) / 86400)


		        // this.linechart.xAxis[0].update({
		        //   categories: this.dates.slice(0, launchDays),
		        // })

		        this.linechart.addSeries({
		        	name: "Total CRV",
		        	data: totalsum.slice(0, launchDays).map((v, i) => [this.dates.slice(0, launchDays)[i], v]),
		        })

		        let CRVHistory = results.data.crvlockedHistories.sort((a, b) => a.timestamp - b.timestamp).map(v => [v.timestamp * 1000, v.CRV / 1e18])
		        this.linechart.addSeries({
		        	name: 'Total vote-locked CRV',
		        	data: CRVHistory,
		        })
				
				this.linechart.hideLoading()		        

		        this.chart.xAxis[0].update({
		          categories: this.dates,
		        })

						this.chart.addSeries({
							name: 'Inflation',
							data: this.inflation,
		          color: '#800080',
						})

		        this.chart.addSeries({
		          name: "Early users",
		          data: this.earlyusers,
		          color: '#8B0000',
		        })
		        
		        this.chart.addSeries({
		          name: 'Employees',
		          data: this.employees,
		          color: '#008000',
		        })

		        this.chart.addSeries({
		          name: 'Investors',
		          data: this.investors,
		          color: '#FFA500',
		        })
		        
		        this.chart.addSeries({
		          name: 'Founder',
		          data: this.founder,
		          color: '#3465A4',
		        })

				this.chart.hideLoading()
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