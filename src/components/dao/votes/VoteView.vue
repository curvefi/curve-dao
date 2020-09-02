<template>
	<div class='window white vote'>
		<div id='modal' class='modal rootmodal' v-if='showRootModal' @click.self='hideRootModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideRootModal'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Vote on {{ appName }}</legend>
					<div class='content'>
						<div>
							<span> {{ voteDescription }} </span>
							<div class='content' v-if='vote'>
								<span v-show='vote.contractName'>
									{{ vote.contractName }}: <span v-html='vote.description'></span>
								</span>
								<span v-show='!vote.contractName && vote.metadata'>
									{{ vote.metadata }}
								</span>
								<span v-show='!vote.contractName && vote.description'>
									<span v-html='vote.description'></span>
								</span>
							</div>
						</div>
						<hr>
						<p class='explanation'>
							This vote requires {{ getSupportText }}% acceptance and {{ getQuorumText }}% quorum to be passed
						</p>
						<p class='simple-error' v-show='!willSucceed'>
							The transaction may fail, you may not have the required permissions to make the transaction
						</p>
					</div>
					<button @click='createVote'>Vote {{ votetypeText }} </button>
				</fieldset>
			</div>
		</div>

		<router-link to='/dao'>← Back</router-link>

		<span class='loading matrix' v-show='!vote.id'></span>

		<div class='flexbreak'></div>

		<div class='voteview'>
			<fieldset v-show='vote.id'>
				<legend>
					Vote info
				</legend>
				<div v-show='vote && vote.id' class='voteinfo'>
					<div class='title'>
						<div>	
							{{ vote.votingAppName }} ({{getSupportRequiredPct}}% / {{ getMinAcceptQuorum }}%)
						</div>
						<div class='votenum'>
							<b> Vote #{{ vote.voteCountSeq }} </b>
						</div> 
					</div>
					<div class='description'>
						<div> 
							<b>Description:</b> 
						</div>
						<div class='content'>
							<span v-show='vote.contractName'>
								{{ vote.contractName }}: <span v-html='vote.description'></span>
								<div>
									<div v-show='formattedMetadata && formattedMetadata.length' class='descriptionText'>
										<b> Description text: </b>
									</div>
									<p v-show='!showMore'>
										{{ formattedMetadata }}
									</p>
									<div v-show = 'formattedMetadata && vote.metadata.length > formattedMetadata.length'>
										<p v-show='showMore'>
											{{ vote.metadata }}
										</p>
										<button class='simplebutton showmore' @click='showMore = !showMore'>{{ showMore ? 'Hide' : 'Show more' }}</button>
									</div>
								</div>
							</span>
							<div v-show='!vote.contractName && vote.metadata'>
								<p v-show='!showMore'>
									{{ formattedMetadata }}
								</p>
								<div v-show = 'formattedMetadata && vote.metadata.length > formattedMetadata.length'>
									<p v-show='showMore'>
										{{ vote.metadata }}
									</p>
									<button class='simplebutton showmore' @click='showMore = !showMore'>{{ showMore ? 'Hide' : 'Show more' }}</button>
								</div>
							</div>
							<span v-show='!vote.contractName && vote.description'>
								<span v-html='vote.description'></span>
							</span>
							<div v-show='vote.voteCountSeq == 3' class='discusson'>
								<a href='https://gov.curve.fi/t/add-smartwalletwhitelist-with-dao-maintained-whitelist/25' rel='noopener noreferrer'>
									Discuss on gov.curve.fi
								</a>
							</div>
							<div v-show='vote.voteCountSeq == 5' class='discusson'>
								<a href='https://gov.curve.fi/t/cip-5-add-hbtc-wbtc-pool-and-a-liquidity-gauge-for-that-pool/162' rel='noopener noreferrer'>
									Discuss on gov.curve.fi
								</a>
							</div>
						</div>

					</div>
					<div class='creator'>
						<b>Proposed by:</b> <a :href="'https://etherscan.io/address/'+vote.creator">{{ shortenAddress(vote.creator) }}</a>
					</div>
					<div class='executedtx' v-show='vote.transactionHash !== null'>
						<b>Executed:</b> <a :href="'https://etherscan.io/tx/'+vote.transactionHash">{{ shortenAddress(vote.transactionHash) }}</a>
					</div>
					<div class='votes'>
						<b>Votes:</b>
						<div class="tui-progress-bar">
							<span class='yestext'>Yes:</span>
						    <span class="tui-progress-label">{{ vote.yeap }}%</span>
						    <span class="tui-progress yes" :style="{width: vote.yeap + '%'}"></span>
						</div>
						<div>
							{{ yeas }}
							<span v-show='vote.mycasts && vote.mycasts.length && vote.mycasts[0].supports == true'>
								({{voterStake}})
							</span>
						</div>
						<div class="tui-progress-bar">
							<span class='notext'>No:</span>
						    <span class="tui-progress-label">{{ vote.nop }}%</span>
						    <span class="tui-progress no" :style="{width: vote.nop + '%'}"></span>
						</div>
						<div>
							{{ nays }}
							<span v-show='vote.mycasts && vote.mycasts.length && vote.mycasts[0].supports == false'>
								({{voterStake}})
							</span>
						</div>
						<div class='totalvotes'>
							Total votes: {{ vote.castCount }}
						</div>

						<div class='voteDistributionLink'>
							<router-link :to="'/locks/' + vote.startDate">
								Vote distribution at snapshot chart
							</router-link>
						</div>

						<div>
							<button class='showVoters' @click='showVoters = !showVoters'>
								{{ !showVoters ? 'Show' : 'Hide' }} voters
							</button>
						</div>

						<vote-casts-chart :showModal='showModal' :chartdata='chartdata' :name='chartname' @hide='showModal = false'></vote-casts-chart>

						<div class='allCasts'>
							
							<div v-if='forCasts && forCasts.length > 0 && showVoters'>
								<div class='castsForHeading castsupports'>
									<div>
										For <img class='icon' :src="publicPath + 'vote-yea-solid.svg'">
									</div>
									<button @click='showChart(1)'>Show chart</button>
								</div>
								<table class='tui-table'>
									<thead>
										<tr>
											<th>Voter</th>
											<th>veCRV</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for='cast in forCasts'>
											<td>
												<a :href="'https://etherscan.io/address/' + cast.voter" rel='noopener noreferrer'>
													{{ shortenAddress(cast.voter) }}
												</a>
											</td>
											<td>
												{{ (cast.voterStake / 1e18).toFixed(2) }}
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							
							<div v-if='againstCasts && againstCasts.length > 0 && showVoters'>
								<div class='castsAgainstHeading castrejects'>
									<div>
										Against <img class='icon' :src="publicPath + 'vote-nay-solid.svg'">
									</div> 
									<button @click='showChart(0)'>Show chart</button>
								</div>
								<table class='tui-table'>
									<thead>
										<tr>
											<th>Voter</th>
											<th>veCRV</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for='cast in againstCasts'>
											<td>
												<a :href="'https://etherscan.io/address/' + cast.voter" rel='noopener noreferrer'>
													{{ shortenAddress(cast.voter) }}
												</a>
											</td>
											<td>
												{{ (cast.voterStake / 1e18).toFixed(2) }}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div class='myvote' v-if='vote.mycasts && vote.mycasts.length'>
							You voted 
							<b>
								<a :href="'https://etherscan.io/tx/' + vote.mycasts[0].transactionHash"> {{ vote.mycasts[0].supports ? 'Yes' : 'No'}}</a> 
							</b> with: <b> {{ voterStake }} </b> veCRV
							at snapshot block 
							<a :href="'https://etherscan.io/block/' + vote.snapshotBlock"> <b> {{ vote.snapshotBlock }} </b> </a>
						</div>
						<div class='myvote info-message gentle-message' v-if='canVote() && (vote.mycasts && !vote.mycasts.length || !vote.mycasts)'>
							Voting with {{ currentVotingPowerFormat() }} veCRV ({{ myVotingPowerPct }}% of total voting power), you had {{ balanceOfAtFormat }} veCRV
							at vote creation on snapshot block 
							<a :href="'https://etherscan.io/block/' + vote.snapshotBlock"> <b> {{ vote.snapshotBlock }} </b> </a>
							<div class='castvote'>
								<button @click='voteyes'> Yes <span class='loading line' v-show='loadingyes'></span></button>
								<button @click='voteno'> No <span class='loading line' v-show='loadingno'></span></button>
							</div>
						</div>
						<div class='myvote info-message gentle-message' v-show='hadNoBalanceAt'>
							You didn't have enough veCRV balance({{ balanceOfAtFormat}} / {{ MIN_BALANCE }} required) when vote was created on block snapshot 
							<a :href="'https://etherscan.io/block/' + vote.snapshotBlock"> <b> {{ vote.snapshotBlock }} </b> </a>
							at {{ startDateFormat }}
							<p>
								Lock CRV to be able to vote on next proposals in <router-link to='/locker'>Locker page</router-link>
							</p>

						</div>
					</div>
				</div>
			</fieldset>
		</div>

		<div class='voteinfo' v-show='vote.id'>
			<fieldset>
				<legend>Status</legend>
				<div>
					<div class='open' v-show='vote.timeLeft > 0 && !vote.executed && isVoteOpen && !canExecute'>
						<span class='loading line'></span>
						Open
					</div>
					<div v-if='vote.timeLeft < 0 || vote.executed || canExecute'>
						<div class='enacted' v-show='vote.executed'>
							√ Passed(enacted)
						</div>
						<div class='canexecute' v-show='!vote.executed && canExecute'>
							√ Passed <enact-vote :vote='vote'></enact-vote>
						</div>
						<div class='rejected' v-show='isRejected'>
							X Rejected 
							<span>
								({{ rejectedReasonText }})
							</span>
						</div>
					</div>
					<countdown :timestamp = 'vote.startDate' :vote = 'vote' v-show = '!vote.executed' class='countdown'></countdown>
				</div>
				<div class='createdon'>
					<img 
						:src="publicPath + 'clock-regular.svg'" 
						class='icon small'
					>{{ startDateFormat }}
				</div>
				<div class='endson'>
					<img 
						:src="publicPath + 'clock-regular.svg'" 
						class='icon small'
					>{{ endDateFormat }}
				</div>
			</fieldset>

			<fieldset>
				<legend>Support</legend>
				<div>
					<span :class="{'passed': hasSupport, 'rejected': !hasSupport}">
						{{ support }}%
					</span> 
					(> {{ getSupportRequiredPct }}% required)
				</div>
			</fieldset>

			<fieldset>
				<legend>Minimum approval</legend>
				<div>
					<span :class="{'passed': hasQuorum, 'rejected': !hasQuorum}">
						{{ quorum }}%
					</span> 
					(> {{ getMinAcceptQuorum }}% required)
				</div>
			</fieldset>
		</div>
	</div>
