<template>
	<div>
		<fieldset>
			<legend>Vote on gauge</legend>
			<div>
				<!-- <div>
					<select class='tvision' v-model='selectedPool'>
						<option v-for='pool in allPools' :value='pool'>
							{{ pool.pool }}
						</option>
					</select>
				</div> -->
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
									<input id='param1' type='text' v-model='addr'>
								</div>
								<button @click="propose('commit_transfer_ownership', addr)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'commit_transfer_ownership'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								add_type
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Add type
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>_name:</label>
									<input id='param1' type='text' v-model='name'>
								</div>
								<div class='input'>
									<label for='param1'>weight:</label>
									<input id='param1' type='text' v-model='weight'>
								</div>
								<button @click="propose('add_type', name, weight)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'add_type'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div v-show='n_gauge_types > 0'>
						<fieldset>
							<legend>
								add_gauge
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Add gauge
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>addr:</label>
									<input id='param1' type='text' v-model='gauge_addr'>
								</div>
								<div class='input'>
									<label for='param1'>gauge_type:</label>
									<select class='tvision' v-model='selectedGaugeType'>
										<option v-for='(type, i) in gauge_type_names' :value='i'>
											{{ type }}
										</option>
									</select>
								</div>
								<div class='input'>
									<label for='param1'>gauge_weight:</label>
									<input id='param1' type='text' v-model='add_gauge_weight'>
								</div>
								<button @click="propose('add_gauge', gauge_addr, selectedGaugeType, add_gauge_weight)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'add_gauge'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div v-show='n_gauge_types > 0'>
						<fieldset>
							<legend>
								change_type_weight
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Change type weight
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>type_id:</label>
									<select class='tvision' v-model='selectedGaugeTypeId'>
										<option v-for='(type, i) in gauge_type_names' :value='i'>
											{{ type }}
										</option>
									</select>
								</div>
								<div class='input'>
									<label for='param1'>gauge_weight:</label>
									<input id='param1' type='text' v-model='change_type_gauge_weight'>
								</div>
								<button @click="propose('change_type_weight', selectedGaugeTypeId, change_type_gauge_weight)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'change_type_weight'"></span>
								</button>
							</div>
						</fieldset>
					</div>
					<div v-show='n_gauge_types > 0'>
						<fieldset>
							<legend>
								change_gauge_weight
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Change gauge weight
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>addr:</label>
									<select class='tvision' v-model='selectedGaugeAddress'>
										<option v-for='(address, i) in gauges' :value='address'>
											{{ shortenAddress(address) }}
										</option>
									</select>
								</div>
								<div class='input'>
									<label for='param1'>gauge_weight:</label>
									<input id='param1' type='text' v-model='change_gauge_weight'>
								</div>
								<button @click="propose('change_gauge_weight', selectedGaugeAddress, change_gauge_weight)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'change_gauge_weight'"></span>
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

	export default {
		data: () => ({
			gaugeController: null,
			n_gauge_types: 0,
			gauge_type_names: [],
			selectedGaugeType: 0,
			selectedGaugeTypeId: 0,

			n_gauges: 0,
			gauges: [],
			selectedGaugeAddress: 0,

			selectedPool: null,

			addr: '',

			name: '',
			weight: '',

			gauge_addr: '',
			gauge_type: '',
			add_gauge_weight: '',
			change_type_gauge_weight: '',
			change_gauge_weight: '',

			gaugesNames: {
			  "0x0000000000000000000000000000000000000000": 'Select a gauge',
			  "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575": 'compound',
			  "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53": 'usdt',
			  "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1": 'y',
			  "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840": 'busd',
			  "0x64E3C23bfc40722d3B649844055F1D51c1ac041d": 'pax',
			  "0xB1F2cdeC61db658F091671F5f199635aEF202CAC": 'ren',
			  "0xA90996896660DEcC6E997655E065b23788857849": 'susdv2',
			  "0x705350c4BcD35c9441419DdD5d2f097d7a55410F": 'sbtc',
			},

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
				this.selectedPool = this.allPools[0]

				this.gaugeController = new web3.eth.Contract(daoabis.gaugecontroller_abi, daoabis.gaugecontroller_address)

				let calls = [
					[this.gaugeController._address, this.gaugeController.methods.n_gauge_types().encodeABI()],
					[this.gaugeController._address, this.gaugeController.methods.n_gauges().encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('address', hex))

				this.n_gauge_types = +decoded[0]
				this.n_gauges = +decoded[1]

				calls = Array.from(Array(this.n_gauge_types), (_, i) => [this.gaugeController._address, this.gaugeController.methods.gauge_type_names(i).encodeABI()])
				calls = calls.concat(Array.from(Array(this.n_gauges), (_, i) => [this.gaugeController._address, this.gaugeController.methods.gauges(i).encodeABI()]))

				aggcalls = await contract.multicall.methods.aggregate(calls).call()
				decoded = aggcalls[1].slice(0, aggcalls[1].length)
											.map((hex, i) => 
												i < this.n_gauge_types ? web3.eth.abi.decodeParameter('string', hex) : web3.eth.abi.decodeParameter('address', hex))

				this.gauge_type_names = decoded.slice(0, this.n_gauge_types)
				this.gauges = decoded.slice(this.n_gauge_types)
				this.gauges.unshift("0x0000000000000000000000000000000000000000")
				
				this.selectedGaugeAddress = this.gauges[0]
			},

			async propose(method, ...params) {

				// let abi = daoabis.gaugecontroller_abi.find(abi => abi.name == method)
				// let natspeckey = Object.keys(daoabis.gaugecontroller_natspec.methods).find(key => key.includes(method))
				// let expression = daoabis.gaugecontroller_natspec.methods[natspeckey].notice
				// let call = web3.eth.abi.encodeFunctionCall(abi, [...params])
				// console.log(abi, call, "ABI CALL")

				let methodsWithParams = ['add_type', 'add_gauge', 'change_type_weight', 'change_gauge_weight']

				if(methodsWithParams.includes(method))
					params[params.length-1] *= 1e18

				this.$emit('makeCall', 'gaugecontroller', method, params, this.gaugeController._address, OWNERSHIP_AGENT, OWNERSHIP_APP_ADDRESS)


				// let agent_abi = daoabis.agent_abi.find(abi => abi.name == 'execute')
				// let agentcall = web3.eth.abi.encodeFunctionCall(agent_abi, [this.gaugeController._address, 0, call])

				// let agent = OWNERSHIP_AGENT
				// let votingApp = OWNERSHIP_APP_ADDRESS
				// // if(parameter_actions.includes(method)) {
				// // 	agent = PARAMETER_AGENT
				// // 	votingApp = PARAMETER_APP_ADDRESS
				// // }
				// agent = agent.toLowerCase()

				// let calldata = voteHelpers.encodeCallsScript([{ to: agent, data: agentcall}])

				// let intent
				// try {
				// 	intent = await state.org.appIntent(votingApp.toLowerCase(), 'newVote(bytes,string,bool,bool)', [calldata, 'ipfs:hash', false, false])
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
				if(address ==  '0x0000000000000000000000000000000000000000') return 'Select a gauge'
				return this.gaugesNames[address] + ' ' + address.slice(0,6) + '...' + address.slice(-6)
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