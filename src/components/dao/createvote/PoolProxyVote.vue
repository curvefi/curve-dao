<template>
	<div>
		<fieldset>
			<legend>Vote on Pool Proxy</legend>
			<div>
				<div class='actions'>
					<div>
						<fieldset>
							<legend>
								commit_set_admins
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Commit set admins
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>ownership_admin:</label>
									<input id='param1' type='text' v-model='ownership_admin'>
								</div>
								<div class='input'>
									<label for='param1'>parameter_admin:</label>
									<input id='param1' type='text' v-model='parameter_admin'>
								</div>
								<div class='input'>
									<label for='param1'>emergency_admin:</label>
									<input id='param1' type='text' v-model='emergency_admin'>
								</div>
								<button @click="propose('commit_set_admins', ownership_admin, parameter_admin, emergency_admin)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'commit_set_admins'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								set_burner
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Set burner
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_token:</label>
									<input id='param1' type='text' v-model='set_burner_token'>
								</div>
								<div class='input'>
									<label for='param1'>_burner:</label>
									<input id='param1' type='text' v-model='set_burner_address'>
								</div>
								<button @click="propose('set_burner', set_burner_token, set_burner_address)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'set_burner'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								apply_set_admins
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Apply set admins
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('apply_set_admins')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'apply_set_admins'"></span>
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
			ownership_admin: '',
			parameter_admin: '',
			emergency_admin: '',

			set_burner_token: '',
			set_burner_address: '',

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
				this.$emit('makeCall', 'poolproxy', method, params, daoabis.poolproxy_address, OWNERSHIP_AGENT, OWNERSHIP_APP_ADDRESS)

				// let abi = daoabis.poolproxy_abi.find(abi => abi.name == method)
				// console.log([...params], "PARAMS")
				// console.log(abi, "THE ABI")
				// let natspeckey = Object.keys(daoabis.poolproxy_natspec.methods).find(key => key.includes(method))
				// let expression = daoabis.poolproxy_natspec.methods[natspeckey].notice
				// let call = web3.eth.abi.encodeFunctionCall(abi, [...params])
				// console.log(abi, call, "ABI CALL")


				// let agent_abi = daoabis.agent_abi.find(abi => abi.name == 'execute')
				// let agentcall = web3.eth.abi.encodeFunctionCall(agent_abi, [daoabis.poolproxy_address, 0, call])

				// let agent = OWNERSHIP_AGENT
				// let votingApp = OWNERSHIP_APP_ADDRESS
				// // if(parameter_actions.includes(method)) {
				// // 	agent = PARAMETER_AGENT
				// // 	votingApp = PARAMETER_APP_ADDRESS
				// // }
				// agent = agent.toLowerCase()

				// console.log([daoabis.poolproxy_address, 0, call], "EXECUTE PARAMS")

				// let intent
				// try {
				// 	intent = await state.org.appIntent(agent, 'execute(address,uint256,bytes)', [daoabis.poolproxy_address, 0, call])
				// }
				// catch(err) {
				// 	console.error(err)
				// }
				// let paths = await intent.paths(contract.default_account)

				// console.log(paths, "THE PATHS")

				// state.transactionIntent = paths

				// this.proposeLoading = false

				// this.$emit('call', method, ['0x47A63DDe77f6b1B0c529f39bF8C9D194D76E76c4', ...params], call, abi, expression)

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