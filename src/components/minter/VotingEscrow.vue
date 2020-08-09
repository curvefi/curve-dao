<template>
	<div :class="{'window white': (showvelock && showchart)}">

		<div id='modal' class='rootmodal modal' v-show='showModal' @click.self='showModal = false'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='showModal = false'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Confirm lock</legend>
					<div class='content'>
						Confirm locking {{ deposit }} CRV until {{ increaseLockText }}
					</div>
					<p class='info-message gentle-message' v-show='showConfirmMessage'>
						Please confirm the transaction in your wallet
					</p>
					<button @click='submitModal'> OK </button>
				</fieldset>
			</div>
		</div>

		<fieldset>
			<legend>
				Voting power in DAO
			</legend>
			<div>
				CRV <img class='icon small' :src="publicPath + 'logo.png'"> balance: {{ crvBalanceText }}
			</div>
			<div v-show='hasvecrv'>
				<div>
					Balance in Voting Escrow: {{ vecrvBalanceText }} veCRV
				</div>
				<div>
					<img :src="publicPath + 'lock-solid.svg'" class='icon small'> Locked until: {{ lockTimeText }}
				</div>
			</div>
			<div v-show='showchart && events && events.length > 0'>
				<p>
					<input id='showend' type='checkbox' v-model='showend'>
					<label for='showend'>Show until end</label>

					<div class='chartoptions'>
						<input id='showmypower' type='checkbox' v-model='showmypower'>
						<label for='showmypower'>Show my voting power</label>

						<input id='showdaopower' type='checkbox' v-model='showdaopower'>
						<label for='showdaopower'>Show DAO voting power</label>
					</div>
				</p>
				<highcharts v-show='hasvecrv && showvelock' :constructor-type="'stockChart'" :options="chartdata" ref='highcharts' class='lockchart'></highcharts>
			</div>
			<div class='velock' v-show='showvelock'>
				<div class='increaselock' v-show='hasvecrv'>
					<p class='depositinputs'>
						<label for='deposit'>Increase amount:</label>
						<input id='deposit' type='text' :class = "{'invalid': isInvalidAmount}" v-model='deposit'>
						<span class='maxbalance' @click='setMaxBalance'>Max: {{ crvBalanceText }}</span>
						<br>
						<button @click="confirmModal('increaseAmount')">Add</button>
					</p>
					<p class='depositinputs'>
						<label for='incraselock'>Increase lock:</label>
						<datepicker 
							id='increaselock' 
							name='increaselock' 
							v-model='increaseLock'
							:disabled-dates='disabledDates'
							:open-date='openDate'
						></datepicker>
						<div class='increaseLockButtons'>
							<button @click='lockButton(604800, 0)'>Lock 1 week</button>
							<button @click='lockButton(2678400, 0)'>Lock 1 month</button>
							<button @click='lockButton(16070400, 0)'>Lock 6 months</button>
							<button @click='lockButton(31536000, 0)'>Lock 1 year</button>
							<button @click='lockButton(126144000, 0)'>Lock 4 years</button>
						</div>
						<br>
						<button @click="confirmModal('submitIncreaseLock')">Increase lock</button>
					</p>
				</div>
				<div class='increaselock' v-show='!hasvecrv'>
					<p class='depositinputs'>
						<label for='deposit'>Amount:</label>
						<input id='deposit' type='text' :class = "{'invalid': isInvalidAmount}" v-model='deposit'>
						<span class='maxbalance' @click='setMaxBalance'>Max: {{ crvBalanceText }}</span>
					</p>
					<p class='depositinputs'>
						<label for='incraselock'>Lock time:</label>
						<datepicker 
							id='increaselock' 
							name='increaselock' 
							v-model='increaseLock'
							:disabled-dates='disabledDates'
							:open-date='openDate'
						></datepicker>
						<div class='increaseLockButtons'>
							<button @click='lockButton(604800, 1)'>Lock 1 week</button>
							<button @click='lockButton(2678400, 1)'>Lock 1 month</button>
							<button @click='lockButton(16070400, 1)'>Lock 6 months</button>
							<button @click='lockButton(31536000, 1)'>Lock 1 year</button>
							<button @click='lockButton(126144000, 1)'>Lock 4 years</button>
						</div>
					</p>
					<button @click="confirmModal('createLock')">Create lock</button>
				</div>
				<p>
					Your starting voting power will be: {{ newVotingPower() }} veCRV
				</p>
				<p class='info-message gentle-message' v-show='newVotingPower() < 2500'>
					You need at least 2500 veCRV to be able to create a vote
				</p>
			</div>
			<div v-show='!showvelock'>
				<slot></slot>
			</div>
		</fieldset>
	</div>
</template>

