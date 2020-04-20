import * as common from '../utils/common.js'
import { getters, contract as currentContract } from '../contract'

import BigNumber from 'bignumber.js'
var cBN = (val) => new BigNumber(val);

export default {
	data: () => ({
		addliquidityTopic: '0x3f1915775e0c9a38a57a7bb7f1f9005f486fb904e1f84aa215364d567319a58d',
		removeliquidityTopic: '0xb964b72f73f5ef5bf0fdc559b2fab9a7b12a39e47817a547f1f0aee47febd602',
		removeliquidityImbalanceTopic: '0x9878ca375e106f2a43c3b599fc624568131c4c9a4ba66a14563715763be9d59d',
	}),

	methods: {

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