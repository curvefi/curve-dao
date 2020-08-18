<template>
	<div :class="{'window white': (showvelock && showchart)}">

		<div id='modal' class='rootmodal modal' v-show='showModal' @click.self='showModal = false'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='showModal = false'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Confirm lock</legend>
					<div class='content' v-show='gaugesNeedCheckpoint && gaugesNeedCheckpoint.length > 0'>
						You need to checkpoint into {{ gaugesNeedCheckpointText }} gauge before locking
					</div>
					<div class='content' v-show='showModalType == 0'>
						Confirm creating lock with {{ deposit }} CRV until {{ increaseLockText }}
					</div>
					<div class='content' v-show='showModalType == 1'>
						Confirm locking {{ deposit }} CRV until {{ increaseLockText }}
					</div>
					<div class='content' v-show='showModalType == 2'>
						Confirm increasing lock time until {{ increaseLockText }}
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
			<div v-show='showchart'>
				<p>
					<input id='showend' type='checkbox' v-model='showend'>
					<label for='showend'>Show until end</label>

					<div class='chartoptions' v-show='hasvecrv'>
						<input id='showmypower' type='checkbox' v-model='showmypower'>
						<label for='showmypower'>Show my voting power</label>

						<input id='showdaopower' type='checkbox' v-model='showdaopower'>
						<label for='showdaopower'>Show DAO voting power</label>
					</div>
				</p>
				<highcharts v-show='showvelock' :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
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
							<button @click='lockButton(604800, 0)'>1 week</button>
							<button @click='lockButton(2678400, 0)'>1 month</button>
							<button @click='lockButton(16070400, 0)'>6 months</button>
							<button @click='lockButton(31536000, 0)'>1 year</button>
							<button @click='lockButton(126144000, 0)'>4 years</button>
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
							<button @click='lockButton(604800, 1)'>1 week</button>
							<button @click='lockButton(2678400, 1)'>1 month</button>
							<button @click='lockButton(16070400, 1)'>6 months</button>
							<button @click='lockButton(31536000, 1)'>1 year</button>
							<button @click='lockButton(126144000, 1)'>4 years</button>
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
    import { notify, notifyHandler, notifyNotification } from '../../init'

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
				showModalType: 0,
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

				daopowerdata: [],

				chartData: [],

				showend: false,

				showmypower: true,
				showdaopower: false,

				gaugesNeedCheckpoint: null,

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
			}

		},

		async created() {
			this.$watch(() => contract.initializedContracts, (val, oldval) => {
				console.log(val, "THE VAL")
			 	if(val) this.mounted()
			})
		},

		async mounted() {
			if(contract.multicall) {
				this.mounted()
			}
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
				return this.deposit <= 0 || BN(this.deposit).gt(this.crvBalance.div(1e18))
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
			gaugesNeedCheckpointText() {
				if(!this.gaugesNeedCheckpoint || this.gaugesNeedCheckpoint.length == 0) return ''
				return Object.keys(this.gaugesNames)
						.filter(gauge => this.gaugesNeedCheckpoint.map(address => address.toLowerCase()).includes(gauge.toLowerCase()))
						.map(gauge => this.gaugesNames[gauge]).join(',')
			},
		},

		methods: {
			async mounted() {
				this.loaded = true
				this.chart = this.$refs.highcharts.chart
				this.chart.showLoading()

				this.loadBalances()
				if(this.showvelock && this.showchart)
					this.loadChart()

			},

			async loadBalances() {
				this.votingEscrow = new web3.eth.Contract(daoabis.votingescrow_abi, '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2')
				this.CRV = new web3.eth.Contract(daoabis.CRV_abi, '0xD533a949740bb3306d119CC777fa900bA034cd52')


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

				while(this.chart.series[0])
					this.chart.series[0].remove()

				console.log("LOAD CHART")

				this.wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-votingescrow-mainnet')
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
				if(events.length) {
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
				}

				let daopower = results[1].data.daopowers


				let daopowerdata = daopower.map(e => [e.timestamp * 1000, e.totalPower / 1e18])

				let now = (Date.now() / 1000) | 0
				let calls = Array.from(Array(10), (_, i) => [this.votingEscrow._address, this.votingEscrow.methods.totalSupply(now + i**4*86400).encodeABI()])
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map((hex, i) => [(now + i*10*86400) * 1000, web3.eth.abi.decodeParameter('uint256', hex) / 1e18])

				daopowerdata.push(...decoded)
				this.daopowerdata = daopowerdata
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

			async checkpoint(doCheckpoint = false) {
				let gauges = [
				  "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575",
				  "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53",
				  "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1",
				  "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840",
				  "0x64E3C23bfc40722d3B649844055F1D51c1ac041d",
				  "0xB1F2cdeC61db658F091671F5f199635aEF202CAC",
				  "0xA90996896660DEcC6E997655E065b23788857849",
				  "0x705350c4BcD35c9441419DdD5d2f097d7a55410F"
				]

				let balanceOfCall = '0x70a08231000000000000000000000000'

				let balancesCalls = gauges.map(gauge => [gauge, balanceOfCall + contract.default_account.slice(2)])
				let aggBalancesCalls = await contract.multicall.methods.aggregate(balancesCalls).call()
				let decodedBalances = aggBalancesCalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))

				let gaugesNeedCheckpoint = {}
				decodedBalances.forEach((balance, i) => gaugesNeedCheckpoint[gauges[i].toLowerCase()] = BN(balance))

				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/id/QmbcwNZfcCC3XDRwJmc9s1d6cED8sBUh2UNDnEpSGLPnNM')
				let QUERY = gql`
					{
						gauges(where: { user: "${contract.default_account}" }) {
							id
							user
							gauge
							originalBalance
						}
					}
				`

				let results = await wrapper.performQuery(QUERY)
				let lastCheckpointed = results.data.gauges

				if(lastCheckpointed.length) {
					lastCheckpointed.forEach(v => {
						console.log(v.gauge, gaugesNeedCheckpoint[v.gauge.toLowerCase()].toString(), v.originalBalance.toString(), "BALANCE NOW", "ORIGINAL BALANCE")
						gaugesNeedCheckpoint[v.gauge.toLowerCase()] = gaugesNeedCheckpoint[v.gauge.toLowerCase()].minus(BN(v.originalBalance))
					})
				}

				gaugesNeedCheckpoint = Object.keys(gaugesNeedCheckpoint).filter(k => gaugesNeedCheckpoint[k].gt(0))

				console.log(gaugesNeedCheckpoint, "GAUGES NEED CHECKPOINT")

				this.gaugesNeedCheckpoint = gaugesNeedCheckpoint



				if(doCheckpoint) {

					for(let gauge of gaugesNeedCheckpoint) {
						console.log(gauge, this.gaugesNames)
						let gaugeContract = new web3.eth.Contract(daoabis.liquiditygauge_abi, gauge)
						let gaugeAddress = Object.keys(this.gaugesNames).find(address => address.toLowerCase() == gauge.toLowerCase())
						let { dismiss } = notifyNotification(`Please confirm checkpointing from ${this.gaugesNames[gaugeAddress]} gauge`)
						await new Promise((resolve, reject) => {
							gaugeContract.methods.user_checkpoint(contract.default_account).send({
								from: contract.default_account,
								gas: 400000,
							})
							.once('transactionHash', hash => {
								resolve()
								dismiss()
								notifyHandler(hash)
							})
						})
					}
				}
			},

			async increaseAmount() {
				await this.checkpoint(true)
				this.showConfirmMessage = true;

				let deposit = BN(this.deposit).times(1e18)
				if(deposit.gt(this.crvBalance))
					deposit = this.crvBalance
				await common.approveAmount(this.CRV, deposit, getters.default_account(), this.votingEscrow._address)
				var { dismiss } = notifyNotification(`Please confirm increasing amount of lock`)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_amount(deposit.toFixed(0,1)).send({
							from: getters.default_account(),
							gas: 600000,
						})
						.once('transactionHash', hash => {
							resolve()
							dismiss()
							notifyHandler(hash)
						})
						.on('error', err => reject(err))
						.on('receipt', receipt => {
							this.mounted()
						})
				})
				this.showConfirmMessage = false
				this.showModal = false
			},

			async submitIncreaseLock() {
				await this.checkpoint(true)
				this.showConfirmMessage = true;

				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				var { dismiss } = notifyNotification('Please confirm increasing lock time')
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_unlock_time(lockTime).send({
							from: getters.default_account(),
							gas: 600000,
						})
						.once('transactionHash', hash => {
							resolve()
							dismiss()
							notifyHandler(hash)
						})
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
				await this.checkpoint(true)
				await common.approveAmount(this.CRV, deposit, getters.default_account(), this.votingEscrow._address)
				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				var { dismiss } = notifyNotification('Please confirm creating lock')
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.create_lock(deposit.toFixed(0,1), lockTime).send({
							from: getters.default_account(),
							gas: 600000,
						})
						.once('transactionHash', hash => {
							resolve()
							dismiss()
							notifyHandler(hash)
						})
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
				if(method == 'createLock')
					this.showModalType = 0
				if(method == 'increaseAmount')
					this.showModalType = 1
				if(method == 'submitIncreaseLock')
					this.showModalType = 2
				await this.checkpoint()
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
				let newtime = this.lockTime + period

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