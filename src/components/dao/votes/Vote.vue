<template>
	<div>
		<fieldset>
			<legend>
				{{ vote.votingAppName }} ({{getSupportRequiredPct}}% / {{getMinAcceptQuorum}}%)
			</legend>
			<div class='voteTitle'>
				<router-link :to="'/vote/' + vote.votingAppName.toLowerCase() + '/' + vote.voteNumber">
					<b> #{{ vote.voteCountSeq }} </b>
				</router-link> 
				<span class='userCastVote tooltip'>
					<span v-show='vote.casts && vote.casts.length && vote.casts[0].supports' class='userVotedYes'>√</span>
					<span v-show='vote.casts && vote.casts.length && !vote.casts[0].supports' class='userVotedNo'>X</span>
					<span class='tooltiptext'>
						You voted {{vote.casts && vote.casts.length && vote.casts[0].supports ? 'Yes' : 'No'}}
					</span>
				</span>
			</div>
			<div class='description'>
				<router-link :to="'/vote/' + vote.votingAppName.toLowerCase() + '/' + vote.voteNumber">
					<span v-show='vote.contractName'>
						{{ vote.contractName }}: <span v-html='vote.description'></span>
					</span>
					<span v-show='!vote.contractName && vote.metadata'>
						{{ formattedMetadata }}
					</span>
					<span v-show='!vote.contractName && vote.description'>
						<span v-html='vote.description'></span>
					</span>
				</router-link>
			</div>
			<countdown :timestamp = 'vote.startDate' :vote = 'vote' v-show='isOpen(vote) && !vote.executed'></countdown>
			<div class="tui-progress-bar">
				<span class='yestext'>Yes:</span>
			    <span class="tui-progress-label">{{ vote.yeap }}%</span>
			    <span class="tui-progress yes" :style="{width: vote.yeap + '%'}"></span>
			</div>
			<div class="tui-progress-bar">
				<span class='notext'>No:</span>
			    <span class="tui-progress-label">{{ vote.nop }}%</span>
			    <span class="tui-progress no" :style="{width: vote.nop + '%'}"></span>
			</div>
			<div class='enacted' v-show='vote.executed'>
				√ Passed(enacted)
			</div>
			<div class='canexecute' v-show='canExecute'>
				√ Passed <enact-vote :vote='vote'></enact-vote>
			</div>
			<div class='rejected' v-show='isRejected'>
				X Rejected ({{ rejectedReasonText }})
			</div>
			<div class='createdon'>
				<img 
					:src="publicPath + 'clock-regular.svg'" 
					class='icon small'
				> 
				{{ startDateFormat }}
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { connect, describeScript, App } from '@aragon/connect'

	import { state, getters } from '../voteStore'
	
	import * as radspec from 'radspec'

	import Countdown from '../common/Countdown.vue'
	import { helpers as voteHelpers, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, contractMap } from '../voteStore'
	import * as allabis from '../allabis'
	import * as helpers from '../../../utils/helpers'

	import EnactVote from './EnactVote'

	export default {
		components: {
			Countdown,
			EnactVote,
		},

		props: ['vote'],

		data: () => ({
			//description: null,
		}),

		async created() {
			//this.description = await this.decodeCall()
		},

		computed: {
			getSupportRequiredPct() {
				return this.vote.supportRequiredPct / 1e16
			},
			getMinAcceptQuorum() {
				return this.vote.minAcceptQuorum / 1e16
			},
			// contractCalled() {
			// 	if(this.vote.script.substr(90,40) == allabis.poolproxy_address.substr(2).toLowerCase()) 
			// 		return 'poolproxy'
			// 	if(this.vote.script.substr(90,40) == allabis.votingescrow_address.substr(2).toLowerCase()) 
			// 		return 'votingescrow'
			// 	if(this.vote.script.substr(90,40) == allabis.gaugecontroller_address.substr(2).toLowerCase()) 
			// 		return 'gaugecontroller'
			// 	return null
			// },
			// contractName() {
			// 	if(this.contractCalled == 'poolproxy') 
			// 		return 'Pool Proxy'
			// 	if(this.contractCalled == 'votingescrow')
			// 		return 'Voting Escrow'
			// 	if(this.contractCalled == 'gaugecontroller')
			// 		return 'Gauge Controller'
			// 	return null
			// },
			startDateFormat() {
				return helpers.formatDateToHuman(this.vote.startDate)
			},
			canExecute() {
				return voteHelpers.canExecute(this.vote)
			},
			isRejected() {
				return voteHelpers.isRejected(this.vote)
			},
			rejectedReasonText() {
				if(this.vote.rejectedReason == 1)
					return 'No support'
				if(this.vote.rejectedReason == 2)
					return 'No quorum'
				return ''
			},
			publicPath() {
				return process.env.BASE_URL
			},
			formattedMetadata() {
				return this.vote.metadata && helpers.truncate(this.vote.metadata, 100, true)
			},
		},

		methods: {
			isOpen(vote) {
				return voteHelpers.isVoteOpen(vote)
			},
			// async decodeCall() {
			// 	if(this.contractCalled !== null) {
			// 		let natspec = allabis[this.contractCalled+'_natspec'].methods
			// 		let abi = allabis[this.contractCalled+'_abi']
			// 		let signature = '0x'+this.vote.script.substr(322, 8)
			// 		let method = Object.keys(natspec).find(key => web3.eth.abi.encodeFunctionSignature(key) == signature)
			// 		console.log(method, "THE METHOD")
			// 		// let signatures = Object.values(natspec).map(m => m.signature.substr(2))
			// 		// let match = signatures.map(sig => this.vote.script.indexOf(sig)).find(idx => idx > -1)
			// 		// let method = Object.keys(natspec).find(key => 
			// 		// 	natspec[key].signature.substr(2) == signatures.filter(sig => this.vote.script.indexOf(sig) > -1))
			// 		// if(method === undefined) return null;
			// 		// let data = this.vote.script.substr(match)
			// 		let data = this.vote.script.substr(322)
			// 		let expression = natspec[method].notice
			// 		let call = {
			// 			abi: [abi.find(v => v.name == method.split('(')[0])],
			// 			transaction: {
			// 				data: '0x' + data,
			// 			}
			// 		}
			// 		let desc = await radspec.evaluate(expression, call)
			// 		return desc
			// 	}
			// 	else if(!this.vote.metadata) {
			// 		try {
			// 			let desc = await describeScript(this.vote.script, state.apps)
			// 			return desc[0].description
			// 		}
			// 		catch(err) {
			// 			console.error(err)
			// 		}
			// 	}
			// },

		},
	}
</script>

<style scoped>
	fieldset {
		height: 100%;
	}
	legend {
		text-align: center;
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
	.canexecute, .enacted {
		margin-top: 1em;
		color: green;
	}
	.rejected {
		margin-top: 1em;
		color: darkred;
	}
	.createdon {
		margin-top: 0.4em;
	}
	.userCastVote {
		cursor: pointer;
	}
	.userVotedYes {
		color: green;
	}
	.userVotedNo {
		color: darkred;
	}
	.voteTitle {
		display: flex;
		justify-content: space-between;
	}
	.description {
		margin-top: 0.1em;
	}
	/*.description {
		height: 30px;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}*/
	.userCastVote .tooltiptext {
		padding: 0.4em;
	}
</style>