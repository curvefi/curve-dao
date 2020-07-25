<template>
	<div>
		<modal>
			<template v-slot:activate='{ show }'>
				<div v-show = 'canCreateNewVote' @click='show'>
					<button class='simplebutton'>New text vote</button>
				</div>
			</template>
			<template v-slot:title>
				Create new vote
			</template>
			<div class='content'>
				<div>
					<select class='tvision' v-model='selectedApp'>
						<option v-for='app in apps' :value='app'>
							{{ app.name }}
						</option>
					</select>
				</div>
				<div>
					<label for='newtextvote'>Vote description:</label>
					<textarea id='newtextvote' v-model='description'></textarea>
				</div>
			</div>
			<template v-slot:submit>
				<span @click='submit'>Submit <span class='loading line' v-show='loading'></span></span>
			</template>
		</modal>
		<!-- <p class='info-message gentle-message createvote'> -->
		<button class='simplebutton createvotebutton'>
			<router-link to='/dao/createvote' v-show='canCreateNewVote'> Create Vote </router-link>
		</button>
		<!-- </p> -->
	</div>
</template>

<script>
	import { contract } from '../../../contract'

	import { Voting } from '@aragon/connect-thegraph-voting'

	import Modal from '../common/Modal'

	import { state, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, helpers as voteHelpers } from '../voteStore'

	export default {

		components: {
			Modal,
		},

		data: () => ({
			description: '',
			loading: false,

			selectedApp: null,
			apps: [],

			canCreateNewVote: false,
		}),

		async created() {
			this.$watch(() => state.initialized, val => {
				if(val) this.created()
			}, {
				immediate: true,
			})

			this.$watch(() => state.lastCreated !== null, val => {
				if(val) this.canCreate()
			}, {
				immediate: true,
			})

			this.$watch(() => state.showModal, val => {
				if(!val) this.description = ''
			})
		},

		computed: {
			initialized() {
				return state.initialized
			},
			votingApps() {
				return state.votingApps
			},
		},

		methods: {
			async created() {
				this.app = this.apps[0]
			},
			async canCreate() {
				let canCreateVoteOn = await Promise.all([voteHelpers.canCreateNewVoteOn(OWNERSHIP_APP_ADDRESS), voteHelpers.canCreateNewVoteOn(PARAMETER_APP_ADDRESS)])
				if(canCreateVoteOn[0])
					this.apps.push({
						address: OWNERSHIP_APP_ADDRESS,
						name: 'Ownership'
					})
				if(canCreateVoteOn[1])
					this.apps.push({
						address: PARAMETER_APP_ADDRESS,
						name: 'Parameter'
					})
				this.selectedApp = this.apps[0]
				this.canCreateNewVote = canCreateVoteOn.find(v => v)
			},
			async submit() {
				this.loading = true
				let intent
				try {
					intent = await state.org.appIntent(this.selectedApp.address.toLowerCase(), 'newVote(bytes,string,bool,bool)', ['0x00000001', this.description, false, false])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				state.transactionIntent = paths

				this.loading = false
				state.showModal = false

				state.showRootModal = true


				console.log(paths, "THEPATH")
			},
		},
	}
</script>

<style scoped>
	.content > div {
		display: flex;
		flex-wrap: wrap;
		margin-top: 1em;
		color: black;
	}
	.content > div:nth-of-type(1) {
		margin-top: 0;
	}
	.content input {
		
	}
	textarea {
		margin-top: 1em;
		font-size: 1em;
		height: 4em;
	}
	select.tvision {
		box-shadow: none
	}
	.createvote {
		width: 100px;
		margin-top: 1em;
		padding-top: 0.4em;
		padding-bottom: 0.4em;
	}
	.createvote a {
		color: white;
	}
	.createvotebutton {
		margin-top: 1em;
	}
	.createvotebutton a, .createvotebutton a:visited {
		color: white;
	}
</style>