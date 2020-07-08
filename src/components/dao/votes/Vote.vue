<template>
	<div>
		<fieldset>
			<legend>
				{{ getVotingAppName }} ({{getSupportRequiredPct}}% / {{getMinAcceptQuorum}}%)
			</legend>
			<b> #{{getVoteId}} </b>
			<span v-show='contractCalled'>
				{{ contractCalled }}: {{ description }}
			</span>
			<span v-show='!contractCalled'>
				{{ vote.metadata }}
			</span>
			<countdown :timestamp = 'vote.startDate'></countdown>
		</fieldset>
	</div>
</template>

<script>
	import * as radspec from 'radspec'
	console.log(radspec, "RADSPEC")

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
			contractCalled() {
				if(this.vote.script.includes(allabis.poolproxy_address.substr(2).toLowerCase())) return 'Pool Proxy'
				if(this.vote.script.includes(allabis.votingescrow_address.substr(2).toLowerCase())) return 'Voting Escrow'
				if(this.vote.script.includes(allabis.gaugecontroller_address.substr(2).toLowerCase())) return 'Gauge Controller'
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
					console.log(method, "THE METHOD")
					if(method === undefined) return ''
					let data = this.vote.script.substr(match)
					console.log(data, "DATA")
					let expression = natspec[method].notice
					console.log(expression, "EXPRESSION")
					console.log(abi.find(v => v.name == method.split('(')[0]), "ABI")
					let call = {
						abi: [abi.find(v => v.name == method.split('(')[0])],
						transaction: {
							data: '0x' + data,
						}
					}
					console.log(expression, call, "THE DESC CALL")
					let desc = await radspec.evaluate(expression, call)
					console.log(desc, "DESC")
					return desc
				}
			},
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
</style>