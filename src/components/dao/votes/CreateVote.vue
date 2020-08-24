<template>
	<div class='window white'>
		<div id='modal' class='modal rootmodal' v-if='showRootModal' @click.self='hideRootModal'>

			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideRootModal'>
						[<span class='greentext'>■</span>]
					</div>
					<legend v-show='!executeVote'>Create a vote on {{ appName }}</legend>
					<legend v-show='executeVote'>Execute a vote on {{ appName }}</legend>
					<div class='content'>
						<div>
							<span> {{ voteDescription }} </span>
							<div>
								{{ textdescription }}
							</div>
							<p v-html = 'description'></p>
						</div>
						<hr>
						<p class='explanation' v-show='!executeVote'>
							This vote requires {{ getSupportText }}% acceptance and {{ getQuorumText }}% quorum to be passed
						</p>
						<p class='simple-error' v-show='!willSucceed'>
							The transaction may fail, you may not have the required permissions to make the transaction
						</p>
					</div>
					<button @click='createVote' v-show='!executeVote'>Create Vote</button>
					<button @click='createVote' v-show='executeVote'>Vote</button>
				</fieldset>
			</div>
		</div>

		<div id='modal' class='modal rootmodal' v-if='showDescriptionModal' @click.self='hideDescriptionModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideDescriptionModal'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Add description</legend>
					<div class='content'>
						<label for='textdescription'>Description:</label>
						<textarea id='textdescription' v-model='textdescription'></textarea>
						<button @click='submitVote'>Create Vote <span class='loading line' v-show='loadingVote'></span></button>
					</div>
				</fieldset>
			</div>
		</div>

		<router-link to='/dao'>← Back</router-link>

		<div class='votetypes'>
			<button @click='type=0' :class="{'simplebutton': type==0}">Pool Vote</button>
			<button @click='type=1' :class="{'simplebutton': type==1}">Gauge Vote</button>
			<button @click='type=2' :class="{'simplebutton': type==2}">Emergency Member</button>
			<button @click='type=3' :class="{'simplebutton': type==3}">VotingEscrow</button>
			<button @click='type=4' :class="{'simplebutton': type==4}">PoolProxy</button>
			<button @click='type=5' :class="{'simplebutton': type==5}">Registry</button>
			<button @click='type=6' :class="{'simplebutton': type==6}">Vesting</button>
		</div>

		<component :is='voteComponent' class='votecomponent' @showRootModal='emitShowRootModal' @makeCall='makeCall'></component>

	</div>
</template>

