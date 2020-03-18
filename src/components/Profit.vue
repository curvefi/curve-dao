<template>
	<div class='blue window half-width info'>
        <fieldset id='profit-info'>
            <legend>Profit</legend>
            <ul id='profit'>
                <li>
                	<b>Deposits:</b> 
                	<span :class="{'loading line': deposits == ''}">
	                	{{deposits/100 | toFixed2}}
	            	</span>
            	</li>
                <li>
                	<b>Withdrawals:</b> 
                	<span :class="{'loading line': withdrawals == ''}">
                		{{withdrawals/100 | toFixed2}}
                	</span>
                </li>
                <li>
                	<b>Available:</b> 
                	<span :class="{'loading line': available == ''}">
                		{{available/100 | toFixed2}}
                	</span>
                </li>
                <li>
                	<b>Profit:</b> 
                	<span :class="{'loading line': available == ''}">
                		<span v-show='available'> {{(available + withdrawals - deposits)/100 | toFixed2}}</span>
                	</span>
                </li>
            </ul>
        </fieldset>
    </div>
</template>

<script>
	import Vue from 'vue'
    import * as common from '../utils/common.js'
    import { getters, contract as currentContract } from '../contract'
    import * as helpers from '../utils/helpers'
    import Web3 from "web3";

    import BigNumber from 'bignumber.js'

	export default {
        created() {
            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            })
        },
        mounted() {
            if(currentContract.initializedContracts) this.mounted();
        },
		data: () => ({
			deposits: '',
			withdrawals: '',
			available: '',
			profit: '',
			BN: '',
			priceData: '',
			ADDRESSES: {},
			CURVE: '',
			CURVE_TOKEN: '',
			TRANSFER_TOPIC: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
			version: 1,
		}),
		methods: {
            async mounted() {
                common.update_fee_info();
                this.BN = web3.utils.toBN
                this.CURVE = currentContract.swap_address;
                this.CURVE_TOKEN = currentContract.token_address;

                let res = await fetch('https://compound.curve.fi/stats.json');
                this.priceData = await res.json();
                for(let i = 0; i < currentContract.N_COINS; i++) {
			        let symbol = await currentContract.coins[i].methods.symbol().call()
			        this.ADDRESSES[symbol] = currentContract.coins[i]._address;
			    }

			    this.deposits = await this.getDeposits();
			    this.withdrawals = await this.getWithdrawals();
			    let available = 0;

		        let promises = [];
		        for(let curr of Object.keys(this.ADDRESSES)) {
		            promises.push(this.getAvailable(curr))
		        }
		        let prices = await Promise.all(promises);
		        for(let i = 0; i < prices.length; i++) {
		            let curr = Object.keys(this.ADDRESSES)[i]
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

		        this.available = available;
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
            async getExchangeRate(blockNumber, address, value) {
			    let exchangeRate = await this.checkExchangeRateBlocks(blockNumber, address, 0);
			    let exchangeRatePast, exchangeRateFuture;
			    let currentBlock = await web3.eth.getBlockNumber();
			    let pastCurrentBlock = false;
			    if(exchangeRate === false) {
			        let i = blockNumber;
			        let j = blockNumber;
			        while((exchangeRatePast = await this.checkExchangeRateBlocks(i, address, -1)) === false) {
			            i-=100;
			        }
			        while((exchangeRateFuture = await this.checkExchangeRateBlocks(j, address, 1)) === false) {
			            if(j > currentBlock) {
			                pastCurrentBlock = true;
			                break;
			            }
			            j+=100;
			        }

			        while(pastCurrentBlock) {
			            let i = blockNumber - 200;
			            let j = blockNumber - 100;
			            while((exchangeRatePast = await this.checkExchangeRateBlocks(i, address, -1)) === false) {
			                i-=200;
			            }
			            while((exchangeRateFuture = await this.checkExchangeRateBlocks(j, address, -1)) === false) {
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

			        exchangeRate = this.BN(exchangeRateFuture.blockNumber - exchangeRatePast.blockNumber).mul(exchangeRateFuture.exchangeRate.sub(exchangeRatePast.exchangeRate))
			        exchangeRate = exchangeRate.div(this.BN(exchangeRateFuture.blockNumber - exchangeRatePast.blockNumber))
			        exchangeRate = exchangeRate.add(exchangeRatePast.exchangeRate)
			    }

			    
			    return exchangeRate;
			},

            async getDeposits() {
			    let default_account = currentContract.default_account.substr(2).toLowerCase();

			    let depositUsdSum = 0;

			    let fromBlock = '0x91c86f';
			    if(localStorage.getItem('pversion') == this.version && localStorage.getItem('ClastDepositBlock') && localStorage.getItem('ClastAddress') == default_account) {
			        let block = +localStorage.getItem('ClastDepositBlock')
			        fromBlock = '0x'+parseInt(block+1).toString(16)
			        depositUsdSum += +localStorage.getItem('ClastDeposits')
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
			        let cDAI = 0;
			        let cUSDC = 0;
			        let addliquidity = receipt.logs.filter(log=>log.topics[0] == '0x26f55a85081d24974e85c6c00045d0f0453991e95873f52bff0d21af4079a768')
			        if(addliquidity.length) {
			            let cTokens = (web3.eth.abi.decodeParameters(['uint256[2]','uint256[2]', 'uint256', 'uint256'], addliquidity[0].data))[0]
			            for(let i = 0; i < 2; i++) {
			                const tokenIndex = Object.values(this.ADDRESSES)[i];
			                const tokens = this.BN(cTokens[i])
			                if(tokens == 0) continue;
			                let curr = Object.keys(this.ADDRESSES)[tokenIndex]
			                let exchangeRate = await this.getExchangeRate(receipt.blockNumber, currentContract.coins[i]._address , '')
			                const usd = this.fromNative(curr, this.BN(exchangeRate).mul(this.BN(tokens)))
			                depositUsdSum += usd;
			                
			            }
			        }
			        if(!addliquidity.length) {
			            let transfer = receipt.logs.filter(log=>log.topics[0] == this.TRANSFER_TOPIC && log.topics[2] == '0x000000000000000000000000' + default_account)
			            let tokens = +transfer[0].data
			            let exchangeRate = this.findClosest(timestamp)[1]
			            depositUsdSum += tokens*exchangeRate/1e16
			        }
			    }
			    console.timeEnd('timer')
			    localStorage.setItem('ClastDepositBlock', lastBlock);
			    localStorage.setItem('ClastAddress', default_account)
			    localStorage.setItem('ClastDeposits', depositUsdSum);
			    localStorage.setItem('pversion', this.version);
			    return depositUsdSum;
			},

			async calculateAmount(cTokens, block) {
			    let amount = 0;
			    for(let i = 0; i < 2; i++) {
			            const tokens = this.BN(cTokens[i]);
			            if(tokens == 0) continue;
			            const tokenIndex = Object.values(this.ADDRESSES)[i]
			            let curr = Object.keys(this.ADDRESSES)[i]
			            let exchangeRate = await this.getExchangeRate(block, currentContract.coins[i]._address, '')
			            const usd = this.fromNative(curr, this.BN(exchangeRate).mul(this.BN(tokens)))
			            amount += usd;
			    }
			    return amount;
			},

			async getWithdrawals(address) {
			    let default_account = currentContract.default_account.substr(2).toLowerCase();
			    let withdrawals = 0;
			    let fromBlock = '0x91c86f';
			    if(localStorage.getItem('pwversion') == this.version && localStorage.getItem('ClastWithdrawalBlock') && localStorage.getItem('ClastAddress') == default_account) {
			        let block = +localStorage.getItem('ClastWithdrawalBlock')
			        fromBlock = '0x'+parseInt(block+1).toString(16)
			        withdrawals += +localStorage.getItem('ClastWithdrawals')
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
			        let removeliquidity = receipt.logs.filter(log=>log.topics[0] == '0x7c363854ccf79623411f8995b362bce5eddff18c927edc6f5dbbb5e05819a82c')
			        let [cDAI, cUSDC] = [0,0];
			        let cTokens = [cDAI, cUSDC];
			        if(removeliquidity.length) {
			            cTokens = (web3.eth.abi.decodeParameters(['uint256[2]','uint256[2]', 'uint256'], removeliquidity[0].data))[0]
			            withdrawals += await this.calculateAmount(cTokens, log.blockNumber)
			            continue;
			        }
			        removeliquidity = receipt.logs.filter(log=>log.topics[0] == '0x2b5508378d7e19e0d5fa338419034731416c4f5b219a10379956f764317fd47e')
			        if(removeliquidity.length) {
			            let decoded = web3.eth.abi.decodeParameters(['uint256[2]','uint256[2]', 'uint256', 'uint256'], removeliquidity[0].data)
			            withdrawals += await this.calculateAmount(decoded[0], log.blockNumber)
			        }
			        else {
			            let transfer = receipt.logs.filter(log=>log.topics[0] == this.TRANSFER_TOPIC && log.topics[1] == '0x000000000000000000000000' + default_account)
			            let tokens = +transfer[0].data
			            let exchangeRate = this.findClosest(timestamp)[1]
			            withdrawals += tokens*exchangeRate/1e16
			            localStorage.setItem('ClastWithdrawalBlock', lastBlock);
			            localStorage.setItem('ClastWithdrawals', withdrawals);
			        }


			    }
			    localStorage.setItem('ClastWithdrawalBlock', lastBlock);
			    localStorage.setItem('ClastWithdrawals', withdrawals);
			    localStorage.setItem('pwversion', this.version);
			    return withdrawals;
			},

			async getAvailable(curr) {
			    let default_account = currentContract.default_account.substr(2).toLowerCase();
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
</script>