<template>
	<div>
		<div v-show='!notVested'>
			<ul>
				<li>Initial locked: {{ initialLockedFormat }}</li>
				<li>Start lock time: {{ startTimeFormat }}</li>
				<li>End lock time: {{ endTimeFormat }}</li>
				<br>
				<li>Claimed tokens: {{ totalClaimedFormat }}</li>
				<li>Claimed + available tokens: {{ vestedFormat }}</li>
				<li>Available tokens: {{ balanceFormat }}</li>
				<li>Locked tokens: {{ lockedFormat }}</li>
			</ul>
			<div class='vestingchart'>
				<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
			</div>
			<gas-price></gas-price>
			<div class='buttons'>
				<button @click='claim'>Claim {{ balanceFormat }} CRV</button>
			</div>
		</div>
		<p class='info-message gentle-message' v-show='notVested'>
			You don't have vested tokens
		</p>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
    import { notify, notifyHandler, notifyNotification } from '../../init'
    
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


	import * as gasPriceStore from '../common/gasPriceStore'
    import GasPrice from '../common/GasPrice.vue'

	import * as helpers from '../../utils/helpers'

	import BN from 'bignumber.js'


	export default {
		components: {
			Highcharts: Chart,
			GasPrice,
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
			total_claimed: null,

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

				notVested: false,

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
			this.$watch(() => contract.default_account, (val, oldval) => {
				if(!val || !oldval) return;
                this.mounted()
			}, {
				immediate: true
			})
		},

		async mounted() {
			if(contract.default_account)
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
			totalClaimedFormat() {
				return (this.total_claimed / 1e18).toFixed(2)
			},
			startTimeFormat() {
				return helpers.formatDateToHuman(this.start_time)
			},
			endTimeFormat() {
				return helpers.formatDateToHuman(this.end_time)
			},
			gasPrice() {
                return gasPriceStore.state.gasPrice
            },
            gasPriceWei() {
                return gasPriceStore.state.gasPriceWei
            },
		},

		methods: {
			async mounted() {
				this.chart = this.$refs.highcharts.chart
				while(this.chart.series.length) {
					this.chart.series[0].remove()
				}
				this.chart.showLoading()

				this.vesting = new web3.eth.Contract(daoabis.vesting_abi, this.address)

				let calls = [
					[this.vesting._address, this.vesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.balanceOf(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.lockedOf(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.initial_locked(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.start_time().encodeABI()],
					[this.vesting._address, this.vesting.methods.end_time().encodeABI()],
					[this.vesting._address, this.vesting.methods.total_claimed(contract.default_account).encodeABI()],
				]

				let aggcalls = await contract.multicall.methods.aggregate(calls).call()

				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))

				console.log(decoded, "DECODED")

				this.vestedOf = decoded[0]
				this.balanceOf = decoded[1]
				this.lockedOf = decoded[2]
				this.initial_locked = decoded[3]
				this.start_time = decoded[4]
				this.end_time = decoded[5]
				this.total_claimed = decoded[6]

				if(+this.initial_locked == 0) {
					//this.notVested = true
					//return;
				}

				let vestedTime = +this.end_time - +this.start_time
				let vestedData = []
				let releasedAmount = this.initial_locked / 1e18 / (vestedTime / 86400)
				for(let i = 0; i < vestedTime / 86400; i++) {
					vestedData.push([(+this.start_time + i*86400) * 1000, i*releasedAmount])
				}

				this.chart.addSeries({
					id: 'unvested',
					name: "Unvested tokens",
					data: vestedData,
					color: '#0b0a57',
				})

				this.chart.addSeries({
					id: 'vested',
					name: "Vested tokens",
					data: vestedData.map(([k, v]) => [k, this.initial_locked / 1e18 - v]),
					color: '#7bb5ec',
				})

				this.chart.hideLoading()
			},

			async claim() {
				var { dismiss } = notifyNotification(`Confirm claiming ${this.balanceFormat} tokens`)
				let gas = await this.vesting.methods.claim(contract.default_account).estimateGas()
				await this.vesting.methods.claim(contract.default_account).send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: gas * 1.5 | 0,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
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