<script>
	import { contract } from '../../../contract'
	import allabis from '../../../allabis'

	import * as daoabis from '../allabis'

	import { getVote, state, getters } from '../voteStore'

	import { helpers as voteHelpers, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, OWNERSHIP_AGENT, PARAMETER_AGENT } from '../voteStore'

	import * as radspec from 'radspec'

	const radspecFormat = {
		userHelpers: {
			address: () => async (address, prefix) => {
				if(!prefix) prefix = ''
				return {
					type: 'string',
					value: '<br> ' + prefix + ' ' + voteHelpers.shortenAddress(address),
				}
			},
			param: () => async (param, name) => {
				if(!name) name = ''
				return {
					type: 'string',
					value: '<br> ' + name + ':' + param,
				}
			},
		}
	}

	import RootModal from '../common/RootModal'

	import { Fragment } from 'vue-fragment'

	import PoolVote from '../createvote/PoolVote'
	import GaugeVote from '../createvote/GaugeVote'
	import EmergencyVote from '../createvote/EmergencyVote'
	import VotingEscrowVote from '../createvote/VotingEscrowVote'
	import PoolProxyVote from '../createvote/PoolProxyVote'
	import RegistryVote from '../createvote/RegistryVote'
	import VestingVote from '../createvote/VestingVote'

	let ownership_actions = ['unkill_me', 'commit_transfer_ownership', 'revert_transfer_ownership', 'set_aave_referral', 'donate_admin_fees']

	let parameter_actions = ['commit_new_parameters', 'revert_new_parameters', 'commit_new_fee', 'apply_new_fee', 'ramp_A', 'stop_ramp_A']

	import RootModalMixin from '../common/RootModalMixin'

	export default {
		components: {
			RootModal,
			Fragment,
			PoolVote,
			GaugeVote,
			EmergencyVote,
			VotingEscrowVote,
			PoolProxyVote,
			RegistryVote,
			VestingVote,
		},

		mixins: [RootModalMixin],

		data: () => ({
			poolProxy: null,
			votingEscrow: null,
			gaugeController: null,

			type: 0,

			description: '',

			call: {},

			showDescriptionModal: false,
			textdescription: '',

			loadingVote: false,

		}),

		async created() {
			this.$watch(() => contract.default_account && state.initialized, val => {
				if(val) this.mounted()
			}, {
				immediate: true,
			})
		},

		computed: {
			allPools() {
				return Object.keys(allabis)
						.filter(pool => pool != 'y' && pool != 'susd' && pool != 'tbtc')
						.map(pool => ({ pool: pool, address: allabis[pool].swap_address, abi: allabis[pool].swap_abi }))
			},
			doesRampUp() {
				if(!this.selectedPool)
					return false
				console.log(Object.values(this.selectedPool.abi).map(abi => abi.name), "ABI")
				return Object.values(this.selectedPool.abi).map(abi => abi.name).includes('ramp_A')
			},
			voteComponent() {
				if(this.type == 0) return 'PoolVote'
				if(this.type == 1) return 'GaugeVote'
				if(this.type == 2) return 'EmergencyVote'
				if(this.type == 3) return 'VotingEscrowVote'
				if(this.type == 4) return 'PoolProxyVote'
				if(this.type == 5) return 'RegistryVote'
				if(this.type == 6) return 'VestingVote'
				return 'PoolVote'
			},
		},

		methods: {
			async mounted() {
				this.selectedPool = this.allPools[0]

				this.poolProxy = new web3.eth.Contract(daoabis.poolproxy_abi, daoabis.poolproxy_address)
				this.votingEscrow = new web3.eth.Contract(daoabis.votingescrow_abi, daoabis.votingescrow_address)
				this.gaugeController = new web3.eth.Contract(daoabis.gaugecontroller_abi, daoabis.gaugecontroller_address)
			},
			emitShowRootModal() {
				this.showRootModal = true
			},
			async describeCall(method, params, calldata, abi, expression) {

				console.log(method, abi, calldata, expression, "RADSPEC")

				let desc = await radspec.evaluate(expression, {
					abi: [abi],
					transaction: {
						data: calldata,
					},
				}, radspecFormat)

				this.description = desc
				this.showRootModal = true
			},
			async hideDescriptionModal() {
				this.showDescriptionModal = false
				this.textdescription = ''
			},
			async submitVote() {
				this.loadingVote = true

				state.proposeLoading = method


				let ipfshash = await fetch('https://pushservice.curve.fi/pinipfs', {
					method: 'POST',
					headers: {
						'Content-type': 'application/json',
					},
					body: JSON.stringify({
						text: this.textdescription,
					})
				})

				ipfshash = await ipfshash.json()
				ipfshash = 'ipfs:' + ipfshash.ipfsHash

				let { abiname, method, params, contractAddress, agent, voteApp } = this.call

				let abi = daoabis[abiname+'_abi'].find(abi => abi.name == method)
				console.log(abiname, method)
				let natspeckey = Object.keys(daoabis[abiname+'_natspec'].methods).find(key => key.includes(method))
				console.log(natspeckey, "NATSPEC")
				let expression = daoabis[abiname+'_natspec'].methods[natspeckey].notice
				console.log(params, "PARAMS")
				console.log(abi, "ABI CALL")
				console.log(method)
				let call = web3.eth.abi.encodeFunctionCall(abi, params)
				console.log(call, "CALL")


				let agent_abi = daoabis.agent_abi.find(abi => abi.name == 'execute')
				let agentcall = web3.eth.abi.encodeFunctionCall(agent_abi, [contractAddress, 0, call])


				agent = agent.toLowerCase()
				voteApp = voteApp.toLowerCase()

				console.log(agent, "THE AGENT")
				console.log(contractAddress, call, "CONTRACT ADDRESS CALL DATA")

				let calldata = voteHelpers.encodeCallsScript([{ to: agent, data: agentcall}])

				let intent
				try {
					intent = await state.org.appIntent(voteApp, 'newVote(bytes,string,bool,bool)', [calldata, ipfshash, false, false])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				this.loadingVote = false
				this.showDescriptionModal = false
				state.transactionIntent = paths

				let desc = await radspec.evaluate(expression, {
					abi: [abi],
					transaction: {
						data: call,
					},
				}, radspecFormat)

				this.description = desc
				this.showRootModal = true

				state.proposeLoading = null


				console.log(paths, "THE PATHS")
			},
			async makeCall(abiname, method, params, contractAddress, agent, voteApp, ipfshash = '') {
				this.call = {
					abiname,
					method,
					params,
					contractAddress,
					agent,
					voteApp,
					ipfshash,
				}
				this.showDescriptionModal = true
			},
		},
	}
</script>

<style scoped>
	.votetypes button {
		margin-top: 1em;
		margin-right: 1em;
	}
	.votecomponent {
		margin-top: 1em;
	}
	.modal-content .content {
		text-align: left;
		color: black;
	}
</style>