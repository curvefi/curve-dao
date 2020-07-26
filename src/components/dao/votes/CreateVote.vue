<template>
	<div class='window white'>
		<root-modal v-if='showRootModal'></root-modal>

		<div class='votetypes'>
			<button @click='type=0'>Pool Vote</button>
			<button @click='type=1'>Gauge Vote</button>
			<button @click='type=2'>Emergency Member</button>
		</div>

		<component :is='voteComponent'></component>

	</div>
</template>

<script>
	import { contract } from '../../../contract'
	import allabis from '../../../allabis'

	import * as daoabis from '../allabis'

	import { getVote, state, getters } from '../voteStore'

	import { helpers as voteHelpers, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, OWNERSHIP_AGENT, PARAMETER_AGENT } from '../voteStore'

	import RootModal from '../common/RootModal'

	import { Fragment } from 'vue-fragment'

	import PoolVote from '../createvote/PoolVote'
	import GaugeVote from '../createvote/GaugeVote'
	import EmergencyVote from '../createvote/EmergencyVote'

	let ownership_actions = ['unkill_me', 'commit_transfer_ownership', 'revert_transfer_ownership', 'set_aave_referral', 'donate_admin_fees']

	let parameter_actions = ['commit_new_parameters', 'revert_new_parameters', 'commit_new_fee', 'apply_new_fee', 'ramp_A', 'stop_ramp_A']

	export default {
		components: {
			RootModal,
			Fragment,
			PoolVote,
			GaugeVote,
			EmergencyVote,
		},

		data: () => ({
			poolProxy: null,
			votingEscrow: null,
			gaugeController: null,

			type: 0,

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
			showRootModal() {
				return state.showRootModal
			},
			voteComponent() {
				if(this.type == 0) return 'PoolVote'
				if(this.type == 1) return 'GaugeVote'
				if(this.type == 2) return 'EmergencyVote'
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

			async propose(method, ...params) {
				this.proposeLoading = method

				let abi = daoabis.poolproxy_abi.find(abi => abi.name == method)
				console.log(['0x47A63DDe77f6b1B0c529f39bF8C9D194D76E76c4', ...params], "PARAMS")
				let call = web3.eth.abi.encodeFunctionCall(abi, ['0x47A63DDe77f6b1B0c529f39bF8C9D194D76E76c4', ...params])
				console.log(abi, call, "ABI CALL")

				let agent_abi = daoabis.agent_abi.find(abi => abi.name == 'execute')
				let agentcall = web3.eth.abi.encodeFunctionCall(agent_abi, [this.poolProxy._address, 0, call])

				let agent = OWNERSHIP_AGENT
				let votingApp = OWNERSHIP_APP_ADDRESS
				if(parameter_actions.includes(method)) {
					agent = PARAMETER_AGENT
					votingApp = PARAMETER_APP_ADDRESS
				}
				agent = agent.toLowerCase()

				let intent
				try {
					intent = await state.org.appIntent(agent, 'execute(address,uint256,bytes)', [this.poolProxy._address, 0, call])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				console.log(paths, "THE PATHS")

				state.transactionIntent = paths

				this.proposeLoading = false

				state.showRootModal = true

			},
		},
	}
</script>

<style scoped>
	.votetypes button {
		margin-right: 1em;
	}
</style>