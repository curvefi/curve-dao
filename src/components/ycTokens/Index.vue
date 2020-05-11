<template>
	<div class='window white'>
		<div class='tokens' v-for='(token, i) of ycTokens'>
			<div>
				<div class='maxBalanceContainer' @click='setBalance(i, 0)'>
					<label :for="'token_'+i">
						{{ token.name }}
					</label>
					<span class='maxBalance'> Balance: {{ (token.maxBalance / token.precisions).toFixed(2) }}</span>
				</div>
				<input 
					:id ="'token_'+i" 
					type='text' 
					v-model='token.value' 
					@focus='changeValue(i)' 
					@input='changeValue(i)'
					:style = "{ backgroundColor: bgColors[i] }">
			</div>

			<div>
				<div class='maxBalanceContainer' @click='setBalance(i, 1)'>
					<label :for="'token_'+i">
						{{ token.uname.toUpperCase() }}
					</label>
					<span class='maxBalance'> Balance: {{ (token.maxBalanceUnderlying / token.precisions).toFixed(2) }}</span>
				</div>
				<input 
					:id ="'token_'+i" 
					type='text' 
					v-model='token.uvalue' 
					@focus='changeUValue(i)' 
					@input='changeUValue(i)'
					:style = "{ backgroundColor: ubgColors[i] }">
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue'
	import allabis, { ERC20_abi, yERC20_abi } from '../../allabis'
	import { contract, allCurrencies } from '../../contract'
	import { omit, chunkArr } from '../../utils/helpers'

	export default {
		data: () => ({
			ycTokens: [
				//{	
					//name
					//uName
					//maxBalance,
					//maxBalanceUnderlying
					//interest
					//contract
					//ucontract
					//precisions
				//},
			],
			bgColors: ['blue', 'blue', 'blue'],
			ubgColors: ['blue', 'blue', 'blue'],
		}),
		computed: {
			tokens() {
				return omit('pax', allCurrencies.pax)
			}
		},
		async created() {
			this.$watch(() => contract.web3 && contract.multicall, async val => {
				if(!val) return;
				let i = 0;
				for(let [utoken, token] of Object.entries(this.tokens)) {
					let address = allabis.pax.coins[i];
					let uaddress= allabis.pax.underlying_coins[i];
					let ycontract = new contract.web3.eth.Contract(yERC20_abi, address);
					let ucontract = new contract.web3.eth.Contract(ERC20_abi, uaddress);
					this.ycTokens.push({
						name: token,
						uname: utoken,
						contract: ycontract,
						ucontract: ucontract,
						precisions: allabis.pax.coin_precisions[i],
						value: '0.00',
						uvalue: '0.00',
						bgColor: 'blue',
						ubgColor: 'blue',
					})
					i++;
				}
				let calls = this.ycTokens.flatMap(t => 
					[
						[t.ucontract._address, t.ucontract.methods.balanceOf(contract.default_account).encodeABI()],
						[t.contract._address, t.contract.methods.balanceOf(contract.default_account).encodeABI()],
					]
				)
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let balances = aggcalls[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
				console.log(balances)
				chunkArr(balances, 2).map(([ubal, bal], i) => {
					this.ycTokens[i].maxBalance = bal;
					Vue.set(this.ycTokens, i, Object.assign({}, this.ycTokens[i], { maxBalanceUnderlying: ubal }));
				})
			})
		},
		methods: {
			setBalance(i, n) {
				//n == 0 for token
				//n == 1 for underlying token
				if(n == 0) {
					Vue.set(this.ycTokens, i, Object.assign({}, this.ycTokens[i], { value: 
						(this.ycTokens[i].maxBalance / this.ycTokens[i].precisions).toFixed(2) }))
				}
				if(n == 1) {
					Vue.set(this.ycTokens, i, Object.assign({}, this.ycTokens[i], { uvalue: 
						(this.ycTokens[i].maxBalanceUnderlying / this.ycTokens[i].precisions).toFixed(2) }))
				}
			},
			changeValue(i) {
				if(this.ycTokens[i].value > this.ycTokens[i].maxBalance / this.ycTokens[i].precisions) {
					Vue.set(this.bgColors, i, 'red')
				}
				else Vue.set(this.bgColors, i, 'blue')
			},
			changeUValue(i) {
				if(this.ycTokens[i].uvalue > this.ycTokens[i].maxBalanceUnderlying / this.ycTokens[i].precisions) {
					Vue.set(this.ubgColors, i, 'red')
				}
				else Vue.set(this.ubgColors, i, 'blue')
			}
		}
	}
</script>

<style scoped>
	.tokens {
		width: 80%;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
	}
	.tokens > div {
		margin-right: 3em;
		margin-top: 1em;
		flex: 1;
	}
	.maxBalanceContainer {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.3em;
	}
	.maxBalance {
		text-align: right;
	}
	.maxBalance:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
