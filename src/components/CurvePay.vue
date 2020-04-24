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
						<option v-for = 'v in tokenNames' :value='v'>{{v}}</option>
					</select>
					<div id='balance'>Balance: {{(currentBalance / 1e36 ).toFixed(2)}}$</div>

				<div class='flex-break'></div>
				<div>Amount in {{token}}: {{crvAmount}}</div>
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
			tokenNames: ['cCrv', 'tCrv', 'yCrv', 'bCrv', 'sCrv'],
			tokens: [],
			contracts: [],
			swaps: [],
			balances: [],
			virtual_prices: [],
			amount: '0.00',
			to: null,
			bgColor: 'blue'
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
				let maxAmount = BN(this.amount).div(BN(this.virtual_prices[index]).div(1e18)).toFixed(2);
				return maxAmount;
			}
		},
		mounted() {
			contract.default_account && contract.multicall && this.mounted();
		},
		created() {
			this.$watch(() => contract.default_account && contract.multicall, (val) => {
				if(!val) return;
				this.mounted();
			})
		},
		methods: {
			async mounted() {
				let abis = Object.keys(allabis).filter(pool => pool != 'susd' && pool != 'y');
				this.contracts = abis.map(pool => new web3.eth.Contract(ERC20_abi, allabis[pool].token_address))
				this.swaps = abis.map(pool => new web3.eth.Contract(allabis[pool].swap_abi, allabis[pool].swap_address))
				this.updateBalances();
			},
			async pay() {
				let index = this.tokenNames.indexOf(this.token)
				let payAmount = BN(this.amount).times(1e18).div(BN(this.virtual_prices[index])).times(1e18).toFixed(0, 1);
				let allowance = await this.contracts[index].methods.allowance(contract.default_account, this.to).call()
				await this.contracts[index].methods.transfer(this.to, payAmount)
						.send({
							from: contract.default_account,
							gas: 100000,
						})
				this.updateBalances()
			},
			async updateBalances() {
				let abis = Object.keys(allabis).filter(pool => pool != 'susd' && pool != 'y');
				let calls = abis.flatMap((pool, i) => {
					return [
						[allabis[pool].token_address, this.contracts[i].methods.balanceOf(contract.default_account).encodeABI()],
						[allabis[pool].swap_address, this.swaps[i].methods.get_virtual_price().encodeABI()]
					]
				})
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				this.balances = decoded.filter((_, i) => i % 2 == 0)
				this.virtual_prices = decoded.filter((_, i) => i % 2 != 0)
			},
			highlight_amount() {
				let index = this.tokenNames.indexOf(this.token)
				let maxAmount = BN(this.balances[index]).times(BN(this.virtual_prices[index]));
				console.log(+maxAmount, 'max amount')
				if(BN(this.amount).times(BN(1e36)).gt(maxAmount)) this.bgColor = 'red'
				else this.bgColor = 'blue'
			}
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
	}
	select {
		box-shadow: none;
	}

</style>