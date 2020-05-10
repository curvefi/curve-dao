<template>
	<div class='window white'>
		<div class='tokens' v-for='token of ycTokens'>
			
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
					this.ycTokens[i].maxBalanceUnderlying = ubal;
					this.ycTokens[i].maxBalance = bal;
				})
			})
		},
	}
</script>

<style>
	
</style>
