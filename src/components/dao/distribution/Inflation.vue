<template>
	<div class='window white'>
    <div class='info-message gentle-message supply'>
      <div>Approximate circulating supply: <span :class="{'loading line': circ_supply === null}"></span> {{ circSupplyFormat }} <img class='icon small' :src="publicPath + 'logo.png'"> CRV</div>
      <div>Total supply: 3.03B <img class='icon small' :src="publicPath + 'logo.png'"> CRV</div>
    </div>
		<highcharts class='chart' :options="chartdata" ref='highcharts'></highcharts>
	</div>
</template>

<script>
	import { contract, getters } from '../../../contract'
	import allabis from '../../../allabis'
	import daoabis from '../../dao/allabis'

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
				            text: 'Amount locked'
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
				    		let value = this.y.toFixed(2)

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

				chart: null,

        dates: [],

        inflation: [],
        earlyusers: [],
        employees: [],
        investors: [],
        founder: [],

        circ_supply: null,

		}),

		async mounted() {
			this.mounted()
		},

    computed: {
      circSupplyFormat() {
        return helpers.formatNumber(this.circ_supply)
      },
      publicPath() {
          return process.env.BASE_URL
      },
    },

		methods: {
			async mounted() {
				this.chart = this.$refs.highcharts.chart
				
				this.chart.showLoading()

        let jsons = ['founder', 'investors', 'employees', 'users', 'inflation', 'dates']
        let data = await Promise.all(jsons.map(json => fetch(`https://www.curve.fi/raw-stats/${json}.json`)))
        data = await Promise.all(data.map(r => r.json()))
        this.founder = data[0]
        this.earlyusers = data[1]
        this.employees = data[2]
        this.investors = data[3]
        this.inflation = data[4]
        this.dates = data[5]

        let supply_next_idx = this.dates.findIndex(date => date > Date.now())
        let supply_prev_idx = supply_next_idx - 1

        let supply_prev = this.founder[supply_prev_idx] + this.investors[supply_prev_idx] + this.employees[supply_prev_idx] + this.earlyusers[supply_prev_idx] + this.inflation[supply_prev_idx]

        let supply_next = this.founder[supply_next_idx] + this.investors[supply_next_idx] + this.employees[supply_next_idx] + this.earlyusers[supply_next_idx] + this.inflation[supply_next_idx]

        let interpolator = helpers.interpolate(Date.now(), this.dates[supply_prev_idx], this.dates[supply_next_idx])
        let supply = interpolator(supply_prev, supply_next)

        this.circ_supply = supply

        console.log(supply_prev, supply_next, supply)
        

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
</style>