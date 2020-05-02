import * as common from '../utils/common.js'
import { getters, contract as currentContract } from '../contract'
import { makeCancelable } from '../utils/helpers'

import allabis from '../allabis'

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
			if(this.currentPool == 'susdv2') return '0x9729a6'
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
			try {
		        common.update_fee_info();
		        this.BN = currentContract.web3.utils.toBN
		        this.CURVE = currentContract.swap_address;
		        this.CURVE_TOKEN = currentContract.token_address;


				let subdomain = this.currentPool
				if(subdomain == 'iearn') subdomain = 'y'
				if(subdomain == 'susdv2') subdomain = 'susd'
	        	let res = await fetch(`https://beta.curve.fi/raw-stats/${subdomain}-1m.json`);
	        	res = await res.json();
	        	this.priceData = res
		        for(let i = 0; i < currentContract.N_COINS; i++) {
			        let symbol = await currentContract.coins[i].methods.symbol().call()
			        this.ADDRESSES[symbol] = currentContract.coins[i]._address;
			    }

			    this.deposits = await this.getDeposits();
			    this.withdrawals = await this.getWithdrawals();
			    //this.available = await this.getAvailableBalance()
			    this.available = currentContract.totalShare * 100
			    this.profit = (this.available + this.getStakedBalance()) + this.withdrawals - this.deposits
			}
			catch(err) {
				console.error(err);
				this.clearCache();
			}
	    },

	    getStakedBalance() {
	    	return 0;
	    }, 

	    async getAvailableBalance() {
	    	let available = 0;
	        let promises = [];
	        for(let curr of Object.keys(this.ADDRESSES)) {
	            promises.push(this.getAvailable(curr))
	        }
	        let prices = await Promise.all(promises);
	        
	        return await this.calculateAvailable(prices);
	    },

	    async calculateAvailable(prices) {
	    	let available = 0;
	    	for(let i = 0; i < prices.length; i++) {
	            let curr = Object.keys(this.ADDRESSES)[i]
	             if(['DAI','USDC','USDT','sUSD'].includes(curr)) {
	                available += this.fromNativeCurrent(curr, prices[i])
	            }
	            else {
	            	//exchangeRateCurrent
		            const exchangeRate = await currentContract.web3.eth.call({
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
			if(curr == 'DAI') {
				return value.divRound(this.BN(1e16)).toNumber()
			}
			if(curr == 'USDC' || curr == 'USDT') {
				return value.divRound(this.BN(1e4)).toNumber()
			}
			if(curr == 'sUSD') {
				return value.divRound(this.BN(1e16)).toNumber();
			}
			const decimals = ['yUSDC', 'yUSDT'].includes(curr) ? 6 : 18;
		    if (decimals === 18) {
		        return Number(currentContract.web3.utils.fromWei(value.toFixed(0)));
		    }
		    return value.toNumber() / 10 ** decimals;
		},
		async convertValuesCurrent(curr) {
		    const usdPool = await currentContract.web3.eth.call({
		        to: ADDRESSES[curr],
		        data: '0x7137ef99',
		    });
		    const tokensSupply = await currentContract.web3.eth.call({
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
		    let dates = this.priceData.find(d=>d.timestamp - timestamp > 0);
		    //check if timestamp was before recording, this is only for when timestamp > lastest recorded, get lastest recorded
		    if(!dates.length) return this.priceData[this.priceData.length-1]
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
		    let mints = await currentContract.web3.eth.getPastLogs({
		        fromBlock: fromBlock,
		        toBlock: toBlock,
		        address: address,
		        //currentContract.web3.utils.sha3('Mint(address,uint256,uint256)')
		        topics: [
		            '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
		        ],
		    });
		    if(mints.length) {
		        let mint = mints[0]
		        let mintevent = currentContract.web3.eth.abi.decodeParameters(['address','uint256','uint256'], mint.data)
		        let exchangeRate;
		        if(mintevent[1] == 0 || mintevent[2] == 0) return -1
		        exchangeRate = this.BN(mintevent[1]).div(this.BN(mintevent[2]));
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
		    let currentBlock = await currentContract.web3.eth.getBlockNumber();
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

		        if(currentContract.web3.utils.isBN(exchangeRateFuture.exchangeRate)) {
		        	exchangeRateFuture.exchangeRate = exchangeRateFuture.exchangeRate.toNumber()
		        	exchangeRatePast.exchangeRate = exchangeRatePast.exchangeRate.toNumber()
		        }
	        	if(exchangeRatePast.exchangeRate === undefined || exchangeRateFuture.exchangeRate === undefined) return -1;
		        exchangeRate = (exchangeRateFuture.blockNumber - exchangeRatePast.blockNumber)*(exchangeRateFuture.exchangeRate-(exchangeRatePast.exchangeRate))
		        exchangeRate = exchangeRate / ((exchangeRateFuture.blockNumber - exchangeRatePast.blockNumber))
		        exchangeRate = exchangeRate + (exchangeRatePast.exchangeRate)
		    }
			if(exchangeRate.exchangeRate) exchangeRate = exchangeRate.exchangeRate
		    return exchangeRate;
		},

		async calculateAmount(cTokens, block, type) {
			if(this.cancel) throw new Error('cancel');
		    let amount = 0;
		    for(let i = 0; i < currentContract.N_COINS; i++) {
		            const tokens = this.BN(cTokens[i]);
		            if(tokens == 0) continue;
		            const tokenIndex = Object.values(this.ADDRESSES)[i]
		            let curr = Object.keys(this.ADDRESSES)[i]
		            let address = currentContract.coins[i]._address
		          	if(['iearn','busd'].includes(currentContract.currentContract)) address = currentContract.underlying_coins[i]._address
		            let exchangeRate = await this.getExchangeRate(block, address, '', type)
		        	if(exchangeRate == -1) continue;
		            let usd;
		          	if(currentContract.currentContract == 'usdt' && i ==2) {
		            	usd = BN(tokens).div(BN(1e4)).toNumber();
		          	}
		          	if(['iearn','busd'].includes(currentContract.currentContract)) {
		          		if(i == 0 || i == 3) tokens /= 1e16;
		          		else tokens /= 1e4
		          		usd = tokens * exchangeRate
		          	}
		          	else if(currentContract.currentContract == 'susdv2') {
		            	usd = this.fromNativeCurrent(curr, this.BN(exchangeRate).mul(this.BN(tokens)))	
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
		    default_account = '0x39415255619783A2E71fcF7d8f708A951d92e1b6'
		    default_account = default_account.substr(2).toLowerCase();

		    let depositUsdSum = 0;

		    let fromBlock = this.fromBlock;
		    if(localStorage.getItem(this.currentPool + 'dversion') == this.version && localStorage.getItem(this.currentPool + 'lastDepositBlock') && localStorage.getItem(this.currentPool + 'dlastAddress') == default_account) {
		        let block = +localStorage.getItem(this.currentPool + 'lastDepositBlock')
		        fromBlock = '0x'+parseInt(block+1).toString(16)
		        depositUsdSum += +localStorage.getItem(this.currentPool + 'lastDeposits')
		    }

		    const poolTokensReceivings = await currentContract.web3.eth.getPastLogs({
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
		    	if(this.cancel) throw new Error('cancel');
		        const receipt = await currentContract.web3.eth.getTransactionReceipt(hash);
		        let timestamp = (await currentContract.web3.eth.getBlock(receipt.blockNumber)).timestamp;
		        console.log(timestamp)
		        let addliquidity = receipt.logs.filter(log=>log.topics[0] == this.addliquidityTopic)
		        if(addliquidity.length) {
		            let cTokens = (currentContract.web3.eth.abi.decodeParameters(this.decodeParameters, addliquidity[0].data))[0]
		            depositUsdSum += await this.calculateAmount(cTokens, receipt.blockNumber, 'deposit')
		        }
		        else {
		            let transfer = receipt.logs.filter(log=>log.topics[0] == this.TRANSFER_TOPIC && log.topics[2] == '0x000000000000000000000000' + default_account)
		            let tokens = +transfer[0].data
		            if(transfer[0].topics[1] == "0x000000000000000000000000dcb6a51ea3ca5d3fd898fd6564757c7aaec3ca92") continue;
		            let poolInfoPoint = this.findClosest(timestamp)
		            let usd = this.getAvailableTransfer(tokens, poolInfoPoint.balances, poolInfoPoint.supply)
		            depositUsdSum += usd * 100
		        }
		    }
		    console.timeEnd('timer')
		    !this.cancel && localStorage.setItem(this.currentPool + 'lastDepositBlock', lastBlock);
		    !this.cancel && localStorage.setItem(this.currentPool + 'dlastAddress', default_account)
		    !this.cancel && localStorage.setItem(this.currentPool + 'lastDeposits', depositUsdSum);
		    !this.cancel && localStorage.setItem(this.currentPool + 'dversion', this.version);
		    return depositUsdSum;
		},

		async getWithdrawals(address) {
		    let default_account = currentContract.default_account
		    default_account = '0x39415255619783A2E71fcF7d8f708A951d92e1b6'
		    default_account = default_account.substr(2).toLowerCase();
		    let withdrawals = 0;
		    let fromBlock = this.fromBlock;
		    if(localStorage.getItem(this.currentPool + 'wversion') == this.version 
		    	&& localStorage.getItem(this.currentPool + 'lastWithdrawalBlock')
			 	&& localStorage.getItem(this.currentPool + 'wlastAddress') == default_account) {

			        let block = +localStorage.getItem(this.currentPool + 'lastWithdrawalBlock')
			        fromBlock = '0x'+parseInt(block+1).toString(16)
			        withdrawals += +localStorage.getItem(this.currentPool + 'lastWithdrawals')
		    }
		    const logs = await currentContract.web3.eth.getPastLogs({
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
		    	if(this.cancel) throw new Error('cancel');
		        const receipt = await currentContract.web3.eth.getTransactionReceipt(log.transactionHash);
		        let timestamp = (await currentContract.web3.eth.getBlock(receipt.blockNumber)).timestamp;
		        let removeliquidity = receipt.logs.filter(log=>log.topics[0] == this.removeliquidityTopic)
		        if(removeliquidity.length) {
		            let cTokens = (currentContract.web3.eth.abi.decodeParameters(this.decodeParametersWithdrawal, removeliquidity[0].data))[0]
		            withdrawals += await this.calculateAmount(cTokens, log.blockNumber)
		            continue;
		        }
		        removeliquidity = receipt.logs.filter(log=>log.topics[0] == this.removeliquidityImbalanceTopic)
		        if(removeliquidity.length) {
		        	let decodeParameters = this.decodeParametersWithdrawal
		        	if(['compound','usdt'].includes(this.currentPool)) {
		        		decodeParameters = this.decodeParametersWithdrawal1
		        	}
		            let decoded = currentContract.web3.eth.abi.decodeParameters(decodeParameters, removeliquidity[0].data)
		            withdrawals += await this.calculateAmount(decoded[0], log.blockNumber, 'withdrawal')
		        }
		        else {
		            let transfer = receipt.logs.filter(log=>log.topics[0] == this.TRANSFER_TOPIC && log.topics[1] == '0x000000000000000000000000' + default_account)
		            if(transfer[0].topics[2] == "0x000000000000000000000000dcb6a51ea3ca5d3fd898fd6564757c7aaec3ca92") continue;
		            let tokens = +transfer[0].data
		            console.log(tokens, "TRANSFER")
		            let poolInfoPoint = this.findClosest(timestamp)
		            let usd = this.getAvailableTransfer(tokens, poolInfoPoint)
		            withdrawals += usd * 100
		        }


		    }
		    !this.cancel && localStorage.setItem(this.currentPool + 'lastWithdrawalBlock', lastBlock);
		    !this.cancel && localStorage.setItem(this.currentPool + 'lastWithdrawals', withdrawals);
		    !this.cancel && localStorage.setItem(this.currentPool + 'wlastAddress', default_account);
		    !this.cancel && localStorage.setItem(this.currentPool + 'wversion', this.version);
		    console.log("WITHDRAWALS", withdrawals)
		    return withdrawals;
		},

		getAvailableTransfer(amount, poolInfoPoint) {
			return poolInfoPoint.balances
					.map((balance, i) => balance / allabis[this.currentPool].coin_precisions[i] * amount / poolInfoPoint.supply)
					.reduce((a, b) => a + b, 0)
					* (poolInfoPoint.virtual_price / 1e18)
		},

		async getAvailable(curr, amount, balance, supply) {
		    if(this.cancel) throw new Error('cancel');
		    let default_account = currentContract.default_account
		    default_account = '0x39415255619783A2E71fcF7d8f708A951d92e1b6'
		    default_account = default_account.substr(2).toLowerCase();
		    const tokenAddress = this.ADDRESSES[curr];
		    //balanceOf method
		    //balance
		    const balanceOfCurveContract = await currentContract.web3.eth.call({
		        to: tokenAddress,
		        data: '0x70a08231000000000000000000000000' + this.CURVE.substr(2),
		    });
		    //amount
		    const poolTokensBalance = await currentContract.web3.eth.call({
		        to: this.CURVE_TOKEN,
		        data: '0x70a08231000000000000000000000000' + default_account,
		    });
		    //totalSupply
		    const poolTokensSupply = await currentContract.web3.eth.call({
		        to: this.CURVE_TOKEN,
		        data: '0x18160ddd',
		    });

		    const get_virtual_price = await currentContract.web3.eth.call({
		    	to: this.CURVE,
		    	data: '0xbb7b8b80'
		    })

		    return this.BN(balanceOfCurveContract)
		        .mul(this.BN(poolTokensBalance))
		        .div(this.BN(poolTokensSupply));
		},
	},

}