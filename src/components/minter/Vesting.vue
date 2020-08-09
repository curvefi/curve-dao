<template>
	<div>
		<ul>
			<li>Initial locked: {{ initialLockedFormat }}</li>
			<li>Start lock time: {{ startTimeFormat }}</li>
			<li>End lock time: {{ endTimeFormat }}</li>
			<br>
			<li>Claimed + unvested tokens: {{ vestedFormat }}</li>
			<li>Unvested tokens: {{ balanceFormat }}</li>
			<li>Locked tokens: {{ lockedFormat }}</li>
		</ul>
		<div class='vestingchart'>
			<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
		</div>
		<div class='buttons'>
			<button @click='claim'>Claim {{ balanceFormat }} CRV</button>
		</div>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
	import allabis from '../../allabis'
	import daoabis from '../dao/allabis'

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

	import * as helpers from '../../utils/helpers'

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
				        type: 'line',
				    },
				    title: {
				        text: 'Unvested tokens'
				    },
				    rangeSelector: {
				    	selected: 4,
				    },
				    xAxis: {
				    	//ordinal: false,
				    	//type: 'datetime',
		            	labels: {	
			            	style: {
			            		color: 'black'
			            	}
		            	},
		            	dateTimeLabelFormats: {
				            second: '%Y-%m-%d<br/>%H:%M:%S',
				            minute: '%Y-%m-%d<br/>%H:%M',
				            hour: '%Y-%m-%d<br/>%H:%M',
				            day: '%Y<br/>%m-%d',
				            week: '%Y<br/>%m-%d',
				            month: '%Y-%m',
				            year: '%Y'
				        },
		            },
				    yAxis: {
				    	type: 'linear',
				    	opposite: false,
				        title: {
				            text: 'Amount locked'
				        }
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
				        }
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
				},

				chart: null,

		}),

		watch: {
			address(val, oldval) {
				while(this.chart.series.length) {
					this.chart.series[0].remove()
				}
				this.mounted()
			},
		},

		async created() {
			this.$watch(() => contract.default_account && contract.multicall, (val, oldval) => {
				//if(val != null && oldval != null)
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
			vestedFormat() {
				return (this.vestedOf / 1e18).toFixed(2)
			},
			balanceFormat() {
				return (this.balanceOf / 1e18).toFixed(2)
			},
			lockedFormat() {
				return (this.lockedOf / 1e18).toFixed(2)
			},
			initialLockedFormat() {
				return (this.initial_locked / 1e18).toFixed(2)
			},
			startTimeFormat() {
				return helpers.formatDateToHuman(this.start_time)
			},
			endTimeFormat() {
				return helpers.formatDateToHuman(this.end_time)
			},
		},

		methods: {
			async mounted() {
				this.chart = this.$refs.highcharts.chart
				this.chart.showLoading()

				this.vesting = new web3.eth.Contract(daoabis.vesting_abi, daoabis.vesting_address)

				let calls = [
					[this.vesting._address, this.vesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.balanceOf(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.lockedOf(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.initial_locked(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.start_time().encodeABI()],
					[this.vesting._address, this.vesting.methods.end_time().encodeABI()],
				]

				let aggcalls = await contract.multicall.methods.aggregate(calls).call()

				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))

				this.vestedOf = decoded[0]
				this.balanceOf = decoded[1]
				this.lockedOf = decoded[2]
				this.initial_locked = decoded[3]
				this.start_time = decoded[4]
				this.end_time = decoded[5]

				let vestedTime = +this.end_time - +this.start_time
				let vestedData = []
				let releasedAmount = this.initial_locked / 1e18 / (vestedTime / 86400)
				for(let i = 0; i < vestedTime / 86400; i++) {
					vestedData.push([(+this.start_time + i*86400) * 1000, i*releasedAmount])
				}

				this.chart.addSeries({
					name: "Unvested tokens",
					data: vestedData,
					color: '#0b0a57',
				})

				this.chart.addSeries({
					name: "Vested tokens",
					data: vestedData.map(([k, v]) => [k, this.initial_locked / 1e18 - v]),
					color: '#7bb5ec',
				})

				this.chart.hideLoading()
			},

			async claim() {
				await this.vesting.methods.claim(contract.default_account).send({
					from: contract.default_account
				})

				this.mounted()
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
</style>