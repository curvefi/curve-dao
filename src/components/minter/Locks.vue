<template>
	<div class='window white'>
		<fieldset>
			<legend>CRV user vote-locks</legend>
			<div class='totalCRVlocked'>
				Total <img class='icon small' :src="publicPath + 'logo.png'"> CRV vote-locked: 
				<span :class="{'loading line': CRVLocked === null}"></span> <span v-show='CRVLocked > 0'> {{ CRVLockedFormat }} </span>
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
					</tr>
				</thead>
				<tbody>
					<tr v-show='locks.length == 0'>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
					</tr>
					<tr v-for='lock in filteredLocks'>
						<td>
							<a :href="'https://etherscan.io/address/' + lock.startTx" rel='noopener noreferrer'>
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
				        pointFormat: '{series.name}: <b>{point.y:.1f}%</b>'
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
			}

		},

		mounted() {
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
		  	return (this.CRVLocked / 1e18).toFixed(2)
		  },
		  canCreateVotes() {
		  	return this.locks.filter(lock => this.veCRV(lock) >= 2500)
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

				while(this.piechart.series[0])
					this.piechart.series[0].remove()

				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-votingescrow-mainnet')
				if(this.block === null)
					this.block = await web3.eth.getBlockNumber() - 2
				this.block = +this.block
				let QUERY = gql`
					query($block: Int!) {
						crvlockeds(block: { number: $block }) {
							id
							CRV
						}
						userBalances(orderBy: weight, orderDirection: desc, first: 1000, block: { number: $block}) {
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
				let results = await wrapper.performQuery(QUERY, { block: this.block })

				this.locks = results.data.userBalances.sort((a, b) => this.veCRV(b) - this.veCRV(a))
				this.CRVLocked = results.data.crvlockeds[0].CRV

				this.changePagination()

				console.log(results)

				let veCRVtotal = this.locks.reduce((a, b) => {
					return +a + +this.veCRV(b)
				}, 0)

				let piedata = this.locks.map(lock => ({
					name: lock.user,
					y: this.veCRV(lock) / veCRVtotal * 100
				}))

				let highest = piedata.map(data=>data.y).indexOf(Math.max(...piedata.map(data => data.y)))
				piedata[highest].sliced = true;
				piedata[highest].selected = true;

				this.piechart.addSeries({
					name: 'veCRV distribution',
					data: piedata.filter(v => v.y > 1)
				})

				this.piechart.hideLoading()
			},

			async timeTravelChart() {
				console.log(this.charttimestamp, "CHART TIME")
				let timestamp = (Date.parse(this.charttimestamp) / 1000) | 0
				console.log(timestamp)

				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks')

				let QUERY = `
					{
					  blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: {timestamp_gt: "${timestamp}"}) {
					    id
					    number
					    timestamp
					  }
					}
				`

				let results = await wrapper.performQuery(QUERY)
				let block = results.data.blocks[0].number
				this.block = block
				this.initChart()

			},

			formatDateToHuman(timestamp) {
				return helpers.formatDateToHuman(timestamp).split(' ')[0]
			},

			shortenAddress(address) {
				if(!address) return ''
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
				this.filteredLocks = this.locks.slice(this.page*this.perPage, this.page*this.perPage + this.perPage)
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