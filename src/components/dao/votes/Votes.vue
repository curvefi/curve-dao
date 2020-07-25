<template>
	<div class='window white'>
		<root-modal v-if='showRootModal'></root-modal>

		<fieldset>
			<legend>Votes</legend>
			<new-text-vote></new-text-vote>
			<div class='votes-wrapper'>
				<span class='loading matrix' v-show='!loadedVotes'></span>
				<fieldset>
					<legend>Open votes ({{ openVotes.length }})</legend>
					<div class='votes open'>
						<vote v-for='vote in openVotes' :key='vote.id' :vote='vote' class='vote'></vote>
					</div>
				</fieldset>
			</div>
			<div class='votes-wrapper'>
				<span class='loading matrix' v-show='!loadedVotes'></span>
				<fieldset>
					<legend>Closed votes ({{ closedVotes.length }})</legend>
					<div class='votes closed'>
						<vote v-for='vote in closedVotes' :key='vote.id' :vote='vote' class='vote'></vote>
					</div>
				</fieldset>
			</div>
		</fieldset>
	</div>
</template>

<script>

	import { contract } from '../../../contract'

	import gql from 'graphql-tag'
	import { GraphQLWrapper } from '@aragon/connect-thegraph'

	import { connect, describeScript } from '@aragon/connect'
	import { Voting } from '@aragon/connect-thegraph-voting'

	import { getAllVotes, state, getters } from '../voteStore'

	import Vote from './Vote'
	import NewTextVote from './NewTextVote'

	import RootModal from '../common/RootModal'

	export default {
		components: {
			Vote,
			NewTextVote,
			RootModal,
		},

		async created() {
			this.$watch(() => state.initialized, val => {
				if(val) this.mounted()
			}, {
				immediate: true,
			})
		},

		data: () => ({
			loadedVotes: false,
		}),

		computed: {
			...getters,
			showRootModal() {
				return state.showRootModal
			},
		},

		methods: {
			async mounted() {
				await getAllVotes()
				this.loadedVotes = true
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
		grid-gap: 1em;
		word-break: break-all;
	}
	.votes .vote {
		/*height: 150px;*/
		/* fix for fieldset height 100% issue */
		margin-bottom: 1em;
	}
	.votes-closed {
		margin-top: 1em;
	}
</style>