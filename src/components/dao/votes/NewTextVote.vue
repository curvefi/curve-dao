<template>
	<div>
		<div id='modal' class='modal rootmodal' v-if='showRootModal' @click.self='hideRootModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideRootModal'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Create a text vote on {{ appName }}</legend>
					<div class='content'>
						<div>
							<span> {{ voteDescription }} </span>
							<div>
								<span> {{ description }} </span>
							</div>
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
					<button @click='createVote'>Create Text Vote</button>
				</fieldset>
			</div>
		</div>

		<div v-show='canCreateNewVote'>
			<modal>
				<template v-slot:activate='{ show }'>
					<div @click='show'>
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
				<router-link to='/createvote'> Create Vote </router-link>
			</button>
		</div>
		<div v-show='!canCreateNewVote && canCreateLoaded'>
			<p class='info-message gentle-message'>
				You have to have at least 2500veCRV(the equivalent of 10000CRV locked for a year) to be able to create a new vote
			</p>
			<voting-escrow :showvelock = 'false' class='votingescrow'>
				<p>
					<router-link to='/locker'>Manage locking in Locker</router-link>
				</p>	
			</voting-escrow>
		</div>
		<!-- </p> -->
	</div>
</template>

<script>
	import { contract } from '../../../contract'

	import { Voting } from '@aragon/connect-thegraph-voting'

	import Modal from '../common/Modal'

	import { state, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, helpers as voteHelpers } from '../voteStore'

	import RootModalMixin from '../common/RootModalMixin'

	import VotingEscrow from '../../minter/VotingEscrow'

	export default {

		components: {
			Modal,
			VotingEscrow,
		},

		mixins: [RootModalMixin],

		data: () => ({
			canCreateLoaded: false,
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
				console.log(canCreateVoteOn, "CAN CREATE NEW VOTE ON")
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
				this.canCreateLoaded = true
			},
			async submit() {
				this.loading = true

				let ipfshash = await fetch('https://pushservice.curve.fi/pinipfs', {
					method: 'POST',
					headers: {
						'Content-type': 'application/json',
					},
					body: JSON.stringify({
						text: this.description,
					})
				})

				ipfshash = await ipfshash.json()
				ipfshash = 'ipfs:' + ipfshash.ipfsHash

				console.log(ipfshash, "IPFS HASH")

				let intent
				try {
					intent = await state.org.appIntent(this.selectedApp.address.toLowerCase(), 'newVote(bytes,string,bool,bool)', ['0x00000001', ipfshash, false, false])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				state.transactionIntent = paths

				this.loading = false
				state.showModal = false

				this.showRootModal = true


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
	.votingescrow {
		margin-top: 0.4em;
	}
</style>