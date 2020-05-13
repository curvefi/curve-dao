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

	    async calculateAvailable(prices) {
		    if(this.cancel) throw new Error('cancel');
	    	let available = 0;
	    	for(let i = 0; i < prices.length; i++) {
	            let curr = Object.keys(this.ADDRESSES)[i]
	            
	            const getPricePerFullShare = await currentContract.web3.eth.call({
	                to: this.ADDRESSES[curr],
	                data: '0x77c7b8fc',
	            });

	            available += this.fromNativeCurrent(curr,
	                cBN(getPricePerFullShare)
	                .multipliedBy(cBN(prices[i].toString())
	                .div(1e18))
	            );
	        }
	        return available*100;
	    },

	    async checkExchangeRateBlocks(block, address, direction, type = 'deposit') {
		    let default_account = this.account
		    default_account = default_account.substr(2).toLowerCase();

		    let fromBlock = '0x'+parseInt(block-100).toString(16)
		    let toBlock = '0x'+parseInt(block).toString(16)
		    fromBlock = this.fromBlock
		    if(direction == 1) {
		        fromBlock = '0x'+parseInt(block).toString(16)
		        toBlock = '0x'+parseInt(block+100).toString(16)
		        toBlock = 'latest'
		    }
		    if(direction == 0) {
		        fromBlock = '0x'+parseInt(block-1).toString(16)
		        toBlock = '0x'+parseInt(block+1).toString(16)
		    }
		    let underlying_addresses = currentContract.underlying_coins.map(c=>c._address)
		    let index = underlying_addresses.indexOf(address);
		    let yaddress = Object.values(this.ADDRESSES)[index];
		    let mints;
		    if(type == 'deposit') {
		        mints = await currentContract.web3.eth.getPastLogs({
		            fromBlock: fromBlock,
		            toBlock: toBlock,
		            address: address,
		            //web3provider.utils.sha3('Transfer(address,address,uint256)')
		            topics: [
		                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
		                [],
		                '0x000000000000000000000000' + yaddress.substr(2).toLowerCase()
		            ],
		        });
		    }
		    else {
		        mints = await currentContract.web3.eth.getPastLogs({
		            fromBlock: fromBlock,
		            toBlock: toBlock,
		            address: yaddress,
		            //web3provider.utils.sha3('Transfer(address,address,uint256)')
		            topics: [
		                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
		                '0x0000000000000000000000000000000000000000000000000000000000000000'
		            ],
		        });
		    }
		    //log.data is yDAI, yUSDC, yUSDT, yTUSD
		    console.log(mints)
		    if(mints.length) {
		        let mint = mints[0]
		        if(direction == -1) mint = mints[mints.length-1]
		        console.log(mint)
		        let tr = await currentContract.web3.eth.getTransactionReceipt(mint.transactionHash)
		        if(type=='deposit') {
		            tr = tr.logs.filter(log=>log.address == yaddress && log.topics[1] == '0x0000000000000000000000000000000000000000000000000000000000000000')
		        }
		        else {
		            tr = tr.logs.filter(log=>{
		                return log.address == address && log.topics[0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && log.topics[2] == '0x000000000000000000000000' + yaddress.substr(2).toLowerCase()
		            })
		        }
		        if(!tr.length) return false;
		        var sent = tr[0]

		        console.log(mint, "MINTED", sent, "SENT")

		        var exchangeRate = mint.data/sent.data
		        if(type == 'withdrawal') exchangeRate = sent.data/mint.data;
		        console.log(exchangeRate)
		        return {blockNumber: mint.blockNumber, exchangeRate: exchangeRate};
		    }
		    return false;
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