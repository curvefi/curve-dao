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
						You need to checkpoint into {{ gaugesNeedCheckpoint && gaugesNeedCheckpoint.length }} gauges: {{ gaugesNeedCheckpointText }} gauge after locking(after you confirm lock transaction, you'll need to confirm {{ gaugesNeedCheckpoint && gaugesNeedCheckpoint.length }} more)
					</div>
					<div class='content' v-show='showModalType == 0'>
						Confirm creating lock with {{ deposit }} CRV until {{ increaseLockText }}
					</div>
					<div class='content' v-show='showModalType == 1'>
						Confirm adding {{ deposit }} more CRV to your lock ending on {{ lockEndText }}
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
			<div class='totalCRVlocked'>
				Total <img class='icon small' :src="publicPath + 'logo.png'"> CRV vote-locked: 
				<span :class="{'loading line': CRVLocked === null}"></span> <span v-show='CRVLocked > 0'> {{ CRVLockedFormat }} ({{ CRVLockedPercentage }}% of all circulating CRV) </span>
			</div>
			<div class='DAOPower'>
				Total veCRV: <span :class="{'loading line': DAOPower === null}"></span> <span v-show='DAOPower > 0'> {{ DAOPowerFormat }} </span>
			</div>
			<div class='averageLock'>
				Average lock time: <span v-show='CRVLocked !== null'>{{ averageLock }} years</span>
				<span :class="{'loading line': CRVLocked === null}"></span>
			</div>
			<div class='myCRV'>
				<img class='icon small' :src="publicPath + 'logo.png'"> CRV balance: {{ crvBalanceText }}
			</div>
			<div>
				<img class='icon small' :src="publicPath + 'logo.png'"> My CRV Locked: {{ myLockedCRVFormat }}
			</div>
			<div class='veCRVBalance' v-show='hasvecrv'>
				<div>
					Balance in Voting Escrow: {{ vecrvBalanceText }} veCRV
				</div>
				<div>
					<img :src="publicPath + 'lock-solid.svg'" class='icon small'> Locked until: {{ lockTimeText }}
				</div>
			</div>
			<div v-show='showchart'>
				<p>
					<div v-show='hasvecrv'>
						<input id='showend' type='checkbox' v-model='showend'>
						<label for='showend'>Show until end</label>
					</div>

					<div class='chartoptions' v-show='hasvecrv'>
						<input id='showmypower' type='checkbox' v-model='showmypower'>
						<label for='showmypower'>Show my voting power</label>

						<input id='showdaopower' type='checkbox' v-model='showdaopower'>
						<label for='showdaopower'>Show DAO voting power</label>
					</div>
				</p>
				<highcharts v-show='showvelock' :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
			</div>
			<span class='loading matrix' v-show='!loaded'></span>
			<div class='velock' v-show='showvelock && loaded'>
				<div class='increaselock' v-show='hasvecrv'>
					<fieldset class='depositinputs'>
						<label for='deposit'>Increase amount:</label>
						<input id='deposit' type='text' :class = "{'invalid': isInvalidAmount}" v-model='deposit'>
						<span class='maxbalance' @click='setMaxBalance'>Max: {{ crvBalanceText }}</span>
						<br>
						<button @click="confirmModal('increaseAmount')">Add</button>
					</fieldset>
					<fieldset class='depositinputs'>
						<label for='incraselock'>Increase lock:</label>
						<datepicker 
							id='increaselock' 
							name='increaselock' 
							v-model='increaseLock'
							:disabled-dates='disabledDates'
							:open-date='openDate'
						></datepicker>
						<div class='increaseLockButtons'>
							<button v-show='showIncreaseLockButton(604800)' @click='lockButton(604800, 0)'>1 week</button>
							<button v-show='showIncreaseLockButton(2678400)' @click='lockButton(2678400, 0)'>1 month</button>
							<button v-show='showIncreaseLockButton(16070400)' @click='lockButton(16070400, 0)'>6 months</button>
							<button v-show='showIncreaseLockButton(31536000)' @click='lockButton(31536000, 0)'>1 year</button>
							<button v-show='showIncreaseLockButton(126144000)' @click='lockButton(126144000, 0)'>4 years</button>
						</div>
						<br>
						<button @click="confirmModal('submitIncreaseLock')">Increase lock</button>
					</fieldset>
				</div>
				<div class='increaselock' v-show='!hasvecrv'>
					<p class='depositinputs'>
						<label for='deposit'>Amount:</label>
						<input id='deposit' type='text' :class = "{'invalid': isInvalidAmount}" v-model='deposit'>
						<span class='maxbalance' @click='setMaxBalance'>Max: {{ crvBalanceText }}</span>
					</p>
					<p class='depositinputs'>
						<label for='incraselock'>Choose lock time:</label>
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
				<div v-show='hasEndedLock'>
					Your lock ended, you can withdraw your <img class='icon small' :src="publicPath + 'logo.png'"> CRV
					<button @click='withdraw'>Withdraw</button>
				</div>
				<p>
					<input id="inf-approval" type="checkbox" name="inf-approval" v-model='inf_approval'>
	                <label for="inf-approval" class='inf-approval-label'>Infinite approval 
	                	<span class='tooltip'>[?]
	                		<span class='tooltiptext long'>
	                			Preapprove the contract to to be able to spend any amount of your coins. You will not need to approve again.
	                		</span>
	                	</span>
	                </label>
            	</p>
				<p>
					Your starting voting power will be: {{ newVotingPower() }} veCRV
				</p>
				<p class='info-message gentle-message' v-show='newVotingPower() < 2500'>
					You need at least 2500 veCRV to be able to create a vote
				</p>
			</div>
			<gas-price v-show='showchart'></gas-price>
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

	import allabis, { ERC20_abi } from '../../allabis'
	import daoabis from '../dao/allabis'

	import * as veStore from './veStore'

	import * as gasPriceStore from '../common/gasPriceStore'
    import GasPrice from '../common/GasPrice.vue'

	import * as helpers from '../../utils/helpers'

	import BN from 'bignumber.js'

	export default {
		components: {
			Datepicker,
			highcharts: Chart,
			GasPrice,
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
				    	selected: 6,
				    },
				    xAxis: {
				    	//ordinal: false,
				    	//type: 'datetime',
		            	labels: {	
			            	style: {
			            		color: 'black'
			            	},
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
							  forced: true,
							  units: [
							  	['day', null],
							  	// ['hour', [1]],
							   //  ['week', [1,2,3,4,5,6,7,8,9,10]],
							  	// ['month', [1,2,3,4,5,6,7,8]],
							  	// ['year', [1,2,3]],
							  ]
							},
							events: {
								legendItemClick: (function(self) {
									return function() {
										if(this.name == 'DAO Voting Power')
											self.showdaopower = !this.visible
										if(this.name == 'My Voting Power')
											self.showmypower = !this.visible
									}
								})(this)
							}
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

				inf_approval: true,

				CRVLocked: null,

				myLockedCRV: null,

				lockEnd: null,

				DAOPower: null,

				CRVLockedPercentage: null,

			}

		},

		async created() {
			this.$watch(() => contract.initializedContracts, (val, oldval) => {
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
				this.chart.update({
					plotOptions: {
						series: {
							dataGrouping: {
								forced: false,
							}
						}
					}
				})
				this.chart.series[0][toggle]()
			},
			showdaopower(val) {
				let toggle = 'show'
				if(!val) toggle = 'hide'
				if(toggle == 'show') {
					this.chart.xAxis[0].update({
						ordinal: true,
					})
					this.chart.update({
						plotOptions: {
							series: {
								dataGrouping: {
									forced: true,
								}
							}
						}
					})
				}
				else {
					this.chart.update({
						plotOptions: {
							series: {
								dataGrouping: {
									forced: false,
								}
							}
						}
					})
				}
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
				return helpers.formatDateToHuman(Date.parse(this.increaseLock) / 1000).split(' ')[0]
			},
			lockEndText() {
				return helpers.formatDateToHuman(this.lockEnd).split(' ')[0]
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
			gasPrice() {
                return gasPriceStore.state.gasPrice
            },
            gasPriceWei() {
                return gasPriceStore.state.gasPriceWei
            },
            CRVLockedFormat() {
            	return helpers.formatNumber(this.CRVLocked / 1e18)
            },
            DAOPowerFormat() {
            	return helpers.formatNumber(this.DAOPower / 1e18)
            },
            myLockedCRVFormat() {
            	return helpers.formatNumber(this.myLockedCRV / 1e18)
            },
            hasEndedLock() {
            	return this.lockEnd > 0 && Date.now() / 1000 > this.lockEnd
            },
            averageLock() {
            	return (4 * this.DAOPower / this.CRVLocked).toFixed(2)
            },
		},

		methods: {
			async mounted() {
				this.chart = this.$refs.highcharts.chart
				this.chart.showLoading()

				let CRV = new web3.eth.Contract(ERC20_abi, daoabis.CRV_address)

				let allowance = BN(await CRV.methods.allowance(contract.default_account, daoabis.votingescrow_address).call())

				if(allowance.lte(contract.max_allowance.div(BN(2))))
					this.inf_approval = false

				await this.loadBalances()
				this.loadChart()

			},

			async loadBalances() {
				this.votingEscrow = new web3.eth.Contract(daoabis.votingescrow_abi, '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2')
				this.CRV = new web3.eth.Contract(daoabis.CRV_abi, '0xD533a949740bb3306d119CC777fa900bA034cd52')

				window.votingEscrow = this.votingEscrow
				window.CRV = this.CRV


				let calls = [
					[this.votingEscrow._address, this.votingEscrow.methods.balanceOf(getters.default_account()).encodeABI()],
					[this.votingEscrow._address, this.votingEscrow.methods.locked__end(getters.default_account()).encodeABI()],
					[this.CRV._address, this.CRV.methods.balanceOf(getters.default_account()).encodeABI()],
				]
				//console.log(calls, "THE CALLS")
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				this.vecrvBalance = BN(decoded[0])
				this.lockTime = +decoded[1]
				this.lockEnd = +decoded[1]
				this.loaded = true
				//console.log(this.lockEnd, "LOCK END")
				this.increaseLock = new Date((this.lockTime + 604800)* 1000)
				if(this.lockTime == 0) {
					this.lockTime = Date.now() / 1000
					this.increaseLock = new Date(Date.now() + 604800 * 1000)
				}
				if(Date.parse(this.increaseLock) > Date.now() + 126144000 * 1000) {
					this.increaseLock = new Date()
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

				//console.log("LOAD CHART")

				this.wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-votingescrow-mainnet')
				let QUERY = gql`
					{
						votingEscrows(where: { provider: "${getters.default_account().toLowerCase()}" }, orderBy: timestamp, orderDirection: asc) {
							id
							provider
							value
							locktime
							type
							totalPower
							timestamp
						}
						daopowers(orderBy: block, orderDirection: asc) {
						    id
						    block
						    timestamp
						    totalPower
						  }
						lastDAOPower: daopowers(orderBy: timestamp, orderDirection: desc, first: 1) {
							totalPower
						}
						votingPower(id: "${contract.default_account.toLowerCase()}") {
							power
						}
						lastUnlockTime: userBalances(orderBy: unlock_time, orderDirection: desc, first: 1) {
						    unlock_time
					  	}
					}
				`


				let results = await this.wrapper.performQuery(QUERY)
				//console.log(results, "THE RESULTS")
				let events = results.data.votingEscrows
				let CRVstats = await fetch(`https://pushservice.curve.fi/crv/circulating_supply`)
				CRVstats = await CRVstats.json()

				this.CRVLocked = CRVstats.CRVLocked
				this.CRVLockedPercentage = (CRVstats.CRVLocked * 100 / CRVstats.supply).toFixed(2)
				this.DAOPower = results.data.lastDAOPower[0].totalPower
				let lastUnlockTime = results.data.lastUnlockTime[0].unlock_time
				if(results.data.votingPower)
					this.myLockedCRV = results.data.votingPower.power
				if(this.showvelock && this.showchart) {
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

					let daopower = results.data.daopowers


					let daopowerdata = daopower.map(e => [e.timestamp * 1000, e.totalPower / 1e18])

					let now = (Date.now() / 1000) | 0
					let lastUnlockTimeDiff = lastUnlockTime - now
					let calls = []
					let i = 0
					while(now < lastUnlockTime) {
						calls.push([this.votingEscrow._address, this.votingEscrow.methods.totalSupply(now).encodeABI()])
						now += i ** 4 * 86400
						i++
					}
					calls.push([this.votingEscrow._address, this.votingEscrow.methods.totalSupply(lastUnlockTime).encodeABI()])
					let aggcalls = await contract.multicall.methods.aggregate(calls).call()
					let decoded = aggcalls[1].map((hex, i) => [+('0x'+calls[i][1].slice(10)) * 1000, web3.eth.abi.decodeParameter('uint256', hex) / 1e18])

					daopowerdata.push(...decoded)
					this.daopowerdata = daopowerdata
					this.chart.addSeries({
						name: 'DAO Voting Power',
						data: daopowerdata,
						color: '#0b0a57',
					})

					if(this.myLockedCRV > 0) {
						this.chart.series[1].hide()

						this.chart.update({
							plotOptions: {
								series: {
									dataGrouping: {
										forced: false,
									}
								}
							}
						})
					}

					this.chart.hideLoading()
				}
			},

			interpolateVotingPower(chartData) {
				let origEvents = this.events.slice()
				//console.log(origEvents, "ORIG EVENTS")
				let newChartData = []
				//console.log(chartData.slice(), "CHARTDATA LENGTH")
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
							//console.log(origEvents[j-1].totalPower, i, "TOTAL POWER")
							let currentTimestamp = startTimestamp + i * (diff / numPoints)
							//console.log(amountLocked, currentTimestamp, this.events[j-1].locktime * 1000, "AMOUNTS")
							let amount = this.calcVotingPower(amountLocked, currentTimestamp, this.events[j-1].locktime * 1000)
							//console.log(amount, "THE AMOUNT")
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
				this.showdaopower = false
				let chartData = this.chartData.slice()
				if(!this.showend) {
					chartData = chartData.slice(0, chartData.length - 11)
					this.chart.xAxis[0].update({
						ordinal: true,
					})
				}
				this.chart.series[0].setData(chartData, true, false)
				if(this.showend) {
					this.chart.rangeSelector.clickButton(6, false, false)
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

				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-gauges-mainnet')
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
						//console.log(v.gauge, gaugesNeedCheckpoint[v.gauge.toLowerCase()].toString(), v.originalBalance.toString(), "BALANCE NOW", "ORIGINAL BALANCE")
						gaugesNeedCheckpoint[v.gauge.toLowerCase()] = gaugesNeedCheckpoint[v.gauge.toLowerCase()].minus(BN(v.originalBalance))
					})
				}

				gaugesNeedCheckpoint = Object.keys(gaugesNeedCheckpoint).filter(k => gaugesNeedCheckpoint[k].gt(0))

				//console.log(gaugesNeedCheckpoint, "GAUGES NEED CHECKPOINT")

				this.gaugesNeedCheckpoint = gaugesNeedCheckpoint



				if(doCheckpoint) {

					for(let gauge of gaugesNeedCheckpoint) {
						//console.log(gauge, this.gaugesNames)
						let gaugeContract = new web3.eth.Contract(daoabis.liquiditygauge_abi, gauge)
						let gaugeAddress = Object.keys(this.gaugesNames).find(address => address.toLowerCase() == gauge.toLowerCase())
						let { dismiss } = notifyNotification(`Please confirm checkpointing from ${this.gaugesNames[gaugeAddress]} gauge`)
						await new Promise((resolve, reject) => {
							gaugeContract.methods.user_checkpoint(contract.default_account).send({
								from: contract.default_account,
								gasPrice: this.gasPriceWei,
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
				this.showConfirmMessage = true;

				let deposit = BN(this.deposit).times(1e18)
				if(deposit.gt(this.crvBalance))
					deposit = this.crvBalance
				await common.approveAmount(this.CRV, deposit, getters.default_account(), this.votingEscrow._address, this.inf_approval)
				var { dismiss } = notifyNotification(`Please confirm increasing amount of lock`)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_amount(deposit.toFixed(0,1)).send({
							from: getters.default_account(),
							gasPrice: this.gasPriceWei,
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
				await this.checkpoint(true)
				this.showConfirmMessage = false
				this.showModal = false
			},

			async submitIncreaseLock() {
				this.showConfirmMessage = true;

				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				var { dismiss } = notifyNotification('Please confirm increasing lock time')
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_unlock_time(lockTime).send({
							from: getters.default_account(),
							gasPrice: this.gasPriceWei,
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
				await this.checkpoint(true)
				this.showConfirmMessage = false
				this.showModal = false
			},

			async createLock() {
				this.showConfirmMessage = true;

				let deposit = BN(this.deposit).times(1e18)
				if(deposit.gt(this.crvBalance))
					deposit = this.crvBalance
				await common.approveAmount(this.CRV, deposit, getters.default_account(), this.votingEscrow._address, this.inf_approval)
				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				var { dismiss } = notifyNotification('Please confirm creating lock')
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.create_lock(deposit.toFixed(0,1), lockTime).send({
							from: getters.default_account(),
							gasPrice: this.gasPriceWei,
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
				await this.checkpoint(true)
				this.showConfirmMessage = false
				this.showModal = false
			},

			async withdraw() {
				var { dismiss } = notifyNotification('Please confirm withdrawing expired lock tokens')
				await new Promise((resolve, reject) => {
					this.votingEscrow.methods.withdraw().send({
						from: contract.default_account,
						gasPrice: this.gasPriceWei,
						gas: 400000,
					})
					.once('transactionHash', hash => {
						dismiss()
						notifyHandler(hash)
						resolve()
					})
					.on('error', err => reject(err))
				})
				this.checkpoint(true)
			},

			async confirmModal(method) {
				this.method = method
				if(method == 'createLock')
					this.showModalType = 0
				if(method == 'increaseAmount')
					this.showModalType = 1
				if(method == 'submitIncreaseLock')
					this.showModalType = 2
				try {
					await this.checkpoint()
				}
				catch(err) {
					console.error(err)
				}
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
			},

			showIncreaseLockButton(time) {
				let time1 = this.lockEnd + time
				let time2 = (Date.now() / 1000) + 126144000
				return time1 < time2
			},

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
	.increaseLockButtons ~ button {
		margin-top: 0;
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
	.myCRV, .veCRVBalance {
		margin-top: 1em;
	}
	fieldset.depositinputs {
		margin-top: 1em;
	}
</style>