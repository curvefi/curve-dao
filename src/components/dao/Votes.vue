<template>
	<div class='window white'>
		<fieldset>
			<legend>Votes</legend>
			<div class='votes'>
				<div v-for='vote in votes'>
					<fieldset>
						<legend>
							{{ getVotingAppName(vote) }} ({{getSupportRequiredPct(vote)}}% / {{getMinAcceptQuorum(vote)}}%)
						</legend>
						<b> #{{getVoteId(vote)}} </b> {{vote.script}}
					</fieldset>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { connect } from '@aragon/connect'
	import { Voting } from '@aragon/connect-thegraph-voting'

	console.log(Voting, "THE VOTING")


	export default {
		data: () => ({
			votes: [],
		}),

		async created() {
			
			// Initiates the connection to an organization
			let org = await connect('0x736fbC3929332BD33cc14cCc32DB0b78ec8eC909', 'thegraph', { chainId: 4 })

			// Fetch the apps belonging to this organization
			let apps = await org.apps()

			apps.forEach(console.log)

			let ownershipVotingApp = apps.find(app => app.address.toLowerCase() 
												== '0xE0Ceb216ff30B7E4A79F9aE21eCb98766bC60261'.toLowerCase())
			let parameterVotingApp = apps.find(app => app.address.toLowerCase() 
												== '0x4FE4e8412c1C04127A64AECb60a857975E2ceE71'.toLowerCase())

			let ovoting = new Voting(
				ownershipVotingApp.address, 
				'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby'
			)

			let pvoting = new Voting(
				parameterVotingApp.address,
				'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby'
			)

			let votes = await Promise.all([ovoting.votes(), pvoting.votes()])
			votes = votes.map(appVotes => appVotes.reverse()).flat()

			this.votes = votes

			console.log(votes, "THE VOTES")
		},

		methods: {
			getVotingAppName(vote) {
				if(vote.appAddress.toLowerCase() == '0xE0Ceb216ff30B7E4A79F9aE21eCb98766bC60261'.toLowerCase()) return 'Ownership'
				if(vote.appAddress.toLowerCase() == '0x4FE4e8412c1C04127A64AECb60a857975E2ceE71'.toLowerCase()) return 'Parameter'
			},
			getSupportRequiredPct(vote) {
				return vote.supportRequiredPct / 1e16
			},
			getMinAcceptQuorum(vote) {
				return vote.minAcceptQuorum / 1e16
			},
			getVoteId(vote) {
				return +vote.id.split(':')[2]
			},
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	.votes {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		word-break: break-all;
	}
</style>