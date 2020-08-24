<template>
	<div>
		<fieldset>
			<legend>Vote on Voting Escrow</legend>
			<div>
				<div class='actions'>
					<div>
						<fieldset>
							<legend>
								commit_transfer_ownership
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Commit transfer ownership
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>addr:</label>
									<input id='param1' type='text' v-model='owner_addr'>
								</div>
								<button @click="propose('commit_transfer_ownership', owner_addr)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'commit_transfer_ownership'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								commit_smart_wallet_checker
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Commit smart wallet checker
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>addr:</label>
									<input id='param1' type='text' v-model='checker_addr'>
								</div>
								<button @click="propose('commit_smart_wallet_checker', checker_addr)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'commit_smart_wallet_checker'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								apply_transfer_ownership
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Apply transfer ownership
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('apply_transfer_ownership')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'apply_transfer_ownership'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								apply_smart_wallet_checker
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Apply smart wallet checker
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('apply_smart_wallet_checker')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'apply_smart_wallet_checker'"></span>
								</button>
							</div>
						</fieldset>
					</div>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { contract } from '../../../contract'
	import allabis from '../../../allabis'

	import * as daoabis from '../allabis'

	import { getVote, state, getters, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, OWNERSHIP_AGENT, PARAMETER_AGENT } from '../voteStore'

	export default {
		data: () => ({
			owner_addr: '',
			checker_addr: '',

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
			proposeLoading() {
				return state.proposeLoading
			},
		},

		methods: {
			async mounted() {
				
			},

			async propose(method, ...params) {

				this.$emit('makeCall', 'votingescrow', method, params, daoabis.votingescrow_address, OWNERSHIP_AGENT, OWNERSHIP_APP_ADDRESS)
				
				// console.log(daoabis.votingescrow_abi, "VOTING ESCROW ABI")
				// let abi = daoabis.votingescrow_abi.find(abi => abi.name == method)
				// console.log(abi, "THE ABI", method, "THE METHOD")
				// console.log([...params], "PARAMS")
				// let natspeckey = Object.keys(daoabis.votingescrow_natspec.methods).find(key => key.includes(method))
				// console.log(natspeckey, "NATSPECKEY")
				// let expression = daoabis.votingescrow_natspec.methods[natspeckey].notice
				// let call = web3.eth.abi.encodeFunctionCall(abi, [...params])
				// console.log(abi, call, "ABI CALL")


				// // let agent_abi = daoabis.agent_abi.find(abi => abi.name == 'execute')
				// // let agentcall = web3.eth.abi.encodeFunctionCall(agent_abi, [this.poolProxy._address, 0, call])

				// let agent = OWNERSHIP_AGENT
				// let votingApp = OWNERSHIP_APP_ADDRESS
				// // if(parameter_actions.includes(method)) {
				// // 	agent = PARAMETER_AGENT
				// // 	votingApp = PARAMETER_APP_ADDRESS
				// // }
				// agent = agent.toLowerCase()

				// let intent
				// try {
				// 	intent = await state.org.appIntent(agent, 'execute(address,uint256,bytes)', [daoabis.votingescrow_address, 0, call])
				// }
				// catch(err) {
				// 	console.error(err)
				// }
				// let paths = await intent.paths(contract.default_account)

				// console.log(paths, "THE PATHS")

				// state.transactionIntent = paths

				// this.proposeLoading = false

				// this.$emit('call', method, [...params], call, abi, expression)

			},

			shortenAddress(address) {
				if(!address) return ''
				return address.slice(0,6) + '...' + address.slice(-6)
			},
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	select.tvision {
		box-shadow: none
	}
	.actions {
		margin-top: 1em;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		grid-gap: 1em;
	}
	.actions > div {
		flex: 1;
	}
	.input {
		margin-top: 1em;
	}
	.input input {
		margin-top: 0.4em;
	}
	.actions > div button {
		margin-top: 1em;
	}
</style>