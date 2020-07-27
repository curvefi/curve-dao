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
							<b> Vote #{{ vote.voteNumber }} </b>
						</div> 
					</div>
					<div class='description'>
						<div> 
							<b>Description:</b> 
						</div>
						<div class='content'>
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
						</div>
						<div class="tui-progress-bar">
							<span class='notext'>No:</span>
						    <span class="tui-progress-label">{{ vote.nop }}%</span>
						    <span class="tui-progress no" :style="{width: vote.nop + '%'}"></span>
						</div>
						<div>
							{{ nays }}
						</div>

						<div class='myvote' v-if='vote.casts && vote.casts.length'>
							You voted with: <b> {{ voterStake }} </b> veCRV
							at snapshot block 
							<a :href="'https://etherscan.io/block/' + vote.snapshotBlock"> <b> {{ vote.snapshotBlock }} </b> </a>
						</div>

						<div class='myvote info-message gentle-message' v-if='canVote() && !vote.casts.length'>
							Voting with {{ currentVotingPowerFormat() }} veCRV, you had {{ balanceOfAtFormat }} veCRV
							at vote creation on snapshot block 
							<a :href="'https://etherscan.io/block/' + vote.snapshotBlock"> <b> {{ vote.snapshotBlock }} </b> </a>
							<div class='castvote'>
								<button @click='voteyes'> Yes <span class='loading line' v-show='loadingyes'></span></button>
								<button @click='voteno'> No <span class='loading line' v-show='loadingno'></span></button>
							</div>
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
				<legend>Minumum approval</legend>
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

	import { helpers as voteHelpers, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, contractMap } from '../voteStore'
	import * as helpers from '../../../utils/helpers'

	import RootModalMixin from '../common/RootModalMixin'

	import EnactVote from './EnactVote'

	export default {
		components: {
			Countdown,
			EnactVote,
		},

		mixins: [RootModalMixin],

		data: () => ({
			vote: {
				id: null,
			},
			balanceOfAt: null,

			loadingyes: false,
			loadingno: false,

			votetype: null,
		}),

		async created() {
			this.$watch(() => state.initialized, val => {
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
				if(!this.vote.casts.length) return 0
				return (this.vote.casts[0].voterStake / 1e18).toFixed(2)
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
				return this.support > this.getMinAcceptQuorum
			},
			balanceOfAtFormat() {
				if(this.balanceOfAt === null) return 0
				return (this.balanceOfAt / 1e18).toFixed(2,1)
			},
			votetypeText() {
				if(this.votetype == 0) return 'No'
				return 'Yes'
			},
		},

		methods: {
			async mounted() {
				let app = this.$route.params.app
				let id = this.$route.params.id
				this.vote = await getVote(app, id)
				if(this.isVoteOpen)
					this.balanceOfAt = BN(await state.votingEscrow.methods.balanceOfAt(contract.default_account, this.vote.snapshotBlock).call())
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
				return this.isVoteOpen && this.currentVotingPower() > 0
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
</style>