<script>
    import * as common from '../../utils/common'
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

	const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic')

	import Datepicker from 'vuejs-datepicker';

	import { contract, getters } from '../../contract'

	import daoabis from '../dao/allabis'

	import * as veStore from './veStore'

	import * as helpers from '../../utils/helpers'

	import BN from 'bignumber.js'

	export default {
		components: {
			Datepicker,
			highcharts: Chart,
		},

		props: {
			showvelock: {
				type: Boolean,
				default: true,
			},
			showchart: {
				type: Boolean,
				default: true,
			},
		},

		data() {
			return {
				CRV: null,
				crvBalance: BN(0),
				votingEscrow: null,
				
				lockTime: 0,

				interval: null,

				showModal: false,
				showConfirmMessage: false,

				method: null,

				wrapper: null,

				loaded: false,

				chartdata: {
					chart: {
						panning: true,
						zoomType: 'x',
				        panKey: 'ctrl',
				        type: 'line',
				    },
				    title: {
				        text: 'veCRV Voting Power'
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
				                enabled: true,
				                formatter: (function(self) {
				                	return function() {
				            			let event = self.events.find(e => e.timestamp == this.x / 1000)
				            			if(event !== undefined && event.type !== 'decrease')
				            				return this.y.toFixed(0)
			            			}
			            		})(this)
				            },
				        }
				    },
				    tooltip: {
				    	pointFormatter: (function(self) {
				    		return function() {
				    			let value = this.y.toFixed(2)
				    			if(this.series.name == 'My Voting Power') {
					    			let event = self.events.find(e => e.timestamp == this.x / 1000)
					    			//this is the period end
					    			if(event === undefined)
					    				return `
					    					<div>
					    						Voting lock end
					    					</div>
					    					<br>
					    					<div>
					    						Voting power: 0
				    						</div>
					    				`
					    			else {
					    				let titleHTML = `
					    							<div>
						    							${event.type == 'create_lock' ? '<b> Create lock </b>' : ''}
						    							${event.type == 'increase_amount' ? '<b> Increase amount </b>' : ''}
						    							${event.type == 'increase_unlock_time' ? '<b> Increase unlock time </b>' : ''}
						    							${event.type == 'withdraw' ? '<b> Withdraw </b>' : ''}
						    						</div>
						    			`

						    			let contentHTML = `
						    						
						    						<br>
						    						<div>
						    							${this.series.name}: <b>${value}</b><br/>
					    							</div>
						    						<br>
						    						<div>Locked until: ${helpers.formatDateOnlyToHuman(event.locktime)}</div>
					    						`

						    			return event.type !== 'decrease' ? titleHTML + contentHTML : contentHTML
						    		}
				    			}
					    		if(this.series.name = 'DAO Voting Power') {
					    			return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
					    		}
				    		}
				    	})(this),
				    },
				    series: [],
				    legend: {
				    	enabled: true
				    },
				},

				chart: null,
				
				events: [],

				chartData: [],

				showend: false,

				showmypower: true,
				showdaopower: false,
			}

		},

		async created() {
			this.$watch(() => contract.default_account && contract.multicall, (val, oldval) => {
				if(val != null && oldval != null)
					this.mounted()
			})
		},

		async mounted() {
			if(contract.default_account && contract.multicall)
				this.mounted()
		},

		watch: {
			showend(val) {
				this.showEnd()
			},

			showmypower(val) {
				if(val == false && !this.showdaopower) return;
				let toggle = 'show'
				if(!val) {
					toggle = 'hide'
				}
				this.chart.series[0][toggle]()
			},
			showdaopower(val) {
				if(val == false && !this.showmypower) return
				let toggle = 'show'
				if(!val) toggle = 'hide'
				this.chart.series[1][toggle]()
			},
		},

		computed: {
			vecrvBalance: {
				get() {
					return veStore.state.vecrvBalance
				},
				set(val) {
					veStore.state.vecrvBalance = val
				},
			},
			crvBalanceText() {
				return this.crvBalance.div(1e18).toFixed(2,1)
			},
			vecrvBalanceText() {
				return this.vecrvBalance.div(1e18).toFixed(2,1)
			},
			lockTimeText() {
				return helpers.formatDateToHuman(this.lockTime)
			},
			publicPath() {
				return process.env.BASE_URL
			},
			disabledDates() {
				return {
					to: new Date((this.lockTime + 604800) * 1000),
					from: new Date(Date.now() + 126144000000),
				}
			},
			openDate() {
				return new Date((this.lockTime + 604800) * 1000)
			},
			hasvecrv() {
				return this.vecrvBalance.gt(0)
			},
			isInvalidAmount() {
				return this.deposit < 0 || BN(this.deposit).gt(this.crvBalance.div(1e18))
			},
			increaseLockText() {
				return helpers.formatDateToHuman(Date.parse(this.increaseLock) / 1000)
			},
			deposit: {
				get() {
					return veStore.state.deposit
				},
				set(val) {
					veStore.state.deposit = val
				},
			},
			increaseLock: {
				get() {
					return veStore.state.increaseLock
				},
				set(val) {
					veStore.state.increaseLock = val
				},
			},
		},

		methods: {
			async mounted() {
				this.loaded = true
				this.chart = this.$refs.highcharts.chart
				this.chart.showLoading()
				this.chart.series[0] && this.chart.series[0].remove()

				this.loadBalances()
				if(this.showvelock && this.showchart)
					this.loadChart()

			},

			async loadBalances() {
				this.votingEscrow = new web3.eth.Contract(daoabis.votingescrow_abi, '0x7477FFEc941d1b8251Ef2d0216AfE7daf2Cf74Ab')
				this.CRV = new web3.eth.Contract(daoabis.CRV_abi, '0xC6bfF6CC1B890cAF4c3CA9cCCE25963EC4A22348')


				let calls = [
					[this.votingEscrow._address, this.votingEscrow.methods.balanceOf(getters.default_account()).encodeABI()],
					[this.votingEscrow._address, this.votingEscrow.methods.locked__end(getters.default_account()).encodeABI()],
					[this.CRV._address, this.CRV.methods.balanceOf(getters.default_account()).encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				this.vecrvBalance = BN(decoded[0])
				this.lockTime = +decoded[1]
				this.increaseLock = new Date((this.lockTime + 604800)* 1000)
				if(this.lockTime == 0) {
					this.lockTime = Date.now() / 1000
					this.increaseLock = new Date(Date.now() + 604800 * 1000)
				}
				this.crvBalance = BN(decoded[2])
				this.deposit = this.crvBalance.div(1e18).toFixed(0,1)
				this.deposit = 0

				if(this.crvBalance.gt(0)) {
					this.interval = setIntervalAsync(this.newVotingPower, 10000)
				}
			},

			async loadChart() {

				this.wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-votingescrow-rinkeby2')
				let QUERY = gql`
					{
						votingEscrows(where: { provider: "${getters.default_account()}" }, orderBy: timestamp, orderDirection: asc) {
							id
							provider
							value
							locktime
							type
							totalPower
							timestamp
						}
					}
				`

				let DAOPowerQUERY = gql`
					{
					  daopowers(orderBy: block, orderDirection: asc) {
					    id
					    block
					    timestamp
					    totalPower
					  }
					}
				`

				let results = await Promise.all([this.wrapper.performQuery(QUERY), this.wrapper.performQuery(DAOPowerQUERY)])
				console.log(results, "THE RESULTS")
				let events = results[0].data.votingEscrows
				this.events = events
				events = events.map(event => {
					event.votingPower = this.calcVotingPower(event.totalPower, event.timestamp, event.locktime) * 1000
					return event
				})
				let chartData = events.map((event, i) => [event.timestamp * 1000, event.votingPower])
				let lastEvent = events[events.length - 1]
				let lastData = [lastEvent.locktime * 1000, 0]
				chartData.push(lastData)
				this.events.push({...this.events[this.events.length - 1], value: 0, votingPower: 0})
				this.chartData = chartData = this.interpolateVotingPower(chartData)
				this.chart.addSeries({
					name: 'My Voting Power',
					data: chartData.slice(0, chartData.length - 11),
				})

				let daopower = results[1].data.daopowers

				let daopowerdata = daopower.map(e => [e.timestamp * 1000, e.totalPower / 1e18])
				this.chart.addSeries({
					name: 'DAO Voting Power',
					data: daopowerdata,
					color: '#0b0a57',
				})

				this.chart.series[1].hide()

				this.chart.hideLoading()
			},

			interpolateVotingPower(chartData) {
				let origEvents = this.events.slice()
				console.log(origEvents, "ORIG EVENTS")
				let newChartData = []
				console.log(chartData.slice(), "CHARTDATA LENGTH")
				for(let j = 1; j < chartData.length; j++) {
					let v = chartData[j]
					let prev = chartData[j-1]
					//if(v.length == 1) continue
					newChartData.push(prev)
					let startTimestamp = prev[0]
					let startAmount = prev[1]
					let endTimestamp = v[0]
					let endAmount = v[1]
					let diff = endTimestamp - startTimestamp
					let diffAmount = endAmount - startAmount
					let amountLocked = origEvents[j-1].totalPower
					let numPoints = 10
					if(chartData.length > 1) {
						for(let i = 0; i < numPoints; i++) {
							console.log(origEvents[j-1].totalPower, i, "TOTAL POWER")
							let currentTimestamp = startTimestamp + i * (diff / numPoints)
							console.log(amountLocked, currentTimestamp, this.events[j-1].locktime * 1000, "AMOUNTS")
							let amount = this.calcVotingPower(amountLocked, currentTimestamp, this.events[j-1].locktime * 1000)
							console.log(amount, "THE AMOUNT")
							if(this.events.find(e=>e.timestamp == currentTimestamp / 1000) === undefined) {
								this.events.splice(j, 0, {
									type: 'decrease',
									timestamp: currentTimestamp / 1000,
									locktime: this.events[j].locktime,
								})
							}
							//console.log(amount, "THE AMOUNT")
							newChartData.push([currentTimestamp, amount])
						}
					}
					newChartData.push(v)
				}
				newChartData.push(chartData[chartData.length - 1])
				return newChartData
			},

			calcVotingPower(amount, time, locktime) {
				return amount / 1e18 * ((locktime - time) / 1000) / (86400 * 365) / 4
			},

			showEnd() {
				let chartData = this.chartData.slice()
				if(!this.showend) {
					chartData = chartData.slice(0, chartData.length - 11)
				}
				this.chart.series[0].setData(chartData, true, false)
				if(this.showend) {
					this.chart.rangeSelector.clickButton(4, false, false)
					this.chart.xAxis[0].update({
						ordinal: false,
					})
				}
			},

			setMaxBalance() {
				this.deposit = this.crvBalance.div(1e18).toString()
			},

			async increaseAmount() {
				this.showConfirmMessage = true;

				let deposit = BN(this.deposit).times(1e18)
				if(deposit.gt(this.crvBalance))
					deposit = this.crvBalance
				await common.approveAmount(this.CRV, deposit, getters.default_account(), this.votingEscrow._address)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_amount(deposit.toFixed(0,1)).send({
							from: getters.default_account(),
							gas: 1000000,
						})
						.once('transactionHash', () => resolve())
						.on('error', err => reject(err))
						.on('receipt', receipt => {
							this.mounted()
						})
				})
				this.showConfirmMessage = false
				this.showModal = false
			},

			async submitIncreaseLock() {
				this.showConfirmMessage = true;

				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_unlock_time(lockTime).send({
							from: getters.default_account(),
							gas: 10000000,
						})
						.once('transactionHash', () => resolve())
						.on('error', err => reject(err))
						.on('receipt', receipt => {
							this.mounted()
						})
				})
				this.showConfirmMessage = false
				this.showModal = false
			},

			async createLock() {
				this.showConfirmMessage = true;
				console.log("INCREASE LOCK")

				let deposit = BN(this.deposit).times(1e18)
				if(deposit.gt(this.crvBalance))
					deposit = this.crvBalance
				await common.approveAmount(this.CRV, deposit, getters.default_account(), this.votingEscrow._address)
				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.create_lock(deposit.toFixed(0,1), lockTime).send({
							from: getters.default_account(),
							gas: 1000000,
						})
						.once('transactionHash', () => resolve())
						.on('error', err => reject(err))
						.on('receipt', receipt => {
							this.mounted()
						})
				})
				this.showConfirmMessage = false
				this.showModal = false
			},

			async confirmModal(method) {
				this.method = method
				this.showModal = true
			},

			async submitModal(method) {
				this[this.method]()
			},

			newVotingPower() {
				return veStore.newVotingPower().toFixed(2,0)
			},

			getEventType(event) {
				if(event.type.startsWith('0x65fc3873'))
					return 'create_lock'
				if(event.type.startsWith('0x4957677c'))
					return 'increase_amount'
				if(event.type.startsWith('increase_unlock_time'))
					return 'increase_unlock_time'
			},

			lockButton(period, type) {
				//0 increase lock
				//1 create lock

				let start = this.lockTime
				let newtime = this.lockTime + 604800 + period

				this.increaseLock = new Date(newtime * 1000)
			}

		},

		beforeDestroy() {
			this.interval && clearIntervalAsync(this.interval)
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	.depositinputs >>>input {
		width: 6em;
	}
	.maxbalance {
		margin-left: 1em;
		cursor: pointer;
	}
	.maxbalance:hover {
		text-decoration: underline;
	}
	.vdp-datepicker {
		display: inline-block;
	}
	button {
		margin-top: 0.8em;
	}
	.depositinputs label {
		margin-right: 0.4em;
	}
	.depositinputs input.invalid {
		background: red;
	}
	.modal-content .content {
		color: black;
	}
	.lockchart {
		margin-top: 1em;
	}
	.increaseLockButtons button {
		margin-right: 0.6em;
	}
</style>