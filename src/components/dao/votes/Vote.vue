<template>
	<div>
		<fieldset>
			<legend>
				{{ getVotingAppName }} ({{getSupportRequiredPct}}% / {{getMinAcceptQuorum}}%)
			</legend>
			<b> #{{getVoteId}} </b>
			<div class='description'>
				<span v-show='contractCalled'>
					{{ contractCalled }}: {{ description }}
				</span>
				<span v-show='!contractCalled && vote.metadata'>
					{{ vote.metadata }}
				</span>
				<span v-show='!contractCalled && description'>
					{{ description }}
				</span>
			</div>
			<countdown :timestamp = 'vote.startDate'></countdown>
			<div class="tui-progress-bar">
				<span class='yestext'>Yes:</span>
			    <span class="tui-progress-label">{{ getSupportYea }}%</span>
			    <span class="tui-progress yes" :style="{width: getSupportYea + '%'}"></span>
			</div>
			<div class="tui-progress-bar">
				<span class='notext'>No:</span>
			    <span class="tui-progress-label">{{ getSupportNay }}%</span>
			    <span class="tui-progress no" :style="{width: getSupportNay + '%'}"></span>
			</div>
			<div class='enacted' v-show='vote.executed'>
				√ Passed(enacted)
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { connect, describeScript, App } from '@aragon/connect'
	console.log(describeScript, connect, App, "WTF")

	import { state, getters } from '../voteStore'
	
	import * as radspec from 'radspec'

	import Countdown from '../common/Countdown.vue'
	import { helpers, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, contractMap } from '../voteStore'
	import * as allabis from '../allabis'



	export default {
		components: {
			Countdown,
		},

		props: ['vote'],

		data: () => ({
			description: null,
		}),

		async created() {
			this.description = await this.decodeCall()
		},

		computed: {
			getVotingAppName() {
				if(this.vote.appAddress.toLowerCase() == OWNERSHIP_APP_ADDRESS.toLowerCase()) return 'Ownership'
				if(this.vote.appAddress.toLowerCase() == PARAMETER_APP_ADDRESS.toLowerCase()) return 'Parameter'
			},
			getSupportRequiredPct() {
				return this.vote.supportRequiredPct / 1e16
			},
			getMinAcceptQuorum() {
				return this.vote.minAcceptQuorum / 1e16
			},
			getVoteId() {
				return +this.vote.id.split(':')[2]
			},
			totalSupport() {
				return +this.vote.yea + +this.vote.nay
			},
			getSupportYea() {
				if(this.totalSupport == 0) return 0
				return (+this.vote.yea / this.totalSupport * 100).toFixed(1)
			},
			getSupportNay() {
				if(this.totalSupport == 0) return 0
				return (+this.vote.nay / this.totalSupport * 100).toFixed(1)
			},
			contractCalled() {
				if(this.vote.script.substr(90,40) == allabis.poolproxy_address.substr(2).toLowerCase()) return 'Pool Proxy'
				if(this.vote.script.substr(90,40) == allabis.votingescrow_address.substr(2).toLowerCase()) return 'Voting Escrow'
				if(this.vote.script.substr(90,40) == allabis.gaugecontroller_address.substr(2).toLowerCase()) return 'Gauge Controller'
				return null
			},

		},

		methods: {
			isOpen(vote) {
				return helpers.isOpen(vote)
			},
			async decodeCall() {
				if(this.contractCalled == 'Pool Proxy') {
					let natspec = allabis.poolproxy_natspec.methods
					let abi = allabis.poolproxy_abi
					let signatures = Object.values(natspec).map(m => m.signature.substr(2))
					let match = signatures.map(sig => this.vote.script.indexOf(sig)).find(idx => idx > -1)
					let method = Object.keys(natspec).find(key => 
						natspec[key].signature.substr(2) == signatures.filter(sig => this.vote.script.indexOf(sig) > -1))
					if(method === undefined) return null;
					let data = this.vote.script.substr(match)
					let expression = natspec[method].notice
					let call = {
						abi: [abi.find(v => v.name == method.split('(')[0])],
						transaction: {
							data: '0x' + data,
						}
					}
					let desc = await radspec.evaluate(expression, call)
					return desc
				}
				else if(!this.vote.metadata) {
					try {
						let desc = await describeScript(this.vote.script, state.apps)
						return desc[0].description
					}
					catch(err) {
						console.error(err)
					}
				}
			},

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
	.enacted {
		margin-top: 1em;
		color: green;
	}
	/*.description {
		height: 30px;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}*/
</style>