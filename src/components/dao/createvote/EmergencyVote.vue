<template>
	<div>
		<fieldset>
			<legend>Vote on Emergency Members</legend>
			<div>
				<div class='actions'>
					<div>
						<fieldset>
							<legend>
								mint
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Mint Emergency Tokens to
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>address:</label>
									<input id='param1' type='text' v-model='mintaddress'>
								</div>
								<button :disabled='hasTokens' @click="propose('mint', mintaddress)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'mint'"></span>
								</button>
								<div class='simple-error' v-show='hasTokens'>
									Address is already a token holder
								</div>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>
								burn
								<span class='tooltip'> [?]
									<span class='tooltiptext long'>
										Burn Emergency Tokens
									</span>
								</span>
							</legend>
							<div>
								<div class='input'>
									<label for='param1'>address:</label>
									<select class='tvision' v-model='burnaddress'>
										<option v-for='(address, i) in addresses' :value='address'>
											{{ shortenAddress(address) }}
										</option>
									</select>
								</div>
								<button @click="propose('burn', burnaddress)" class='simplebutton'>
									Submit
									<span class='loading line' v-show="proposeLoading == 'burn'"></span>
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

	import { TokenManager } from '@aragon/connect-thegraph-tokens'



	let emergencyToken_address = '0x4c0947b16fb1f755a2d32ec21a0c4181f711c500'
	let emergencyTokenManager_address = '0xc96ca8785ba0eeb8ab56bc5d4855a5e871f82e5d'

	const tokenManager = new TokenManager(
	  emergencyTokenManager_address,
	  'https://api.thegraph.com/subgraphs/name/aragon/aragon-tokens-mainnet'
	)

	export default {
		data: () => ({
			addresses: [],
			mintaddress: '',
			burnaddress:'',
			
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
			hasTokens() {
				return this.addresses.find(address => address.toLowerCase() == this.mintaddress.toLowerCase()) !== undefined
			},
			proposeLoading() {
				return state.proposeLoading
			},
		},

		methods: {
			async mounted() {
				// let transfers = await web3.eth.getPastLogs({
				// 	fromBlock: '6775877',
				// 	toBlock: 'latest',
				// 	address: emergencyToken_address,
				// 	topics: [
				// 		'0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
				// 	],
				// })
				// console.log(transfers, "THE TRANSFERS")
				// let mints = transfers.filter(transfer => transfer.topics[1] == '0x0000000000000000000000000000000000000000000000000000000000000000')
				// mints = mints.map(mint => mint.topics[2])
				// let mintCounts = {}
				// mints.forEach(x => mintCounts[x] = (mintCounts[x] || 0)+1);
				// let burns = transfers.filter(transfer => transfer.topics[1] != '0x0000000000000000000000000000000000000000000000000000000000000000')
				// burns = burns.map(burn => burn.topics[1])
				// let burnCounts = {}
				// burns.forEach(x => burnCounts[x] = (burnCounts[x] || 0)+1)
				// Object.keys(mintCounts).map(address => mintCounts[address] -= burnCounts[address] || 0)
				// Object.keys(mintCounts).map(address => mintCounts[address] == 0 && delete mintCounts[address])
				// mintCounts = Object.keys(mintCounts).map(key => '0x' + key.slice(26))
				// this.addresses = mintCounts

				// console.log(tokenManager, "TOKEN MANAGER")

				let tokenholders = await tokenManager._connector.tokenHolders(emergencyToken_address, 1000, 0)
				this.addresses = tokenholders.map(tokenholder => tokenholder.address)
			},

			async propose(method, ...params) {
				//this.$emit('call', method, params)
				this.$emit('makeCall', 'tokenmanager', method, [...params, 1], emergencyToken_address, OWNERSHIP_AGENT, OWNERSHIP_APP_ADDRESS)

				// let abi = daoabis.tokenmanager_abi.find(abi => abi.name == method)
				// console.log(daoabis, "NATSPEC")
				// let natspeckey = Object.keys(daoabis.tokenmanager_natspec.methods).find(key => key.includes(method))
				// let expression = daoabis.tokenmanager_natspec.methods[natspeckey].notice
				// console.log([...params], "PARAMS")
				// let call = web3.eth.abi.encodeFunctionCall(abi, [...params, 1])
				// console.log(abi, call, "ABI CALL")

				// let agent_abi = daoabis.agent_abi.find(abi => abi.name == 'execute')
				// let agentcall = web3.eth.abi.encodeFunctionCall(agent_abi, [emergencyToken_address, 0, call])

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

				// this.$emit('call', method, params, call, abi, expression)

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