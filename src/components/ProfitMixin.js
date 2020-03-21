import * as common from '../utils/common.js'
import { getters, contract as currentContract } from '../contract'
import { makeCancelable } from '../utils/helpers'

import BigNumber from 'bignumber.js'
var cBN = (val) => new BigNumber(val);

export default {
	data: () => ({
		addliquidityTopic: '0x26f55a85081d24974e85c6c00045d0f0453991e95873f52bff0d21af4079a768',
		removeliquidityTopic: '0x7c363854ccf79623411f8995b362bce5eddff18c927edc6f5dbbb5e05819a82c',
		removeliquidityImbalanceTopic: '0x2b5508378d7e19e0d5fa338419034731416c4f5b219a10379956f764317fd47e',
	}),
	computed: {
		fromBlock() {
			if(this.currentPool == 'compound') return '0x91c86f'
			if(this.currentPool == 'usdt') return '0x904a9c'
			return '0x909964'
		},
		decodeParameters() {
			return [`uint256[${this.N_COINS}]`,`uint256[${this.N_COINS}]`, 'uint256', 'uint256']
		},
		decodeParametersWithdrawal() {
			return [`uint256[${this.N_COINS}]`,`uint256[${this.N_COINS}]`, 'uint256']
		},
		decodeParametersWithdrawal1() {
			return [`uint256[${this.N_COINS}]`,`uint256[${this.N_COINS}]`, 'uint256', 'uint256']
		},
	},
	methods: {
		async mounted() {
	        common.update_fee_info();
	        this.BN = web3.utils.toBN
	        this.CURVE = currentContract.swap_address;
	        this.CURVE_TOKEN = currentContract.token_address;


			let subdomain = this.currentPool
			if(subdomain == 'iearn') subdomain = 'y'
	        let res = await fetch(`https://${subdomain}.curve.fi/stats.json`);
	        this.priceData = await res.json();
	        for(let i = 0; i < currentContract.N_COINS; i++) {
		        let symbol = await currentContract.coins[i].methods.symbol().call()
		        this.ADDRESSES[symbol] = currentContract.coins[i]._address;
		    }

		    this.deposits = await makeCancelable(this.getDeposits());
		    this.withdrawals = await makeCancelable(this.getWithdrawals());
		    let available = 0;
	        let promises = [];
	        for(let curr of Object.keys(this.ADDRESSES)) {
	            promises.push(this.getAvailable(curr))
	        }
	        let prices = await Promise.all(promises);
	        
	        this.available = await makeCancelable(this.calculateAvailable(prices));
	    },

	    beforeDestroy() {
	    	console.log("HEREEEEEEE")
	    	this.deposits.cancel()
	    	this.withdrawals.cancel();
	    	this.available.cancel();
	    },

	    async calculateAvailable(prices) {
	    	let available = 0;
	    	for(let i = 0; i < prices.length; i++) {
	            let curr = Object.keys(this.ADDRESSES)[i]
	             if(curr == 'USDT') {
	                available += this.fromNativeCurrent(curr, prices[i])
	            }
	            else {
		            const exchangeRate = await web3.eth.call({
		                to: this.ADDRESSES[curr],
		                data: '0xbd6d894d',
		            });
		            available += this.fromNativeCurrent(curr,
		                this.BN(exchangeRate)
		                .mul(this.BN(prices[i]))
		                .div(this.BN(1e8))
		            );
	        	}
	        }
	        return available
	    },

	    convertValues(curr, exchangeRate, value) {
		    if(curr == 'cDAI') exchangeRate*=1e8
		    if(curr == 'cUSDC') exchangeRate*=1e20
		    return this.BN(exchangeRate).mul(BN(value))
		},

		fromNativeCurrent(curr, value) {
		    if(curr == 'cDAI') return value.div(this.BN(1e10)).div(this.BN(1e16)).toNumber();
		    if(curr == 'cUSDC') {
		        return value.div(this.BN(1e14)).toNumber();
		    }
	        if(curr == 'USDT') {
				return value.divRound(this.BN(1e4)).toNumber();
			}
			const decimals = ['yUSDC', 'yUSDT'].includes(curr) ? 6 : 18;
		    if (decimals === 18) {
		        return Number(web3.utils.fromWei(value.toFixed(0)));
		    }
		    return value.toNumber() / 10 ** decimals;
		},
		async convertValuesCurrent(curr) {
		    const usdPool = await web3.eth.call({
		        to: ADDRESSES[curr],
		        data: '0x7137ef99',
		    });
		    const tokensSupply = await web3.eth.call({
		        to: ADDRESSES[curr],
		        data: '0x18160ddd',
		    });
		    return value => {
		        return this.fromNativeCurrent(
		            curr,
		            this.BN(usdPool)
		                .mul(BN(value))
		                .div(BN(tokensSupply))
		                .mul(BN(100))
		        );
		    };
		},
		findClosest(timestamp) {
		    let dates = this.priceData.data.find(d=>d[0] - timestamp > 0);
		    return dates;
		},
	    fromNative(curr, value) {
		    return value.divRound(this.BN(1e16)).toNumber()
		},
	    async checkExchangeRateBlocks(block, address, direction) {
		    let fromBlock = '0x'+parseInt(block-100).toString(16)
		    let toBlock = '0x'+parseInt(block).toString(16)
		    if(direction == 1) {
		        fromBlock = '0x'+parseInt(block).toString(16)
		        toBlock = '0x'+parseInt(block+100).toString(16)
		    }
		    if(direction == 0) {
		        fromBlock = '0x'+parseInt(block-1).toString(16)
		        toBlock = '0x'+parseInt(block+1).toString(16)
		    }
		    let mints = await web3.eth.getPastLogs({
		        fromBlock: fromBlock,
		        toBlock: toBlock,
		        address: address,
		        //web3.utils.sha3('Mint(address,uint256,uint256)')
		        topics: [
		            '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
		        ],
		    });
		    if(mints.length) {
		        let mint = mints[0]
		        let mintevent = web3.eth.abi.decodeParameters(['address','uint256','uint256'], mint.data)
		        let exchangeRate = this.BN(mintevent[1]).div(this.BN(mintevent[2]));
		        if(address == currentContract.coins[1]._address) {
		            exchangeRate = this.BN(mintevent[1]).mul(this.BN(1e12)).div(this.BN(mintevent[2]))
		        }
		        if(direction == 0) return exchangeRate
		        return {blockNumber: mint.blockNumber, exchangeRate: exchangeRate};
		    }
		    return false;
		},
	    async getExchangeRate(blockNumber, address, value, type) {
		    let exchangeRate = await this.checkExchangeRateBlocks(blockNumber, address, 0);
		    let exchangeRatePast, exchangeRateFuture;
		    let currentBlock = await web3.eth.getBlockNumber();
		    let pastCurrentBlock = false;
		    if(exchangeRate === false) {
		        let i = blockNumber;
		        let j = blockNumber;
		        while((exchangeRatePast = await this.checkExchangeRateBlocks(i, address, -1, type)) === false) {
		            i-=100;
		        }
		        while((exchangeRateFuture = await this.checkExchangeRateBlocks(j, address, 1, type)) === false) {
		            if(j > currentBlock) {
		                pastCurrentBlock = true;
		                break;
		            }
		            j+=100;
		        }

		        while(pastCurrentBlock) {
		            let i = blockNumber - 200;
		            let j = blockNumber - 100;
		            while((exchangeRatePast = await this.checkExchangeRateBlocks(i, address, -1, type)) === false) {
		                i-=200;
		            }
		            while((exchangeRateFuture = await this.checkExchangeRateBlocks(j, address, -1, type)) === false) {
		                if(j > currentBlock) {
		                    pastCurrentBlock = true;
		                    break;
		                }
		                j-=100;
		            }
		            if(exchangeRatePast.blockNumber && exchangeRateFuture.blockNumber) pastCurrentBlock = false;
		        }

		        if(exchangeRatePast.blockNumber == exchangeRateFuture.blockNumber) {
		            return exchangeRatePast.exchangeRate;
		        }

		        if(web3.utils.isBN(exchangeRateFuture.exchangeRate)) {
		        	exchangeRateFuture.exchangeRate = exchangeRateFuture.exchangeRate.toNumber()
		        	exchangeRatePast.exchangeRate = exchangeRatePast.exchangeRate.toNumber()
		        }

		        exchangeRate = (exchangeRateFuture.blockNumber - exchangeRatePast.blockNumber)*(exchangeRateFuture.exchangeRate-(exchangeRatePast.exchangeRate))
		        exchangeRate = exchangeRate / ((exchangeRateFuture.blockNumber - exchangeRatePast.blockNumber))
		        exchangeRate = exchangeRate + (exchangeRatePast.exchangeRate)
		    }

		    if(exchangeRate.exchangeRate) exchangeRate = exchangeRate.exchangeRate
		    return exchangeRate;
		},

		async calculateAmount(cTokens, block, type) {
		    let amount = 0;
		    for(let i = 0; i < currentContract.N_COINS; i++) {
		            const tokens = this.BN(cTokens[i]);
		            if(tokens == 0) continue;
		            const tokenIndex = Object.values(this.ADDRESSES)[i]
		            let curr = Object.keys(this.ADDRESSES)[i]
		            let address = currentContract.coins[i]._address
		          	if(['iearn','busd'].includes(currentContract.currentContract)) address = currentContract.underlying_coins[i]._address
		            let exchangeRate = await this.getExchangeRate(block, address, '', type)
		            let usd;
		          	if(currentContract.currentContract == 'usdt' && i ==2) {
			            	usd = BN(tokens).div(BN(1e4)).toNumber();
		          	}
		          	if(['iearn','busd'].includes(currentContract.currentContract)) {
		          		if(i == 0 || i == 3) tokens /= 1e16;
		          		else tokens /= 1e4
		          		usd = tokens * exchangeRate
		          	}
		          	else {
		            	usd = this.fromNative(curr, this.BN(exchangeRate).mul(this.BN(tokens)))
		          	}
		            amount += usd;
		    }
		    return amount;
		},

	    async getDeposits() {
		    let default_account = currentContract.default_account
		    default_account = default_account.substr(2).toLowerCase();

		    let depositUsdSum = 0;

		    let fromBlock = this.fromBlock;
		    if(localStorage.getItem(this.currentPool + 'dversion') == this.version && localStorage.getItem(this.currentPool + 'lastDepositBlock') && localStorage.getItem(this.currentPool + 'lastAddress') == default_account) {
		        let block = +localStorage.getItem(this.currentPool + 'lastDepositBlock')
		        fromBlock = '0x'+parseInt(block+1).toString(16)
		        depositUsdSum += +localStorage.getItem(this.currentPool + 'lastDeposits')
		    }

		    const poolTokensReceivings = await web3.eth.getPastLogs({
		        fromBlock: fromBlock,
		        toBlock: 'latest',
		        address: this.CURVE_TOKEN,
		        topics: [
		            this.TRANSFER_TOPIC,
		            [],
		            '0x000000000000000000000000' + default_account,
		        ],
		    });

		    console.log(poolTokensReceivings)

		    var lastBlock = poolTokensReceivings.length && poolTokensReceivings[poolTokensReceivings.length-1].blockNumber || fromBlock

		    const txs = poolTokensReceivings.map(e => e.transactionHash);
		    console.time('timer')
		    for (const hash of txs) {
		        const receipt = await web3.eth.getTransactionReceipt(hash);
		        let timestamp = (await web3.eth.getBlock(receipt.blockNumber)).timestamp;
		        console.log(timestamp)
		        let addliquidity = receipt.logs.filter(log=>log.topics[0] == '0x26f55a85081d24974e85c6c00045d0f0453991e95873f52bff0d21af4079a768')
		        if(addliquidity.length) {
		            let cTokens = (web3.eth.abi.decodeParameters(this.decodeParameters, addliquidity[0].data))[0]
		            depositUsdSum += await this.calculateAmount(cTokens, receipt.blockNumber, 'deposit')
		        }
		        else {
		            let transfer = receipt.logs.filter(log=>log.topics[0] == this.TRANSFER_TOPIC && log.topics[2] == '0x000000000000000000000000' + default_account)
		            let tokens = +transfer[0].data
		            let exchangeRate = this.findClosest(timestamp)[1]
		            depositUsdSum += tokens*exchangeRate/1e16
		        }
		    }
		    console.timeEnd('timer')
		    localStorage.setItem(this.currentPool + 'lastDepositBlock', lastBlock);
		    localStorage.setItem(this.currentPool + 'lastAddress', default_account)
		    localStorage.setItem(this.currentPool + 'lastDeposits', depositUsdSum);
		    localStorage.setItem(this.currentPool + 'dversion', this.version);
		    return depositUsdSum;
		},

		async getWithdrawals(address) {
		    let default_account = currentContract.default_account
		    default_account = default_account.substr(2).toLowerCase();
		    let withdrawals = 0;
		    let fromBlock = this.fromBlock;
		    if(localStorage.getItem(this.currentPool + 'wversion') == this.version && localStorage.getItem(this.currentPool + 'lastWithdrawalBlock') && localStorage.getItem(this.currentPool + 'lastAddress') == default_account) {
		        let block = +localStorage.getItem(this.currentPool + 'lastWithdrawalBlock')
		        fromBlock = '0x'+parseInt(block+1).toString(16)
		        withdrawals += +localStorage.getItem(this.currentPool + 'lastWithdrawals')
		    }
		    const logs = await web3.eth.getPastLogs({
		        fromBlock: fromBlock,
		        toBlock: 'latest',
		        address: currentContract.token_address,
		        topics: [
		            this.TRANSFER_TOPIC,
		            '0x000000000000000000000000' + default_account,
		        ],
		    });

		    var lastBlock = logs.length && logs[logs.length-1].blockNumber || fromBlock



		    for(let log of logs) {
		        const receipt = await web3.eth.getTransactionReceipt(log.transactionHash);
		        let timestamp = (await web3.eth.getBlock(receipt.blockNumber)).timestamp;
		        let removeliquidity = receipt.logs.filter(log=>log.topics[0] == this.removeliquidityTopic)
		        if(removeliquidity.length) {
		            let cTokens = (web3.eth.abi.decodeParameters(this.decodeParametersWithdrawal, removeliquidity[0].data))[0]
		            withdrawals += await this.calculateAmount(cTokens, log.blockNumber)
		            continue;
		        }
		        removeliquidity = receipt.logs.filter(log=>log.topics[0] == this.removeliquidityImbalanceTopic)
		        if(removeliquidity.length) {
		        	let decodeParameters = this.decodeParametersWithdrawal
		        	if(['compound','usdt'].includes(this.currentPool)) {
		        		decodeParameters = this.decodeParametersWithdrawal1
		        	}
		            let decoded = web3.eth.abi.decodeParameters(decodeParameters, removeliquidity[0].data)
		            withdrawals += await this.calculateAmount(decoded[0], log.blockNumber, 'withdrawal')
		        }
		        else {
		            let transfer = receipt.logs.filter(log=>log.topics[0] == this.TRANSFER_TOPIC && log.topics[1] == '0x000000000000000000000000' + default_account)
		            let tokens = +transfer[0].data
		            let exchangeRate = this.findClosest(timestamp)[1]
		            withdrawals += tokens*exchangeRate/1e16
		            localStorage.setItem(this.currentPool + 'lastWithdrawalBlock', lastBlock);
		            localStorage.setItem(this.currentPool + 'lastWithdrawals', withdrawals);
		        }


		    }
		    localStorage.setItem(this.currentPool + 'lastWithdrawalBlock', lastBlock);
		    localStorage.setItem(this.currentPool + 'lastWithdrawals', withdrawals);
		    localStorage.setItem(this.currentPool + 'wversion', this.version);
		    console.log("WITHDRAWALS", withdrawals)
		    return withdrawals;
		},

		async getAvailable(curr) {
		    let default_account = currentContract.default_account
		    default_account = default_account.substr(2).toLowerCase();
		    const tokenAddress = this.ADDRESSES[curr];
		    //balanceOf method
		    const balanceOfCurveContract = await web3.eth.call({
		        to: tokenAddress,
		        data: '0x70a08231000000000000000000000000' + this.CURVE.substr(2),
		    });
		    const poolTokensBalance = await web3.eth.call({
		        to: this.CURVE_TOKEN,
		        data: '0x70a08231000000000000000000000000' + default_account,
		    });
		    //totalSupply
		    const poolTokensSupply = await web3.eth.call({
		        to: this.CURVE_TOKEN,
		        data: '0x18160ddd',
		    });
		    return this.BN(balanceOfCurveContract)
		        .mul(this.BN(poolTokensBalance))
		        .div(this.BN(poolTokensSupply));
		}
	}
}