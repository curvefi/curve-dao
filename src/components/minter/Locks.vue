<template>
	<div class='window white'>
		<fieldset>
			<legend>CRV user vote-locks</legend>
			<div class='totalCRVlocked'>
				Total <img class='icon small' :src="publicPath + 'logo.png'"> CRV vote-locked: 
				<span :class="{'loading line': CRVLocked === null}"></span> <span v-show='CRVLocked > 0'> {{ CRVLockedFormat }} ({{ CRVLockedPercentage }}% of all circulating CRV) </span>
			</div>
			<div>
				Total veCRV: <span v-show='DAOPower !== null'> {{ DAOPowerFormat }}</span>
				<span :class="{'loading line': DAOPower === null}"></span>
			</div>
			<div>
				Average lock time: <span v-show='DAOPower !== null'> {{ averageLock }} years</span>
				<span :class="{'loading line': DAOPower === null}"></span>
			</div>

			<datetime type='datetime' v-model='charttimestamp' class='datepicker'></datetime>
			<button @click='timeTravelChart'>Submit</button>
			
			<p>
				# of users vote-locked: <span :class="{'loading line': locks.length == 0}"></span> <span v-show='locks.length > 0'> {{ locks.length }} </span>
			</p>
			<p>
				# of users who can create new votes:
				<span class='tooltip'>[?]
					<span class='tooltiptext long'>
						To create a vote you need minimum 2500veCRV
					</span>
				</span>
				<span :class="{'loading line': canCreateVotes.length == 0}"></span> <span v-show='canCreateVotes.length > 0'> {{ canCreateVotes.length }} </span>
			</p>

			<highcharts :options="piechartdata" ref='piecharts'></highcharts>

			<table class='tui-table'>
				<thead>
					<tr>
						<th>Lock start</th>
						<th>Address</th>
						<th><img class='icon small' :src="publicPath + 'logo.png'"> CRV Locked</th>
						<th>Unlock time</th>
						<th>veCRV</th>
						<th>%</th>
					</tr>
				</thead>
				<tbody>
					<tr v-show='locks.length == 0'>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
					</tr>
					<tr v-for='lock in filteredLocks'>
						<td>
							<a :href="'https://etherscan.io/tx/' + lock.startTx" rel='noopener noreferrer'>
								<span v-show='lock.lock_start > 0'>
									{{ formatDateToHuman(lock.lock_start) }}
								</span>
								<span v-show='lock.lock_start == 0'>
									-
								</span>
							</a>
						</td>
						<td>
							<a :href="'https://etherscan.io/address/' + lock.user" rel='noopener noreferrer'>
								{{ shortenAddress(lock.user) }}
							</a>
						</td>
						<td>{{ (lock.CRVLocked / 1e18).toFixed(2) }}</td>
						<td>
							<span v-show='lock.unlock_time > 0'>
								{{ formatDateToHuman(lock.unlock_time) }}
							</span>
							<span v-show='lock.unlock_time == 0'>
								-
							</span>
						</td>
						<td>
							<span v-show='veCRV(lock) > 2500'>
								<span class='tooltip check'>
									<img class='icon small' :src="publicPath + 'vote-yea-solid.svg'">
									<span class='tooltiptext long'>
										Has enough veCRV(>2500) to create a new vote
									</span>
								</span>
							</span>
							<span v-show='veCRV(lock) > 0'>
								{{ veCRV(lock) }}
							</span>
							<span v-show='veCRV(lock) < 0'>
								<img class='icon small' :src="publicPath + 'hourglass-end-solid.svg'"> Expired
							</span>
						</td>
						<td>
							{{ (veCRV(lock) * 100 / veCRVtotal).toFixed(2) }}
						</td>
					</tr>
				</tbody>
			</table>
			<div v-show='locks.length > 0' class='pagination'>
				<div>
					<button class='simplebutton' @click='prev' :disabled='page == 0'>Prev</button>
					<span> {{ page }} (of {{ pages }}) </span>
					<button class='simplebutton' @click='next' :disabled='page == this.pages'>Next</button>
				</div>
				<div class='perpage'>
					Per page:
					<select class='tvision' v-model='perPage'>
						<option v-for='perPageNum in perPageOptions'>
							{{ perPageNum }}
						</option>
					</select>
				</div>

			</div>


		</fieldset>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
	import daoabis from '../dao/allabis'

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

	import 'vue-datetime/dist/vue-datetime.css'
	import { Datetime } from 'vue-datetime';

	import * as helpers from '../../utils/helpers'


	export default {
		components: {
			Highcharts: Chart,
			Datetime,
		},

		data() {
			return {
				locks: [],

				filteredLocks: [],

				CRVLocked: null,

				page: 0,
				perPage: 10,
				perPageOptions: [10, 20, 30, 50, 100],

				piechartdata: {
					chart: {
				        plotBackgroundColor: null,
				        plotBorderWidth: null,
				        plotShadow: false,
				        type: 'pie'
				    },
				    title: {
				        text: 'veCRV distribution'
				    },
				    tooltip: {
				        pointFormat: '{series.name}: <b>{point.y:.2f}%</b>'
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
				            dataLabels: {
				                enabled: true,
				                formatter: (function(self) {
				                	return function(point) { 
				                		return `<b>${self.shortenAddress(this.key)}</b>: 
				                		(${this.y.toFixed(2)}%)`
				                	}
				                })(this),
				            }
				        }
				    },
				    series: [],
				},

				piechart: null,

				block: null,

				charttimestamp: null,

				veCRVtotal: 0,

				CRVLockedPercentage: null,

				DAOPower: null,
			}

		},

		async created() {
			this.$watch(() => contract.web3, (val, oldval) => {
				if(val)
					this.mounted()
			}, {
				immediate: true
			})
		},

		mounted() {
			if(contract.web3)
				this.mounted()
		},

		watch: {
			changePaginationTrigger() {
				this.changePagination()
			},
			charttimestamp() {
				this.timeTravelChart()
			},
		},

		computed: {
		  publicPath() {
	          return process.env.BASE_URL
	      },
		  pages() {
			return this.locks.length && Math.ceil(this.locks.length / this.perPage) - 1
		  },
		  changePaginationTrigger() {
		  	return this.page, this.perPage, Date.now()
		  },
		  CRVLockedFormat() {
		  	return helpers.formatNumber(this.CRVLocked / 1e18)
		  },
		  canCreateVotes() {
		  	return this.locks.filter(lock => this.veCRV(lock) >= 2500)
		  },
		  DAOPowerFormat() {
		  	return helpers.formatNumber(this.DAOPower / 1e18)
		  },
		  averageLock() {
		  	return (4 * this.DAOPower / this.CRVLocked).toFixed(2)
		  },
	  	},

		methods: {
			async mounted() {

				let timestampParam = this.$route.params.timestamp
				if(timestampParam) {
					this.charttimestamp = (new Date(timestampParam * 1000)).toISOString()
					this.timeTravelChart()
				}
				else
					this.initChart()
			},

			async initChart() {
				if(this.block === null)
					this.charttimestamp = (new Date()).toISOString()

				this.piechart = this.$refs.piecharts.chart;
				this.piechart.showLoading()

				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-votingescrow-mainnet')
				if(this.block === null)
					this.block = await contract.web3.eth.getBlockNumber() - 2
				this.block = +this.block
				let QUERY = gql`
					query($block: Int!, $first: Int!, $skip: Int!) {
						userBalances(orderBy: weight, orderDirection: desc, first: $first, skip: $skip, block: { number: $block}) {
						    id
						    startTx
						    user
						    CRVLocked
						    lock_start
						    unlock_time
						    weight
						  }
					}
				`
				let first = 1000
				let skip = 0
				let results
				let locks = []
				while(true) {
					results = await wrapper.performQuery(QUERY, { block: this.block, first: first, skip: skip })
					if(!results.data.userBalances.length) break;
					locks = [...locks, ...results.data.userBalances]
					skip += 1000
				}

				let CRVstats = await fetch(`https://pushservice.curve.fi/crv/circulating_supply`)
				CRVstats = await CRVstats.json()

				this.locks = locks.sort((a, b) => this.veCRV(b) - this.veCRV(a))
				this.CRVLocked = CRVstats.CRVLocked
				this.CRVLockedPercentage = (CRVstats.CRVLocked * 100 / CRVstats.supply).toFixed(2)

				let veCRV = new web3.eth.Contract(daoabis.votingescrow_abi, daoabis.votingescrow_address)
				this.DAOPower = await veCRV.methods.totalSupply().call()

				this.changePagination()

				this.veCRVtotal = this.locks.reduce((a, b) => {
					return +a + +this.veCRV(b)
				}, 0)

				let piedata = this.locks.map(lock => ({
					name: lock.user,
					y: this.veCRV(lock) / this.veCRVtotal * 100
				}))

				let highest = piedata.map(data=>data.y).indexOf(Math.max(...piedata.map(data => data.y)))
				piedata[highest].sliced = true;
				piedata[highest].selected = true;

 				let others = piedata.filter(data => data.y < 0.5)

 				piedata = piedata.filter(data => data.y > 0.5)
 				piedata.push({name: 'Others(<0.5%)', y: others.reduce((a, b) => +a + +b.y, 0)})

 				while(this.piechart.series[0])
					this.piechart.series[0].remove()

				this.piechart.addSeries({
					name: 'veCRV distribution',
					data: piedata
				})

				this.piechart.hideLoading()
			},

			async timeTravelChart() {
				console.log(this.charttimestamp, "CHART TIME")
				let timestamp = (Date.parse(this.charttimestamp) / 1000) | 0
				history.pushState({}, null, '/locks/' + timestamp)
				console.log(timestamp)

				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks')

				let QUERY = `
					{
					  blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: {timestamp_gt: "${timestamp - 1000}"}) {
					    id
					    number
					    timestamp
					  }
					}
				`

				let results = await wrapper.performQuery(QUERY)
				let block = results.data.blocks[results.data.blocks.length - 1].number
				this.block = block
				this.initChart()

			},

			formatDateToHuman(timestamp) {
				return helpers.formatDateToHuman(timestamp).split(' ')[0]
			},

			shortenAddress(address) {
				if(!address) return ''
				if(address == 'Others(<0.5%)') return 'Others(<0.5%)'
				return address.slice(0,6) + '...' + address.slice(-6)
			},

			prev() {
				if(this.page == 0) return;
				this.page -= 1
			},
			next() {
				if(this.page < this.pages)
				this.page += 1
			},
			changePagination() {
				if(this.perPage > this.pages) this.page = 0
				this.filteredLocks = this.locks.slice(this.page*(+this.perPage), this.page*(+this.perPage) + (+this.perPage))
			},
			veCRV(lock) {
		  		return ((lock.CRVLocked * (lock.unlock_time - (Date.now() / 1000) | 0)) / (86400 * 365) / 4 / 1e18).toFixed(2)
		  	},
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	table {
		width: 100%;
		margin-top: 1em;
	}
	tbody tr td a {
		display: inline-block;
		min-height: 100%;
		width: 100%;
		padding-top: 10px;
		font-weight: normal;
	}
	thead tr {
		border-bottom: 1px solid #a8a8a8;
	}
	thead tr th {
		color: #202020;
	}
	tbody tr td {
		padding-left: 1em;
		color: black;
	}
	tbody tr td:nth-child(5) a, tbody tr td:nth-child(6) a {
		font-weight: normal;
	}

	.pagination {
		margin-top: 0.4em;
		display: flex;
	}
	select.tvision {
		box-shadow: none;
	}
	.perpage {
		margin-left: 3em;
	}
	.tooltip.check img {
		filter: invert(10%) sepia(68%) saturate(7256%) hue-rotate(119deg) brightness(101%) contrast(101%);
	}
	.datepicker {
		margin-top: 1em;
		width: 15em;
		display: inline-block;
	}
	.datepicker + button {
		margin-left: 1em;
	}
</style>