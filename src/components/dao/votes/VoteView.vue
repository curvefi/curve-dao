<template>
	<div class='window white vote'>
		<div class='voteview'>
			<fieldset>
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
						<span v-show='vote.contractName'>
							{{ vote.contractName }}: {{ vote.description }}
						</span>
						<span v-show='!vote.contractName && vote.metadata'>
							{{ vote.metadata }}
						</span>
						<span v-show='!vote.contractName && vote.description'>
							{{ vote.description }}
						</span>
					</div>
					<div class='creator'>
						<b>Proposed by:</b> <a :href="'https://etherscan.io/address/'+vote.creator">{{ shortenAddress(vote.creator) }}</a>
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
							You voted with: <b> {{ voterStake }} </b> 
							at snapshot block 
							<a :href="'https://etherscan.io/block/' + vote.snapshotBlock"> <b> {{ vote.snapshotBlock }} </b> </a>
						</div>
					</div>
				</div>
			</fieldset>
		</div>

		<div class='voteinfo'>
			<fieldset>
				<legend>Status</legend>
				<div>
					<div v-if='vote.timeLeft < 0 || vote.executed'>
						<div class='enacted' v-show='vote.executed'>
							√ Passed(enacted)
						</div>
						<div class='canexecute' v-show='!vote.executed && canExecute'>
							√ Passed <button @click = 'enact(vote)'>Enact</button>
						</div>
						<div class='rejected' v-show='isRejected'>
							X Rejected
						</div>
					</div>
					<countdown :timestamp = 'vote.startDate' :vote = 'vote' v-show = '!vote.executed'></countdown>
				</div>
				<div class='createdon'>
					<img 
						:src="publicPath + 'clock-regular.svg'" 
						class='icon small'
					> 
					{{ startDateFormat }}
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
	import { getVote, state, getters } from '../voteStore'

	import Countdown from '../common/Countdown.vue'

	import { helpers as voteHelpers, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, contractMap } from '../voteStore'
	import * as helpers from '../../../utils/helpers'

	export default {
		components: {
			Countdown,
		},

		data: () => ({
			vote: {},
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
			support() {
				return ((this.vote.yea / this.vote.totalSupport) * 100).toFixed(2)
			},
			quorum() {
				return ((this.vote.yea / this.vote.votingPower) * 100).toFixed(2)
			},
			hasSupport() {
				return this.support > this.getSupportRequiredPct
			},
			hasQuorum() {
				return this.support > this.getMinAcceptQuorum
			},
		},

		methods: {
			async mounted() {
				let app = this.$route.params.app
				let id = this.$route.params.id
				this.vote = await getVote(app, id)
			},
			shortenAddress(address) {
				if(!address) return ''
				return address.slice(0,6) + '...' + address.slice(-6)
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
	.passed {
		color: green;
	}
	.rejected {
		color: darkred;
	}
</style>