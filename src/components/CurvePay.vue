<template>
	<div class='white window'>
		<fieldset>
			<legend>Pay in USD with Curve tokens</legend>
			<div class='paycontainer'>
					<div class='inputcontainer'>
						<label for='payamount'>Amount in USD:</label>
						<input type='text' :style = "{backgroundColor: bgColor}" v-model='amount' id='payamount'>
					</div>
					<select class='tvision' v-model = 'token' >
						<option v-for = '(v, i) in tokenNames' :value='v'>{{v}} {{balances[i] && '$' + (balances[i] * virtual_prices[i] / 1e36).toFixed(2)}}</option>
					</select>
					<div id='balance' @click='setMaxBalance'>
						Balance: {{(currentBalance / 1e36 ).toFixed(2)}}$
					</div>

				<div class='flex-break'></div>
				<div>
					Amount in {{token}}: 
					<span :class="{'loading line': crvAmount == null}"> 
						<span v-show='crvAmount != null'> {{crvAmount}} </span>
					</span>
				</div>
				<div class='flex-break'></div>
				<label for='address'>Address:</label>
				<input type='text' v-model='to' id='address'>
				<button id='submit' @click='pay'>Pay</button>
			</div>
		</fieldset>
	</div>
</template>

<script>
    import { getters, contract as contract, gas as contractGas} from '../contract'
    import allabis, { ERC20_abi } from '../allabis'
    import BN from 'bignumber.js'

    import * as helpers from '../utils/helpers'

	export default {
		data: () => ({
			token: 'cCrv',
			tokenNames: ['cCrv', 'tCrv', 'yCrv', 'bCrv', 'sCrv', 'pCrv', 'renCrv', 'sbtcCrv'],
			tokens: [],
			contracts: [],
			swaps: [],
			balances: [],
			virtual_prices: [],
			amount: '0.00',
			maxAmount: null,
			to: null,
			bgColor: 'blue',
		}),
		watch: {
			amount() {
				this.highlight_amount();
			},
			token() {
				this.highlight_amount();
			}
		},
		computed: {
			currentBalance() {
				let index = this.tokenNames.indexOf(this.token)
				return (this.balances[index] * this.virtual_prices[index]) || 0
			},
			crvAmount() {
				let index = this.tokenNames.indexOf(this.token)
				if(!this.virtual_prices[index]) return null;
				let maxAmount = BN(this.amount).div(BN(this.virtual_prices[index]).div(1e18)).toFixed(2);
				return maxAmount;
			},
			abis() {
				return Object.keys(allabis).filter(pool => pool != 'susd' && pool != 'y' && pool != 'tbtc');
			},
		},
		mounted() {
			contract.default_account && contract.multicall && this.mounted();
		},
		created() {
			this.$watch(() => contract.default_account && contract.multicall, (val) => {
				if(!val) return;
				this.mounted();
			})
			let poolParam = this.$route.params.pool;
			if(poolParam == 'y') poolParam = 'iearn'
			if(poolParam) {
				let tokenIndex = Object.keys(allabis).filter(pool => pool != 'y' && pool != 'susd' && pool != 'tbtc').indexOf(poolParam)
				this.token = this.tokenNames[tokenIndex]
			}
		},
		methods: {
			async mounted() {
				this.contracts = this.abis.map(pool => new contract.web3.eth.Contract(ERC20_abi, allabis[pool].token_address))
				this.swaps = this.abis.map(pool => new contract.web3.eth.Contract(allabis[pool].swap_abi, allabis[pool].swap_address))
				this.updateBalances();
			},
			async pay() {
				let index = this.tokenNames.indexOf(this.token)
				let payAmount = BN(this.amount).times(1e18).div(BN(this.virtual_prices[index])).times(1e18).toFixed(0, 1);
				if(this.maxAmount.minus(BN(this.amount).times(1e36)).div(1e36).lt(BN(0.01))) {
					payAmount = this.maxAmount.div(BN(this.virtual_prices[index]))
				}
				let allowance = await this.contracts[index].methods.allowance(contract.default_account, this.to).call()
				await this.contracts[index].methods.transfer(this.to, BN(payAmount).toFixed(0,1))
						.send({
							from: contract.default_account,
							gas: 100000,
						})
				this.updateBalances()
			},
			async updateBalances() {
				let calls = this.abis.flatMap((pool, i) => {
					return [
						[allabis[pool].token_address, this.contracts[i].methods.balanceOf(contract.default_account).encodeABI()],
						[allabis[pool].swap_address, this.swaps[i].methods.get_virtual_price().encodeABI()]
					]
				})
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
				this.balances = decoded.filter((_, i) => i % 2 == 0)
				this.virtual_prices = decoded.filter((_, i) => i % 2 != 0)
			},
			highlight_amount() {
				let index = this.tokenNames.indexOf(this.token)
				this.maxAmount = BN(this.balances[index]).times(BN(this.virtual_prices[index]));
				if(BN(this.amount).times(BN(1e36)).gt(this.maxAmount)) this.bgColor = 'red'
				else this.bgColor = 'blue'
			},
			setMaxBalance() {
				this.amount = Math.floor((this.currentBalance / 1e36) * 100) / 100;
			},
		},
	}
</script>

<style scoped>
	fieldset {
		padding-top: 20px;
		padding-bottom: 20px;
	}
	legend {
		text-align: center;
	}
	.paycontainer {
		display: flex;
		flex-wrap: wrap;
	}
	.paycontainer select {
		margin-left: 0.5em;
	}
	#payamount {
		max-width: 10em;
		margin-left: 3px;
	}
	#submit {
		margin-top: 10px;
	}
	#submit {
		margin-left: 3px;
	}
	.flex-break {
		flex-basis: 100%;
		height: 0;
		margin-top: 10px;
	}
	#balance {
		margin-left: 7px;
		align-self: center;
		cursor: pointer;
	}
	#balance:hover {
		text-decoration: underline;
	}
	select {
		box-shadow: none;
	}

</style>