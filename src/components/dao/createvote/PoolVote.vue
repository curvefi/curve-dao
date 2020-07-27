<template>
	<div>
		<fieldset>
			<legend>Vote on pool</legend>
			<div>
				<div>
					<select class='tvision' v-model='selectedPool'>
						<option v-for='pool in allPools' :value='pool'>
							{{ pool.pool }}
						</option>
					</select>
				</div>
				<div class='actions'>
					<div v-show='!doesRampUp'>
						<fieldset>
							<legend>
								commit_new_parameters
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Commit new parameters
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>A:</label>
									<input id='param1' type='text' v-model='A'>
								</div>
								<div class='input'>
									<label for='param1'>new_commit_fee:</label>
									<input id='param1' type='text' v-model='new_commit_fee'>
								</div>
								<div class='input'>
									<label for='param1'>new_commit_admin_fee:</label>
									<input id='param1' type='text' v-model='new_commit_admin_fee'>
								</div>
								<button @click="propose('commit_new_parameters', A, new_commit_fee, new_commit_admin_fee)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'commit_new_parameters'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div v-show='doesRampUp'>
						<fieldset>
							<legend>
								commit_new_fee
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Commit new fee
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>new_fee:</label>
									<input id='param1' type='text' v-model='new_fee'>
								</div>
								<div class='input'>
									<label for='param1'>new_admin_fee:</label>
									<input id='param1' type='text' v-model='new_admin_fee'>
								</div>
								<button @click="propose('commit_new_fee', new_fee, new_admin_fee)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'commit_new_fee'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div v-show='doesRampUp'>
						<fieldset>
							<legend>
								ramp_A
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Ramp A
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>future_A:</label>
									<input id='param1' type='text' v-model='future_A'>
								</div>
								<div class='input'>
									<label for='param1'>future_time:</label>
									<input id='param1' type='text' v-model='future_time'>
								</div>
								<button @click="propose('ramp_A', future_A, future_time)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'ramp_A'"></span>
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
								withdraw_admin_fees
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Withdraw admin fees
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('withdraw_admin_fees')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'withdraw_admin_fees'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<!-- <div>
						<fieldset>
							<legend>
								kill_me
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Kill pool
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('kill_me')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'kill_me'"></span>
								</button>
							</div>
						</fieldset>
					</div> -->
					<div>
						<fieldset>
							<legend>
								unkill_me
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Unkill pool
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('unkill_me')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'unkill_me'"></span>
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
					<div v-show='!doesRampUp'>
						<fieldset>
							<legend>
								apply_new_parameters
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Apply transfer ownership
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('apply_new_parameters')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'apply_new_parameters'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div v-show='doesRampUp'>
						<fieldset>
							<legend>
								apply_new_fee
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Apply transfer ownership
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('apply_new_fee')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'apply_new_fee'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div v-show='doesRampUp'>
						<fieldset>
							<legend>
								stop_ramp_A
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Stop ramp A
									</span>
								</span>
							</legend>
							<div>
								<button @click="propose('stop_ramp_A')" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'stop_ramp_A'"></span>
								</button>
							</div>
						</fieldset>
					</div>
				<div>
					<fieldset>
						<legend>
							revert_new_parameters
							<span class='tooltip'> [?]
								<span class='tooltiptext long'>
									Revert transfer ownership
								</span>
							</span>
						</legend>
						<div>
							<button @click="propose('revert_new_parameters')" class='simplebutton'>
								Submit
								<span class='loading line' v-show="proposeLoading == 'revert_new_parameters'"></span>
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

	import { getVote, state, getters, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, OWNERSHIP_AGENT, PARAMETER_AGENT, helpers as voteHelpers } from '../voteStore'

	let ownership_actions = ['unkill_me', 'commit_transfer_ownership', 'revert_transfer_ownership', 'set_aave_referral', 'donate_admin_fees']

	let parameter_actions = ['commit_new_parameters', 'revert_new_parameters', 'commit_new_fee', 'apply_new_fee', 'ramp_A', 'stop_ramp_A']

	export default {
		data: () => ({
			poolProxy: null,

			selectedPool: null,

			new_owner: '',

			commit_transfer_ownership: '',
			A: '',
			new_commit_fee: '',
			new_commit_admin_fee: '',

			new_fee: '',
			new_admin_fee: '',
			future_A: '',
			future_time: '',

			proposeLoading: false,
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
		},

		methods: {
			async mounted() {
				this.selectedPool = this.allPools[0]

				this.poolProxy = new web3.eth.Contract(daoabis.poolproxy_abi, daoabis.poolproxy_address)
			},

			async propose(method, ...params) {
				this.proposeLoading = method


				let abi = daoabis.poolproxy_abi.find(abi => abi.name == method)
				let natspeckey = Object.keys(daoabis.poolproxy_natspec.methods).find(key => key.includes(method))
				let expression = daoabis.poolproxy_natspec.methods[natspeckey].notice
				console.log(['0x47A63DDe77f6b1B0c529f39bF8C9D194D76E76c4', ...params], "PARAMS")
				let call = web3.eth.abi.encodeFunctionCall(abi, ['0x47A63DDe77f6b1B0c529f39bF8C9D194D76E76c4', ...params])
				console.log(abi, call, "ABI CALL")

				this.$emit('call', method, ['0x47A63DDe77f6b1B0c529f39bF8C9D194D76E76c4', ...params], call, abi, expression)

				let agent_abi = daoabis.agent_abi.find(abi => abi.name == 'execute')
				let agentcall = web3.eth.abi.encodeFunctionCall(agent_abi, [this.poolProxy._address, 0, call])


				let agent = OWNERSHIP_AGENT
				let votingApp = OWNERSHIP_APP_ADDRESS
				if(parameter_actions.includes(method)) {
					agent = PARAMETER_AGENT
					votingApp = PARAMETER_APP_ADDRESS
				}
				agent = agent.toLowerCase()

				console.log(agent, "THE AGENT")
				console.log(this.poolProxy._address, call, "POOL PROXY ADDRESS CALL DATA")

				let calldata = voteHelpers.encodeCallsScript([{ to: agent, data: agentcall}])

				let intent
				try {
					intent = await state.org.appIntent(votingApp.toLowerCase(), 'newVote(bytes,string,bool,bool)', [calldata, 'ipfs:hash', false, false])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				console.log(paths, "THE PATHS")

				state.transactionIntent = paths

				this.proposeLoading = false

				this.$emit('showRootModal')

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