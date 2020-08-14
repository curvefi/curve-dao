<template>
	<div>
		<fieldset>
			<legend>Vote on Pool Proxy</legend>
			<div>
				<div class='actions'>
					<div>
						<fieldset>
							<legend>
								add_pool
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Add pool
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_pool:</label>
									<input id='param1' type='text' v-model='add_pool'>
								</div>
								<div class='input'>
									<label for='param1'>_n_coins:</label>
									<input id='param1' type='text' v-model='add_n_coins'>
								</div>
								<div class='input'>
									<label for='param1'>_lp_token:</label>
									<input id='param1' type='text' v-model='add_lp_token'>
								</div>
								<div class='input'>
									<label for='param1'>_calculator:</label>
									<input id='param1' type='text' v-model='add_calculator'>
								</div>
								<div class='input'>
									<label for='param1'>_rate_method_id:</label>
									<input id='param1' type='text' v-model='add_rate_method_id'>
								</div>
								<div class='input'>
									<label for='param1'>_decimals:</label>
									<input id='param1' type='text' v-model='add_decimals'>
								</div>
								<div class='input'>
									<label for='param1'>_underlying_decimals:</label>
									<input id='param1' type='text' v-model='add_underlying_decimals'>
								</div>
								<div class='input'>
									<input id='add_has_initial_A' type='checkbox' v-model='add_has_initial_A'>
									<label for='add_has_initial_A'>_has_initial_A:</label>
								</div>
								<button @click="propose('commit_set_admins', add_pool, add_n_coins, add_lp_token, add_calculator, add_rate_method_id, add_decimals, add_underlying_decimals, add_has_initial_A)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'add_pool'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								add_pool_without_underlying
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Add pool without underlying
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_pool:</label>
									<input id='param1' type='text' v-model='add_pool_pool'>
								</div>
								<div class='input'>
									<label for='param1'>_n_coins:</label>
									<input id='param1' type='text' v-model='add_pool_n_coins'>
								</div>
								<div class='input'>
									<label for='param1'>_lp_token:</label>
									<input id='param1' type='text' v-model='add_pool_lp_token'>
								</div>
								<div class='input'>
									<label for='param1'>_calculator:</label>
									<input id='param1' type='text' v-model='add_pool_calculator'>
								</div>
								<div class='input'>
									<label for='param1'>_rate_method_id:</label>
									<input id='param1' type='text' v-model='add_pool_rate_method_id'>
								</div>
								<div class='input'>
									<label for='param1'>_decimals:</label>
									<input id='param1' type='text' v-model='add_pool_decimals'>
								</div>
								<div class='input'>
									<label for='param1'>_use_rates:</label>
									<input id='param1' type='text' v-model='add_pool_use_rates'>
								</div>
								<div class='input'>
									<label for='param1'>_has_initial_A:</label>
									<input id='param1' type='text' v-model='add_pool_has_initial_A'>
								</div>
								<button @click="propose('add_pool_without_underlying', add_pool_pool, add_pool_n_coins, add_pool_lp_token, add_pool_calculator, add_pool_rate_method_id, add_pool_decimals, add_pool_use_rates, add_pool_has_initial_A)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'add_pool'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								remove_pool
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Remove pool
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_pool:</label>
									<input id='param1' type='text' v-model='remove_pool'>
								</div>
								<button @click="propose('remove_pool', remove_pool)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'remove_pool'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								set_returns_none
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Set returns none
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_addr:</label>
									<input id='param1' type='text' v-model='set_returns_addr'>
								</div>
								<div class='input'>
									<label for='param1'>_is_returns_none:</label>
									<input id='param1' type='text' v-model='set_is_returns_none'>
								</div>
								<button @click="propose('set_burner', set_returns_addr, set_is_returns_none)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'set_returns_none'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								set_gas_estimate_contract
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Set gas estimate contract
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_pool:</label>
									<input id='param1' type='text' v-model='gas_pool'>
								</div>
								<div class='input'>
									<label for='param1'>_estimator:</label>
									<input id='param1' type='text' v-model='gas_estimator'>
								</div>
								<button @click="propose('set_gas_estimate_contract', gas_pool, gas_estimator)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'set_returns_none'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								set_calculator
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Set calculator contract
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_pool:</label>
									<input id='param1' type='text' v-model='calculator_pool'>
								</div>
								<div class='input'>
									<label for='param1'>_calculator:</label>
									<input id='param1' type='text' v-model='calculator_estimator'>
								</div>
								<button @click="propose('set_gas_estimate_contract', calculator_pool, calculator_estimator)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'set_returns_none'"></span>
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
									<label for='param1'>new_owner:</label>
									<input id='param1' type='text' v-model='new_owner'>
								</div>
								<button @click="propose('commit_transfer_ownership', new_owner)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'commit_transfer_ownership'"></span>
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
								revert_transfer_ownership
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Revert transfer ownership
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('revert_transfer_ownership')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'revert_transfer_ownership'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								claim_token_balance
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Claim token balance
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_token:</label>
									<input id='param1' type='text' v-model='claim_token'>
								</div>
								<button @click="propose('claim_token_balance', _token)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'claim_token_balance'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								claim_eth_balance
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Claim ETH balance
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('claim_eth_balance')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'claim_eth_balance'"></span>
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
			add_pool: '',
			add_n_coins: '',
			add_lp_token: '',
			add_calculator: '',
			add_rate_method_id: '',
			add_decimals: '',
			add_underlying_decimals: '',
			add_has_initial_A: false,
			add_pool_pool: '',
			add_pool_n_coins: '',
			add_pool_lp_token: '',
			add_pool_calculator: '',
			add_pool_rate_method_id: '',
			add_pool_decimals: '',
			add_pool_use_rates: '',
			add_pool_has_initial_A: false,
			remove_pool: '',
			set_returns_addr: '',
			set_is_returns_none: '',
			gas_pool: '',
			gas_estimator: '',
			calculator_pool: '',
			calculator_estimator: '',
			set_burner_token: '',
			set_burner_address: '',
			new_owner: '',
			claim_token: '',
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
				this.$emit('makeCall', 'registry', method, params, daoabis.registry_address, OWNERSHIP_AGENT, OWNERSHIP_APP_ADDRESS)

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