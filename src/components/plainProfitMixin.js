import * as common from '../utils/common.js'
import { getters, contract as currentContract } from '../contract'
import allabis, { sCurveRewards_abi, sCurveRewards_address } from '../allabis'

import BigNumber from 'bignumber.js'
var cBN = (val) => new BigNumber(val);

export default {
	data: () => ({
		addliquidityTopic: '0x3f1915775e0c9a38a57a7bb7f1f9005f486fb904e1f84aa215364d567319a58d',
		removeliquidityTopic: '0xb964b72f73f5ef5bf0fdc559b2fab9a7b12a39e47817a547f1f0aee47febd602',
		removeliquidityImbalanceTopic: '0x9878ca375e106f2a43c3b599fc624568131c4c9a4ba66a14563715763be9d59d',
		earned: null,
		paidRewards: null,
		profitTotalStake: null,
		snxPrice: null,
	}),

	async mounted() {
		if(currentContract.default_account && currentContract.multicall) this.getSNXRewards()
	},

	async created() {
		this.$watch(() => currentContract.default_account && currentContract.multicall, val => val && this.getSNXRewards())
	},

	computed: {
		totalShare() {
			return getters.totalShare();
		},

		getStakedBalance() {
			return currentContract.totalStake * 100
		},

		getStakedBalanceUSD() {
			return currentContract.curveStakedBalance * currentContract.virtual_price / 1e18
		},

		showEarned() {
			if(this.showinUSD) return (+this.earned * this.snxPrice).toFixed(2)
			return +this.earned.toFixed(2)
		},

		showRewards() {
			if(this.showinUSD) return (+this.paidRewards * this.snxPrice).toFixed(2)
			return +this.paidRewards.toFixed(2)
		},
	},

	methods: {


		async getSNXRewards() {
			let request = await fetch('https://api.coinpaprika.com/v1/tickers/hav-havven')
			let snxPrice = await request.json();
			this.snxPrice = snxPrice.quotes.USD.price;

			let curveRewards = new currentContract.web3.eth.Contract(sCurveRewards_abi, sCurveRewards_address)
			let calls = [
				[curveRewards._address, curveRewards.methods.earned(currentContract.default_account).encodeABI()],
				[curveRewards._address, curveRewards.methods.balanceOf(currentContract.default_account).encodeABI()],
				[curveRewards._address, curveRewards.methods.userRewardPerTokenPaid(currentContract.default_account).encodeABI()],
			]
			let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
			let decoded = aggcalls[1].map(hex => currentContract.web3.eth.abi.decodeParameter('uint256', hex))
			this.earned = +decoded[0] / 1e18
			this.profitTotalStake = +decoded[1] / 1e18
			let rewardLogs = await currentContract.web3.eth.getPastLogs({
				fromBlock: '0x975bfa',
				//old fromBlock: '0x932641',
				toBlock: 'latest',
				//SNX CurveRewards
				address: '0xdcb6a51ea3ca5d3fd898fd6564757c7aaec3ca92',
				//old address: '0x13B54E8271B3e45cE71D8f4fC73eA936873a34fC',
				topics: [
					//sha3('RewardPaid(address,uint256)')
					'0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486',
					'0x000000000000000000000000' + currentContract.default_account.slice(2),
					//'0x000000000000000000000000f3ae3bbdeb2fb7f9c32fbb1f4fbdaf1150a1c5ce',
				]
			})
			let rewards = rewardLogs.map(log=>currentContract.web3.eth.abi.decodeParameter('uint256', log.data) / 1e18).reduce((a, b) => a + b, 0)
			this.paidRewards = rewards
		},

		async getExchangeRate() {
			return 1;
		},

	    async checkExchangeRateBlocks(block, address, direction, type = 'deposit') {
		    return 1;
		},

/*		async calculateAmount(cTokens, block, type) {
		    let amount = 0;
		    for(let i = 0; i < currentContract.N_COINS; i++) {
	            let tokens = cTokens[i];
		        if(tokens == 0) continue;
		        console.log(i)
		        let usd = await this.getExchangeRate(block, currentContract.underlying_coins[i]._address, '', type)
		        if(i == 0 || i == 3) tokens /= 1e16
		        else tokens /= 1e4
		        console.log(tokens, "TOKENS", usd, "EXCHANGE RATE", tokens * usd, "USD")
		        amount += tokens * usd;
 
		    }
		    return amount;
		},*/
	}
}