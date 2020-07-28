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

		<router-link to='/dao'>← Back</router-link>

		<div class='votetypes'>
			<button @click='type=0' :class="{'simplebutton': type==0}">Pool Vote</button>
			<button @click='type=1' :class="{'simplebutton': type==1}">Gauge Vote</button>
			<button @click='type=2' :class="{'simplebutton': type==2}">Emergency Member</button>
			<button @click='type=3' :class="{'simplebutton': type==3}">VotingEscrow</button>
			<button @click='type=4' :class="{'simplebutton': type==4}">PoolProxy</button>
		</div>

		<component :is='voteComponent' class='votecomponent' @showRootModal='emitShowRootModal' @call='describeCall'></component>

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
		},

		mixins: [RootModalMixin],

		data: () => ({
			poolProxy: null,
			votingEscrow: null,
			gaugeController: null,

			type: 0,

			description: '',

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
				this.describeMethod = method
				this.describeParams = params

				console.log(abi, calldata, expression, "RADSPEC")

				let desc = await radspec.evaluate(expression, {
					abi: [abi],
					transaction: {
						data: calldata,
					},
				}, radspecFormat)

				this.description = desc
				this.showRootModal = true
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
</style>