</template>

<script>
	import { contract } from '../../../contract'

	import { getVote, state, getters } from '../voteStore'

	import Countdown from '../common/Countdown.vue'

	import { helpers as voteHelpers, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, contractMap, MIN_BALANCE } from '../voteStore'
	import * as helpers from '../../../utils/helpers'

	import RootModalMixin from '../common/RootModalMixin'

	import EnactVote from './EnactVote'

	import VoteCastsChart from './VoteCastsChart'

	export default {
		components: {
			Countdown,
			EnactVote,
			VoteCastsChart,
		},

		mixins: [RootModalMixin],

		data() {
			return {
				vote: {
					id: null,
				},
				balanceOfAt: null,
				balanceOf: null,
				CRVbalance: null,

				loadingyes: false,
				loadingno: false,

				votetype: null,

				showMore: false,

				showVoters: false,

				showModal: false,

				chartdata: [],
				chartname: '',

			}
		},

		async created() {
			this.$watch(() => state.initialized && contract.multicall, val => {
				if(val) this.mounted()
			}, {
				immediate: true,
			})
		},

		computed: {
			getSupportRequiredPct() {
				return this.vote.supportRequiredPct / 1e16
			},
			getMinAcceptQuorum() {
				return this.vote.minAcceptQuorum / 1e16
			},
			yeas() {
				return (this.vote.yea / 1e18).toFixed(2)
			},
			nays() {
				return (this.vote.nay / 1e18).toFixed(2)
			},
			voterStake() {
				if(!this.vote.mycasts || !this.vote.mycasts.length) return 0
				return (this.vote.mycasts[0].voterStake / 1e18).toFixed(2)
			},
			isVoteOpen() {
				return voteHelpers.isVoteOpen(this.vote) && !this.vote.executed
			},
			canExecute() {
				return voteHelpers.canExecute(this.vote)
			},
			isRejected() {
				return voteHelpers.isRejected(this.vote)
			},
			publicPath() {
				return process.env.BASE_URL
			},
			startDateFormat() {
				return helpers.formatDateToHuman(this.vote.startDate)
			},
			endDateFormat() {
				return helpers.formatDateToHuman(+this.vote.startDate + this.vote.voteTime)
			},
			support() {
				if(this.vote.totalSupport == 0)
					return 0
				return ((this.vote.yea / this.vote.totalSupport) * 100).toFixed(2)
			},
			quorum() {
				if(this.vote.totalSupport == 0)
					return 0
				return ((this.vote.yea / this.vote.votingPower) * 100).toFixed(2)
			},
			hasSupport() {
				return this.support > this.getSupportRequiredPct
			},
			hasQuorum() {
				return this.quorum > this.getMinAcceptQuorum
			},
			balanceOfAtFormat() {
				if(this.balanceOfAt === null) return 0
				return (this.balanceOfAt / 1e18).toFixed(2,1)
			},
			votetypeText() {
				if(this.votetype == 0) return 'No'
				return 'Yes'
			},
			rejectedReasonText() {
				if(this.vote.rejectedReason == 1)
					return 'No support'
				if(this.vote.rejectedReason == 2)
					return 'No quorum'
				return ''
			},
			hadNoBalanceAt() {
				return this.balanceOfAt && this.balanceOfAt.lte(0)
			},
			hasCRV() {
				return this.CRVbalance && this.CRVbalance.gt(0)
			},
			canLockToVote() {
				if(this.balanceOf === null) return false
				if(this.balanceOf.eq(0) && this.CRVbalance.gt(0))
					return true
			},
			MIN_BALANCE() {
				return (MIN_BALANCE / 1e18).toFixed(0)
			},
			formattedMetadata() {
				if(!this.vote.metadata) return ''
				return this.vote.metadata && helpers.truncate(this.vote.metadata, 100, true)
			},
			totalVotingPowerFormat() {
				return this.vote.votingPower / 1e18
			},
			myVotingPowerPct() {
				return (this.currentVotingPower() * 100 / this.vote.votingPower).toFixed(2)
			},
			forCasts() {
				return this.vote.casts && this.vote.casts.filter(v => v.supports == true)
			},
			againstCasts() {
				return this.vote.casts && this.vote.casts.filter(v => v.supports == false)
			},
		},

		methods: {
			async mounted() {
				let app = this.$route.params.app
				let id = this.$route.params.id
				this.vote = await getVote(app, id)
				let calls = [
					[state.votingEscrow._address, state.votingEscrow.methods.balanceOfAt(contract.default_account, this.vote.snapshotBlock).encodeABI()],
					[state.votingEscrow._address, state.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[state.CRV._address, state.CRV.methods.balanceOf(contract.default_account).encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				//if(this.isVoteOpen)
				this.balanceOfAt = BN(decoded[0])
				this.balanceOf = BN(decoded[1])
				this.CRVbalance = BN(decoded[2])
			},
			shortenAddress(address) {
				if(!address) return ''
				return address.slice(0,6) + '...' + address.slice(-6)
			},
			currentVotingPower() {
				if(this.balanceOfAt === null) return 0
				let now = Date.now() / 1000
				let currentVotingPower = BN(2).times(this.balanceOfAt)
											.times(
												BN(this.vote.startDate)
												.plus(BN(this.vote.time))
												.minus(now)
											).div(BN(this.vote.time));
				if(currentVotingPower.gt(this.balanceOfAt))
					currentVotingPower = this.balanceOfAt
				return currentVotingPower.toFixed(2,1)
			},
			currentVotingPowerFormat() {
				if(this.currentVotingPower() == 0) return 0
				return (this.currentVotingPower() / 1e18).toFixed(2,1)
			},
			canVote() {
				return this.isVoteOpen && this.balanceOfAt && this.balanceOfAt.gt(0)
			},
			async voteyes() {
				this.loadingyes = true

				this.votetype = 1

				let intent
				try {
					intent = await state.org.appIntent(this.vote.appAddress, 'vote', [this.vote.voteNumber, true, false])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				state.transactionIntent = paths

				this.loadingyes = false

				this.showRootModal = true
			},
			async voteno() {
				this.loadingno = true

				this.votetype = 0

				let intent
				try {
					intent = await state.org.appIntent(this.vote.appAddress, 'vote', [this.vote.voteNumber, false, false])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				state.transactionIntent = paths

				this.loadingno = false

				this.showRootModal = true
			},
			hideModal() {
				this.showModal = false
			},
			showChart(type) {
				console.log('show chart')
				this.showModal = false
				this.showModal = true
				if(type == 1) {
					this.chartdata = this.forCasts
					this.chartname = 'For vote distribution'
				}
				if(type == 0) {
					this.chartdata = this.againstCasts
					this.chartname = 'Against vote distribution'
				}
			}
		},
	}
</script>

<style scoped>
	.vote {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	.voteview {
		flex: 7;
	}
	.voteinfo {
		flex: 3;
	}
	legend {
		text-align: center;
	}
	.voteinfo > div, .myvote {
		margin-top: 1em;
	}
	.progress {
		width: 100%;
	}
	.tui-progress-bar {
		background: gray;
		margin-top: 0.4em;
	}
	.tui-progress.yes {
		background: green;
	}
	.tui-progress.no {
		background: darkred;
	}
	.yestext, .notext {
		position: absolute;
		top: 50%;
		z-index: 1;
		transform: translateY(-50%);
		padding-left: 3px;
	}
	.enacted {
		margin-top: 1em;
		color: green;
	}
	.rejected {
		margin-top: 1em;
		color: darkred;
	}
	.createdon {
		margin-top: 1.4em;
	}
	.endson {
		margin-top: 0.4em;
	}
	.endson img {
		transform: rotateZ(45deg);
	}
	.passed {
		color: green;
	}
	.rejected {
		color: darkred;
	}
	.countdown {
		margin-top: 1em;
	}
	.open, .countdown {
		display: flex;
		align-items: center;
	}
	.voteinfo img, .voteinfo .loading.line {
		margin-right: 0.4em;
	}
	.description .content {
		margin-top: 1em;
	}
	.descriptionText {
		margin-top: 1em;
	}
	.castvote {
		margin-top: 1em;
	}
	.castvote button {
		margin-right: 1em;
	}
	.flexbreak {
		width: 100%;
		height: 0;
	}
	.loading.matrix {
		flex: 1;
	}
	.totalvotes {
		margin-top: 0.4em;
	}

	table {
		/*width: 100%;*/
		margin-top: 0.4em;
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
	.castsupports {
		color: green;
	}
	.castrejects {
		color: darkred;
	}
	.castsupports img {
		filter: invert(10%) sepia(68%) saturate(7256%) hue-rotate(119deg) brightness(101%) contrast(101%);
		vertical-align: middle;
	}
	.castrejects img {
		filter: invert(7%) sepia(98%) saturate(4182%) hue-rotate(8deg) brightness(113%) contrast(119%);
		vertical-align: middle;
	}
	.showVoters {
		margin-top: 1em;
		box-shadow: none;
	}
	.voteDistributionLink {
		margin-top: 1em;
	}
	.allCasts {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	.allCasts > div {
		margin-top: 1em;
	}
	.castsForHeading, .castsAgainstHeading {
		display: flex;
		justify-content: space-between;
	}
	.discusson {
		margin-top: 1em;
	}
</style>