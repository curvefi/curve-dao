<template>
	<div class='window white'>

		<div id='modal' class='modal rootmodal' v-if='showModal' @click.self='hideModal'>

			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideModal'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Vote history</legend>
					<div class='content'>
						<div>
							<proposed-gauge-weight :future_weights='historic_gauge_weights' :ismodal='true'></proposed-gauge-weight>
						</div>
					</div>
					<button @click='hideModal'>Hide</button>
				</fieldset>
			</div>
		</div>

		<fieldset>
			<legend>
				Gauge Weight Voting
				<countdown :vote='vote'></countdown>
			</legend>
			<p class='info-message gentle-message'>
				You can vote for gauge weight with your veCRV tokens(locked CRV tokens in <router-link to="/locker">Locker</router-link>). Gauge weights are used to determine how much CRV does each pool get
			</p>
			<p class='info-message gentle-message' v-show='+balance == 0'>
				You need to have CRV locked in <router-link to="/locker">Locker</router-link> in order to vote for gauge weights
			</p>
			<p class='info-message gentle-message' v-show='lockExpiresSoon'>
				Your lock expires soon. You need to lock at least for a week in <router-link to="/locker">Locker</router-link>
			</p>
			<p class='info-message gentle-message' v-show='voteIsOften'>
				You can vote only once in 10 days
			</p>
			<p class='info-message gentle-message' v-show='tooMuchPower'>
				You alrady used too much power for this gauge
			</p>
			<gauge-stats class='gaugeStats' :included='true'></gauge-stats>
			<p class='info-message gentle-message' v-show='+balance > 0'>
				You're voting with {{ balanceFormat }} veCRV
			</p>
			<div class='gaugeweight'>
				<div class='input'>
					<select class='tvision' v-model='selectedGauge'>
						<option v-for='(gauge, address) in gaugesNames' :value='address'>
							{{ gauge }} {{ shortenAddress(address) }}
						</option>
					</select>
					<div class='weight'>
						<p v-show='myVoteWeightUsed !== null'>
							Vote weight % used: {{ myVoteWeightUsed && myVoteWeightUsed.toFixed(2) }}%
						</p>
						<label for='weight'>Vote weight: </label>
						<input id='weight' type='text' :class="{'invalid': isInvalidWeight}" v-model='weight'>
						<span> %(of your voting power)</span>
						<div class='allocationInfo'> {{ weightAllocated }} ({{ weight }} %) of your voting power will be allocated to this gauge</div>
					</div>
				</div>

				<gas-price></gas-price>

				<p class='info-message gentle-message' v-show='message'>
					{{ message }}
				</p>

				<div>
					<button :disabled='disabled' @click='calculate'>Calculate <span :class="{'loading line': isCalculating}"></span></button>
					<button :disabled='disabled' @click='submit' class='submitVote'>Submit</button>
				</div>

				<div v-show='outcomeWeights.length'>
					<p>
						<img class='icon small' :src="publicPath + 'logo.png'"> CRV APY change: 
						<span class='greentext'> {{ oldAPY && oldAPY.toFixed(2) }}% → {{ newAPY && newAPY.toFixed(2) }}% </span>
					</p>
					<highcharts class='outcomeCharts' :options='piechartdata' ref='piecharts'></highcharts>
				</div>
			</div>

		</fieldset>

		<fieldset class='votehistory'>
			<legend>Weight Voting History</legend>
			<div class='veCRVvotestats'>
				<p>
					Voted this week: {{ totalveCRVvoteFormat }} veCRV
				</p>
				<p>
					Total veCRV: {{ totalveCRVFormat }}
				</p>
				<p v-show='!showvotes'>
					{{ (totalveCRVvote * 100 / totalveCRV).toFixed(2) }} % of veCRV supply voted
				</p>
			</div>


			<button @click='showMyVotes' v-show='!showvotes'>Show my votes</button>
			<button @click='showvotes=false;getVotes()' v-show='showvotes'>Show all votes</button>

			<table class='tui-table'>
				<thead>
					<tr>
						<th>Voter</th>
						<th>veCRV</th>
						<th>Total veCRV</th>
						<th>Gauge</th>
						<th>Weight</th>
						<th>Total weight</th>
						<th><img class='icon small' :src="publicPath + 'chart-pie-solid.svg'"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-show='!filteredVotes.length'>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
						<td><span class='loading line'></span></td>
					</tr>
					<tr v-for='vote in filteredVotes'>
						<td>
							<a :href="'https://etherscan.io/address/' + vote.user" rel='noopener noreferrer'>
								{{ shortenAddress(vote.user) }}
							</a>
						</td>
						<td>
							{{ (vote.veCRV / 1e18).toFixed(2) }}
						</td>
						<td>
							{{ formatNumber(vote.totalveCRV / 1e18) }}
						</td>
						<td>
							<a :href="'https://etherscan.io/address/' + vote.gauge" rel='noopener noreferrer'>
								{{ getGaugeAddress(vote.gauge) }}
							</a>
						</td>
						<td>
							<a :href="'https://etherscan.io/tx/' + vote.id" rel='noopener noreferrer'>
								{{ vote.weight / 100 }}%
							</a>
						</td>
						<td>
							{{ (vote.total_weight / 1e36).toFixed(2) }}
						</td>
						<td>
							<img class='icon small piecharticon' @click='showHistoricWeights(vote)' :src="publicPath + 'chart-pie-solid.svg'">
						</td>
					</tr>
				</tbody>
			</table>

			<div v-show='filteredVotes.length > 0' class='pagination'>
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
	import { contract, getters } from '../../../contract'

	import gql from 'graphql-tag'
	import { GraphQLWrapper } from '@aragon/connect-thegraph'

	import { notify, notifyHandler, notifyNotification } from '../../../init'

	import daoabis from '../../dao/allabis'

	import * as gasPriceStore from '../../common/gasPriceStore'
    import GasPrice from '../../common/GasPrice.vue'

	import * as helpers from '../../../utils/helpers'
	import BN from 'bignumber.js'

	const WEEK = 604800

	const WEIGHT_VOTE_DELAY = 10 * 86400

	import GaugeStats from './GaugeStats.vue'

	import Countdown from '../common/Countdown.vue'

	import * as statsStore from './statsStore'

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

	import ProposedGaugeWeight from './ProposedGaugeWeight.vue'

	export default {
		components: {
			GasPrice,
			GaugeStats,
			Countdown,
			ProposedGaugeWeight,
			Highcharts: Chart,
		},

		data: () => ({
			votingEscrow: null,
			gaugeController: null,

			gaugesNames: {
			  "0x0000000000000000000000000000000000000000": 'Select a gauge',
			  "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575": 'compound',
			  "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53": 'usdt',
			  "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1": 'y',
			  "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840": 'busd',
			  "0x64E3C23bfc40722d3B649844055F1D51c1ac041d": 'pax',
			  "0xB1F2cdeC61db658F091671F5f199635aEF202CAC": 'ren',
			  "0xA90996896660DEcC6E997655E065b23788857849": 'susdv2',
			  "0x705350c4BcD35c9441419DdD5d2f097d7a55410F": 'sbtc',
			},
			selectedGauge: "0x0000000000000000000000000000000000000000",
			weight: 1,
			balance: null,
			lock_end: null,
			next_time: null,
			last_user_vote: null,
			old_slope: null,
			power_used: null,

			message: '',

			votes: [],
			filteredVotes: [],

			totalveCRVvote: 0,
			totalveCRV: 0,

			page: 0,
			perPage: 10,
			perPageOptions: [10, 20, 30, 50, 100],

			showvotes: false,

			historic_gauge_weights: [],

			showModal: false,

			myVoteWeightUsed: null,

			points_sum: [[]],

			piechartdata: {
				chart: {
			        plotBackgroundColor: null,
			        plotBorderWidth: null,
			        plotShadow: false,
			        type: 'pie'
			    },
			    title: {
			        text: 'Calculated outcome of your vote'
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
			                		return `<b>${this.key}</b>: 
			                		(${this.y.toFixed(2)}%)`
			                	}
			                })(this),
			            }
			        }
			    },
			    series: [],
			},

			piechart: null,

			outcomeWeights: [],

			oldAPY: null,

			newAPY: null,

			isCalculating: false,
		}),

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
			async selectedGauge(val, oldval) {
				if(oldval != '0x0000000000000000000000000000000000000000') {
					statsStore.state.calculatedWeights[oldval] = statsStore.state.gaugesWeights[oldval]
				}
				this.outcomeWeights = []
				this.oldAPY = null
				this.newAPY = null

				this.last_user_vote = await this.gaugeController.methods.last_user_vote(contract.default_account, this.selectedGauge).call()
				this.old_slope = await this.gaugeController.methods.vote_user_slopes(contract.default_account, this.selectedGauge).call()
			},
			changePaginationTrigger() {
				this.changePagination()
			},
		},

		computed: {
			lockExpiresSoon() {
				return this.lock_end <= this.next_time
			},
			voteIsOften() {
				return +this.last_user_vote > 0 && +this.last_user_vote + WEIGHT_VOTE_DELAY < Date.now() / 1000
			},
			balanceFormat() {
				return (this.balance / 1e18).toFixed(2)
			},
			isInvalidWeight() {
				return this.weight <= 0 || this.weight > 100 || isNaN(+this.weight)
			},
			weightAllocated() {
				return (this.weight / 100 * this.balance / 1e18).toFixed(8)
			},
			tooMuchPower() {
				if(this.old_slope === null) return false
				let power_used = this.power_used
				power_used = power_used + this.weight * 100 - +this.old_slope.power
				return !(power_used >= 0 || power_used <= 10000)
			},
			gasPrice() {
                return gasPriceStore.state.gasPrice
            },
            gasPriceWei() {
                return gasPriceStore.state.gasPriceWei
            },
            disabled() {
            	return this.selectedGauge == "0x0000000000000000000000000000000000000000"
            },
            pages() {
			  return this.votes.length && Math.ceil(this.votes.length / this.perPage) - 1
		    },
	  		changePaginationTrigger() {
	  		  return this.page, this.perPage, Date.now()
		    },
		    totalveCRVvoteFormat() {
		    	return helpers.formatNumber(this.totalveCRVvote / 1e18)
		    },
		    totalveCRVFormat() {
		    	return helpers.formatNumber(this.totalveCRV / 1e18)
		    },
		    vote() {
		    	return {
		    		voteNumber: 1,
		    		timeLeft: 1599091200 - (Date.now()) / 1000,
		    		executed: false,
		    	}
		    },
		    publicPath() {
                return process.env.BASE_URL
            },
		},

		methods: {
			async mounted() {
				this.votingEscrow = new web3.eth.Contract(daoabis.votingescrow_abi, '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2')
				this.gaugeController = new contract.web3.eth.Contract(daoabis.gaugecontroller_abi, '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB')

				let calls = [
					[this.votingEscrow._address, this.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[this.votingEscrow._address, this.votingEscrow.methods.locked__end(contract.default_account).encodeABI()],
					[this.gaugeController._address, this.gaugeController.methods.vote_user_power(contract.default_account).encodeABI()],
					[this.votingEscrow._address, this.votingEscrow.methods.totalSupply().encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				this.balance = +decoded[0]
				this.lock_end = +decoded[1]
				this.power_used = +decoded[2]
				this.next_time = ((Date.now() / 1000) + WEEK) / WEEK * WEEK
				this.totalveCRV = +decoded[3]

				this.getVotes()

				// let totalSupply = 0

				// let balances = []

				// for(let gauge of Object.keys(this.gaugesNames).slice(1)) {
				// 	console.log(gauge)
				// 	let gaugeContract = new web3.eth.Contract(daoabis.liquiditygauge_abi, gauge)
				// 	let supply = (await gaugeContract.methods.totalSupply().call()) / 1e18
				// 	console.log(this.gaugesNames[gauge])
				// 	if(['ren', 'sbtc'].includes(this.gaugesNames[gauge]))
				// 		supply *= 11459
				// 	console.log(supply)
				// 	totalSupply += +supply
				// 	balances.push(supply)
				// }

				// console.log(balances)
				// console.log(balances.map((v, i) => [this.gaugesNames[Object.keys(this.gaugesNames).slice(1)[i]], v * 10000 / totalSupply]).filter(v => v[0] != 'usdt'))
				// console.log(totalSupply)
			},

			shortenAddress(address) {
				if(!address) return ''
				if(address == "0x0000000000000000000000000000000000000000") return ''
				return address.slice(0,6) + '...' + address.slice(-6)
			},

			async submit() {
				var { dismiss } = notifyNotification(`Please confirm voting for ${this.gaugesNames[this.selectedGauge]} gauge with ${this.weight * 100}`)
				await this.gaugeController.methods.vote_for_gauge_weights(this.selectedGauge, BN(this.weight * 100).toFixed(0,1))
					.send({
						from: contract.default_account,
						gasPrice: this.gasPriceWei,
						gas: 600000,
					})
					.once('transactionHash', hash => {
						dismiss()
						notifyHandler(hash)
						this.message = `You voted for ${this.gaugesNames[this.selectedGauge]} with ${this.weight}%, you can continue and vote for other gauges`
						setTimeout(() => this.message = '', 4000)
					})
			},

			async getVotes(address = null) {
				let wrapper = new GraphQLWrapper('https://api.thegraph.com/subgraphs/name/pengiundev/curve-gaugecontroller-mainnet')

				let QUERY = `
					{
					  gaugeVotes(where: { time_gt: 1598486400 }, orderBy: time, orderDirection: desc) {
					    id
					    time
					    user
					    gauge
					    weight
					    gauge_weights {
					      gauge
					      gauge_weight
					    }
					    total_weight
					    veCRV
					    totalveCRV
					  }
					}
				`

				if(contract.default_account) {
					QUERY = `

						{
						  gaugeVotes(where: { time_gt: 1598486400 }, orderBy: time, orderDirection: desc) {
						    id
						    time
						    user
						    gauge
						    weight
						    gauge_weights {
						      gauge
						      gauge_weight
						    }
						    total_weight
						    veCRV
						    totalveCRV
						  }
						  myVotes: gaugeVotes(where: { user: "${contract.default_account.toLowerCase()}" }, orderBy: time, orderDirection: desc) {
							id
							time
							user
							gauge
							weight
							gauge_weights {
							  gauge
							  gauge_weight
							}
							total_weight
							veCRV
							totalveCRV
						  }
						}

					`
				}

				if(address) {
					QUERY = gql`
						{
						  gaugeVotes(where: { user: "${address.toLowerCase()}" }, orderBy: time, orderDirection: desc) {
						    id
						    time
						    user
						    gauge
						    weight
						    gauge_weights {
						      gauge
						      gauge_weight
						    }
						    total_weight
						    veCRV
						    totalveCRV
						  }
						}
					`
				}

				let results = await wrapper.performQuery(QUERY)
				this.votes = results.data.gaugeVotes
				this.totalveCRVvote = this.votes.filter((v,i,a)=>a.findIndex(t=>(t.user === v.user))===i).reduce((a, b) => +a + +b.veCRV, 0)
				if(results.data.myVotes)
					this.myVoteWeightUsed = results.data.myVotes.reduce((a, b) => +a + +b.weight, 0) / 100
				else
					this.myVoteWeightUsed = results.data.gaugeVotes.reduce((a, b) => +a + +b.weight, 0) / 100
				console.log(results, this.votes.length, "THE RESULTS")
				this.changePagination()
			},

			showMyVotes() {
				this.showvotes = true
				this.getVotes(contract.default_account)
			},

			getGaugeAddress(gauge) {
				return this.gaugesNames[web3.utils.toChecksumAddress(gauge)]
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
				this.filteredVotes = this.votes.slice(this.page*this.perPage, this.page*this.perPage + this.perPage)
			},

			formatNumber(num) {
				return helpers.formatNumber(num)
			},

			hideModal() {
				this.showModal = false
			},

			showHistoricWeights(vote) {
				this.showModal = true

				let total_weight = vote.total_weight

				let future_weights = vote.gauge_weights.map((v, i) => ({ id: this.gaugesNames[web3.utils.toChecksumAddress(v.gauge)], name: this.gaugesNames[web3.utils.toChecksumAddress(v.gauge)], y: +v.gauge_weight * 1e18 * 100 / total_weight}))


				this.historic_gauge_weights = future_weights

			},

			async _get_weight(gauge) {
				let t = await this.gaugeController.methods.time_weight(this.selectedGauge).call()
				let pt = await this.gaugeController.methods.points_weight(this.selectedGauge, t).call()
				//loop is not entered for now
		        for(let i = 0; i < 500; i++) {
		            if(t > Date.now() / 1000)
		                break
		            t += WEEK
		            let d_bias = pt.slope * WEEK
		            if(pt.bias > d_bias) {
		                pt.bias -= d_bias
		                d_slope = await this.gaugeController.methods.changes_sum(0, t).call()
		                pt.slope -= d_slope
		            }
		            else {
		                pt.bias = 0
		                pt.slope = 0
		            }
		            this.points_sum[0][t] = pt
		            // if(t > Date.now() / 1000)
		            //     self.time_sum[gauge_type] = t
		    	}
		        return pt.bias
			},

			async calculate() {
				this.isCalculating = true

				let slope = +(await this.votingEscrow.methods.get_last_user_slope(contract.default_account).call())
				let old_weight_bias = +(await this._get_weight(this.selectedGauge))
				let old_slope = await this.gaugeController.methods.vote_user_slopes(contract.default_account, this.selectedGauge).call()
				let old_dt = 0
				if(+old_slope.end > this.next_time)
					old_dt = +old_slope.end - this.next_time
				let old_bias = +old_slope.slope * old_dt
				let new_slope = slope * this.weight * 100 / 10000
				let new_dt = this.lock_end - this.next_time
				let new_bias = new_slope * new_dt

				let point_bias = Math.max(old_weight_bias + new_bias, old_bias) - old_bias

				statsStore.state.calculatedWeights[web3.utils.toChecksumAddress(this.selectedGauge)] = point_bias

				this.piechart = this.$refs.piecharts.chart
				this.piechart.showLoading()

				let total_outcome_weight = Object.values(statsStore.state.calculatedWeights).reduce((a, b) => +a + +b, 0)

				let outcome_weights = Object.entries(statsStore.state.calculatedWeights).map(([k, v]) => ({id: k, name: statsStore.state.gaugesNames[k], y: v * 100 / total_outcome_weight}))

				this.outcomeWeights = outcome_weights

				while(this.piechart.series[0])
					this.piechart.series[0].remove(false, false)

				this.piechart.addSeries({
					name: 'Calculated outcome weights',
					data: outcome_weights,
				})

				this.piechart.hideLoading()

				let currentWeight = statsStore.state.gaugesWeights[web3.utils.toChecksumAddress(this.selectedGauge)]
				let calculatedWeight = point_bias

				let change = outcome_weights.find(v => v.id.toLowerCase() == this.selectedGauge.toLowerCase()).y / statsStore.state.pieGaugeWeights[web3.utils.toChecksumAddress(this.selectedGauge)]

				this.oldAPY = statsStore.state.currentCRVAPYs[web3.utils.toChecksumAddress(this.selectedGauge)]

				this.newAPY =  this.oldAPY * change

				this.isCalculating = false
			},
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	select.tvision {
		box-shadow: none
	}
	.weight {
		margin-top: 1em;
	}
	.weight input {
		width: 4em;
	}
	.weight input.invalid {
		background: red;
	}
	.allocationInfo {
		margin-top: 1em;
	}
	button {
		margin-top: 1em;
	}
	.gaugeweight {
		margin-top: 1em;
	}
	select option {
		text-align: justify;
	}
	.gaugeStats {
		margin-top: 1em;
	}

	table {
		width: 100%;
		margin-top: 0.4em;
	}
	tbody tr td a {
		display: inline-block;
		min-height: 100%;
		width: 100%;
		font-weight: normal;
	}
	thead tr {
		border-bottom: 1px solid #a8a8a8;
	}
	thead tr th {
		color: #202020;
	}
	tbody tr td {
		padding-top: 10px;
		padding-left: 1em;
		color: black;
	}
	tbody tr td {
		padding-left: 0;
		text-align: center;
	}
	tbody tr td:nth-child(6) a {
		font-weight: normal;
	}

	.pagination {
		margin-top: 1em;
		display: flex;
	}
	select.tvision {
		box-shadow: none;
	}
	.perpage {
		margin-left: 3em;
	}
	.pagination button {
		margin-top: 0;
	}

	.veCRVvotestats p {
		margin-block-start: 0.4em;
		margin-block-end: 0;
	}
	.votehistory {
		margin-top: 1em;
	}
	.piecharticon {
		cursor: pointer;
		filter: invert(44%) sepia(98%) saturate(468%) hue-rotate(6deg) brightness(109%) contrast(102%);
	}

	.modal-content {
		width: 800px;
	}
	.greentext {
		color: green;
	}
	.outcomeCharts {
		margin-top: 1em;
	}
	.submitVote {
		margin-left: 1em;
	}
</style>