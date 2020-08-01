<template>
	<div>
		<fieldset>
			<legend>Vote on Pool Proxy</legend>
			<div>
				<div class='actions'>
					<div>
						<fieldset>
							<legend>
								fund_individual
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Fund individual
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_recipient:</label>
									<input id='param1' type='text' v-model='recipient'>
								</div>
								<div class='input'>
									<label for='param1'>_amount:</label>
									<input id='param1' type='text' v-model='amount'>
								</div>
								<div class='input'>
									<label for='param1'>start_time:</label>
									<input id='param1' type='text' v-model='start_time'>
								</div>
								<div class='input'>
									<label for='param1'>_time:</label>
									<input id='param1' type='text' v-model='init_time'>
								</div>
								<div class='input'>
									<input id='can_disable' type='checkbox' v-model='can_disable'>
									<label for='can_disable'>_can_disable:</label>
								</div>
								<button @click="propose('fund_individual', recipient, amount, start_time, init_time, can_disable)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'fund_individual'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								toggle_disable
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Toggle disable
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_recipient:</label>
									<input id='param1' type='text' v-model='toggle_recipient'>
								</div>
								<button @click="propose('toggle_disable', toggle_recipient)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'toggle_recipient'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								disable_can_disable
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Disable can disable
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_recipient:</label>
									<input id='param1' type='text' v-model='notdisable_recipient'>
								</div>
								<button @click="propose('disable_can_disable', notdisable_recipient)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'disable_can_disable'"></span>
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

			recipient: '',
			amount: '',
			start_time: '',
			init_time: '',
			can_disable: false,

			toggle_recipient: '',

			notdisable_recipient: '',

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
				this.$emit('makeCall', 'vesting', method, params, daoabis.vesting_address, OWNERSHIP_AGENT, OWNERSHIP_APP_ADDRESS)

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