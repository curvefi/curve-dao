<template>
	<div class='window white'>
		<!-- <root-modal v-if='showRootModal'></root-modal> -->
		<router-link to="/emergencymembers">Emergency DAO members</router-link>
		<fieldset>
			<legend>Votes</legend>
			<new-text-vote></new-text-vote>
			<div class='filter'>
				<fieldset>
					<legend>Filter</legend>
					<div>
						<span>Status:</span>
						<select class='tvision' v-model='filterStatus'>
							<option v-for='status in allStatus' :value='status.val'>
								{{ status.text }}
							</option>
						</select>
						<span>Outcome:</span>
						<select class='tvision' v-model='filterOutcome'>
							<option v-for='outcome in allOutcome' :value='outcome.val'>
								{{ outcome.text }}
							</option>
						</select>
						<span>App:</span>
						<select class='tvision' v-model='filterApp'>
							<option v-for='app in allApp' :value='app.val'>
								{{ app.text }}
							</option>
						</select>
						<!-- <button @click='changeFilter'>Select</button> -->
					</div>
				</fieldset>
			</div>
			<div class='votes-wrapper' v-show='!customFilter'>
				<fieldset>
					<span class='loading matrix' v-show='!loadedVotes'></span>
					<legend>Open votes ({{ openVotes.length }})</legend>
					<div class='votes open'>
						<vote v-for='vote in openVotes' :key='vote.id' :vote='vote' class='vote'></vote>
					</div>
				</fieldset>
			</div>
			<div class='votes-wrapper' v-show='!customFilter'>
				<fieldset>
					<span class='loading matrix' v-show='!loadedVotes'></span>
					<legend>Closed votes ({{ closedVotes.length }})</legend>
					<div class='votes closed'>
						<vote v-for='vote in closedVotes' :key='vote.id' :vote='vote' class='vote'></vote>
					</div>
				</fieldset>
			</div>
			<div class='votes-wrapper' v-if='customFilter'>
				<fieldset>
					<span class='loading matrix' v-show='!loadedVotes'></span>
					<legend>{{ customFilterText }} ({{ customFilterVotes.length }})</legend>
					<div class='votes closed'>
						<vote v-for='vote in filterPagination' :key='vote.id' :vote='vote' class='vote'></vote>
					</div>
				</fieldset>
			</div>
			<pagination></pagination>
		</fieldset>
	</div>
</template>

<script>

	import { contract } from '../../../contract'

	import gql from 'graphql-tag'
	import { GraphQLWrapper } from '@aragon/connect-thegraph'

	import { connect, describeScript } from '@aragon/connect'
	import { Voting } from '@aragon/connect-thegraph-voting'

	import { getAllVotes, state, getters, changeFilter } from '../voteStore'

	import Vote from './Vote'
	import NewTextVote from './NewTextVote'

	import RootModal from '../common/RootModal'

	import Pagination from './Pagination'

	export default {
		components: {
			Vote,
			NewTextVote,
			RootModal,
			Pagination,
		},

		async created() {
			this.$watch(() => state.initialized, val => {
				if(val) this.mounted()
			}, {
				immediate: true,
			})
		},

		watch: {
			changedFilter() {
				state.pagination.page = 0
				this.changeFilter()
			},
		},

		data: () => ({
			loadedVotes: false,

			allStatus: [
				{
					val: 3,
					text: 'All',
				},
				{
					val: 1,
					text: 'Open',
				},
				{
					val: 2,
					text: 'Closed',
				},
			],

			allOutcome: [
				{
					val: 5,
					text: 'All',
				},
				{
					val: 1,
					text: 'Passed',
				},
				{
					val: 2,
					text: 'Rejected',
				},
				{
					val: 3,
					text: 'Enacted',
				},
				{
					val: 4,
					text: 'Pending',
				},
			],

			allApp: [
				{
					val: 3,
					text: 'All',
				},
				{
					val: 1,
					text: 'Voting',
				},
				{
					val: 2,
					text: 'Parameter',
				},
			],
		}),

		computed: {
			...getters,
			showRootModal() {
				return state.showRootModal
			},
			filterStatus: {
				get() {
					return state.filters.status
				},
				set(val) {
					state.filters.status = val
				},
			},
			filterOutcome: {
				get() {
					return state.filters.outcome
				},
				set(val) {
					state.filters.outcome = val
				},
			},
			filterApp: {
				get() {
					return state.filters.app
				},
				set(val) {
					state.filters.app = val
				},
			},
			customFilterText() {
				let statusText = this.allStatus.find(val => val.val == this.filterStatus).text
				let outcomeText = this.allOutcome.find(val => val.val == this.filterOutcome).text
				let appText = this.allApp.find(val => val.val == this.filterApp).text

				return statusText + ' ' + outcomeText + ' ' + appText
			},
			changedFilter() {
				return this.filterStatus, this.filterOutcome, this.filterApp, Date.now()
			},
		},

		methods: {
			async mounted() {
				let account = contract.default_account || '0x0000000000000000000000000000000000000000'
				let calls = [
					[state.votingEscrow._address, state.votingEscrow.methods.balanceOf(account).encodeABI()],
					[state.votingEscrow._address, state.votingEscrow.methods.locked__end(account).encodeABI()],
					[state.CRV._address, state.CRV.methods.balanceOf(account).encodeABI()],
				]
				await getAllVotes()
				this.loadedVotes = true
			},
			changeFilter() {
				changeFilter()
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
	select.tvision {
		box-shadow: none
	}
	.filter select {
		margin-right: 1em;
	}
	.filter div span {
		margin-right: 0.4em;
	}
	.filter button {
		box-shadow: none;
	}
	p div {
		margin-top: 0.4em;
	}
</style>