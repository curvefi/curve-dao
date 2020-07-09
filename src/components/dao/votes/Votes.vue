<template>
	<div class='window white'>
		<fieldset>
			<legend>Votes</legend>
			<div class='votes-wrapper'>
				<fieldset>
					<legend>Open votes ({{ openVotes.length }})</legend>
					<div class='votes open'>
						<vote v-for='vote in openVotes' :vote='vote'></vote>
					</div>
				</fieldset>
			</div>
			<div class='votes-wrapper'>
				<fieldset>
					<legend>Closed votes ({{ closedVotes.length }})</legend>
					<div class='votes closed'>
						<vote v-for='vote in closedVotes' :vote='vote'></vote>
					</div>
				</fieldset>
			</div>
		</fieldset>
	</div>
</template>

<script>

	import gql from 'graphql-tag'
	import { GraphQLWrapper } from '@aragon/connect-thegraph'

	import { connect } from '@aragon/connect'
	import { Voting } from '@aragon/connect-thegraph-voting'

	import { state, getters } from '../voteStore'

	import Vote from './Vote'

	export default {
		components: {
			Vote,
		},

		data: () => ({

		}),

		computed: {
			...getters,
		},

		async created() {
			
			// Initiates the connection to an organization
			let org = await connect('0x736fbC3929332BD33cc14cCc32DB0b78ec8eC909', 'thegraph', { chainId: 4 })

			// Fetch the apps belonging to this organization
			let apps = await org.apps()
			state.apps = apps

			apps.forEach(console.log)

			let ownershipVotingApp = apps.find(app => app.address.toLowerCase() 
												== '0xE0Ceb216ff30B7E4A79F9aE21eCb98766bC60261'.toLowerCase())
			let parameterVotingApp = apps.find(app => app.address.toLowerCase() 
												== '0x4FE4e8412c1C04127A64AECb60a857975E2ceE71'.toLowerCase())

			const aragon_voting_subgraph_url = 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby'

			const QUERY = gql`
				query {
				  votes(where:{
				    appAddress_in: ["${ownershipVotingApp.address}", "${parameterVotingApp.address}"]
				  }, orderBy: startDate, orderDirection: desc) {
				    id
			      	appAddress
			      	orgAddress
			      	creator
			      	metadata
			      	executed
			      	startDate
			      	snapshotBlock
			      	supportRequiredPct
			      	minAcceptQuorum
			      	yea
			      	nay
			      	votingPower
			      	script
				  }
				}
			`

			const wrapper = new GraphQLWrapper(aragon_voting_subgraph_url)

			// Invoke the custom query and receive data
			const results = await wrapper.performQuery(QUERY)

			const { votes } = results.data

			state.votes = votes


			// let ovoting = new Voting(
			// 	ownershipVotingApp.address, 
			// 	'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby'
			// )

			// let pvoting = new Voting(
			// 	parameterVotingApp.address,
			// 	'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby'
			// )

			// state.votes = await Promise.all([ovoting.votes(), pvoting.votes()])
			// state.votes = state.votes.flat()
		},

		methods: {
			
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
	.votes-closed {
		margin-top: 1em;
	}
</style>