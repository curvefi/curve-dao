<template>
	<div class='window white' v-show="gauge.name != 'usdt'">
		<fieldset>
			<legend>
				{{ gauge.name }} {{ gauge.typeName }} gauge
				<b><img class='icon small' :src="publicPath + 'logo.png'" > CRV APY:</b> {{ CRVAPY.toFixed(2) }}%
			</legend>
			<div class='pool-info'>
				<button @click='applyBoost' class='applyBoost' v-show='canApplyBoost && claimableTokens == 0'>Apply boost</button>
				<span class='greentext' v-show='canApplyBoost && claimableTokens > 0'>You can apply boost by claiming CRV</span>
				<div class='gaugeRelativeWeight'>
					Gauge relative weight: {{ gaugeRelativeWeight.toFixed(2) }}%
				</div>
				<div class='mintedCRVFrom'>
					Minted CRV from this gauge: {{ mintedFormat }}
				</div>
				<div v-show="['susdv2', 'sbtc'].includes(gauge.name) && claimedRewards > 0" class='claimedRewards'>
					Claimed 
					<span v-show="gauge.name == 'susdv2'">SNX</span>
					<span v-show="gauge.name == 'sbtc'">BPT</span>: {{ claimedRewardsFormat }}
				</div>
				<div class='boost' v-show='boost !== null && !isNaN(boost)'>
					Boost: {{ boost && boost.toFixed(4) }}
				</div>
				<div class='boost' v-show='currentBoost !== null && !isNaN(currentBoost)'>
					Current boost: {{ currentBoost && currentBoost.toFixed(4) }}
				</div>
				<!-- <div class='boost' v-show='maxGaugeBoost !== null'>
					Max gauge boost: {{ maxGaugeBoost && maxGaugeBoost.toFixed(4) }}
				</div> -->
			</div>
			<div :class="{'pools': true, 'justifySpaceAround': gaugeBalance > 0}">
				<div class='flex-break'></div>
				<div class='simple-error' v-show="['susdv2', 'sbtc'].includes(gauge.name) && synthsUnavailable">
					Synthetix are upgrading their contract now and claiming SNX is not available
					{{ synthsUnavailable }}
				</div>
				<div class='pool'>
					<p v-show="['susdv2','sbtc'].includes(gauge.name) && stakedBalance > 0" class='info-message gentle-message'>
						<a :href="'https://curve.fi/'+gauge.name+'/withdraw'">Unstake rewards</a>
					</p>
					<div class='poolBalance'>Balance: <span class='hoverpointer' @click='setMaxPool'>{{ poolBalanceFormat }}</span> {{ gauge.name }} LP token</div>
					<div class='input'>
						<label for='deposit'>Amount:</label>
						<input id='deposit' type='text' v-model='depositAmount'>
					</div>
					<div class='range'>
						<div class='label'>
							<label for='zoom'>{{ depositSlider }}%</label>
						</div>
						<div>
							<input type='range' min='0' max='100' step='1' id='zoom' :value='depositSlider' @input='onDepositSlider'/>
						</div>
					</div>
					<div>
						<p>
							<input :id="'inf-approval-'+gauge.name" type="checkbox" name="inf-approval" v-model='inf_approval'>
		                    <label :for="'inf-approval-'+gauge.name" class='inf-approval-label'>Infinite approval 
		                    	<span class='tooltip'>[?]
		                    		<span class='tooltiptext long'>
		                    			Preapprove the contract to to be able to spend any amount of your coins. You will not need to approve again.
		                    		</span>
		                    	</span>
		                    </label>
	                	</p>
						<div>
							<button @click='deposit'>
								Deposit
								<span v-show="['susdv2', 'sbtc'].includes(gauge.name)"> and stake</span>
							</button>
						</div>
					</div>
				</div>
				<div class='gauge' v-show='gaugeBalance > 0'>
					<p v-show="['susdv2','sbtc'].includes(gauge.name) && stakedBalance > 0" class='info-message gentle-message unstake'>
						<a :href="'https://curve.fi/'+gauge.name+'/withdraw'">Unstake rewards</a>
					</p>
					<div class='gaugeBalance'>Balance: <span class='hoverpointer' @click='setMaxGauge'>{{ gaugeBalanceFormat }}</span> in gauge</div>
					<div class='input'>
						<label for='withdraw'>Amount:</label>
						<input id='withdraw' type='text' v-model='withdrawAmount'>
					</div>
					<div class='range'>
						<div class='label'>
							<label for='zoom'>{{ withdrawSlider }}%</label>
						</div>
						<div>
							<input type='range' min='0' max='100' step='1' id='zoom' :value='withdrawSlider' @input='onWithdrawSlider'/>
						</div>
					</div>
					<button @click='withdraw'>Withdraw</button>

					<!-- <button @click='update_liquidity_limit'>Update liquidity limit</button> -->
				</div>
				<div class='flex-break'></div>
				<div class='claimButtons'>
					<button @click='claim' v-show='claimableTokens > 0' class='claimtokens'>Claim {{ claimableTokensFormat }} CRV</button>
					<button @click='claimRewards' v-show='claimableReward > 0' class='claimrewards'>
						Claim {{ claimableRewardFormat }} 
						<span v-show="gauge.name == 'susdv2'">SNX</span>
						<span v-show="gauge.name == 'sbtc'">BPT</span>
					</button>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
    import { notify, notifyHandler, notifyNotification } from '../../init'

	import * as common from '../../utils/common'

	import allabis, { ERC20_abi } from '../../allabis'
	import daoabis from '../dao/allabis'

	import * as gaugeStore from './gaugeStore'
	import * as veStore from './veStore'

	import BN from 'bignumber.js'

	import * as helpers from '../../utils/helpers'

	let staking = ['0xC25a3A3b969415c80451098fa907EC722572917F', '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3'].map(a => a.toLowerCase())

    import * as gasPriceStore from '../common/gasPriceStore'

	export default {
		props: ['i'],


		data: () => ({
			depositAmount: 0,
			withdrawAmount: 0,
			gaugeContract: null,

			depositSlider: 100,
			withdrawSlider: 100,

			claimableTokens: null,
			claimableReward: null,
			claimedRewards: null,
			minted: null,

			boost: null,
			currentBoost: null,
			currentBoostCheck: null,

			loaded: false,

			promise: helpers.makeCancelable(Promise.resolve()),

			stakedBalance: 0,

			inf_approval: true,

			BOOST_WARMUP: 2 * 7 * 86400,

			maxGaugeBoost: null,
		}),

		computed: {
			gauge() {
				return gaugeStore.state.mypools[this.i]
			},
			gaugeBalance() {
				return +this.gauge.gaugeBalance
			},
			poolBalanceFormat() {
				return this.toFixed(this.gauge.balance / 1e18)
			},
			gaugeBalanceFormat() {
				return (this.gauge.gaugeBalance / 1e18).toFixed(2)
			},
			apy() {
				return gaugeStore.state.APYs[this.gauge.name]
			},
			gaugeRelativeWeight() {
				return this.gauge.gauge_relative_weight * 100
			},
			// depositSlider() {
			// 	return (Math.min(this.depositAmount / (this.gauge.balance / 1e18), 1)).toFixed(2)
			// },
			// withdrawSlider() {
			// 	return (Math.min(this.withdrawAmount / (this.gauge.gaugeBalance / 1e18), 1)).toFixed(2)
			// },
			claimableTokensFormat() {
				return (this.claimableTokens / 1e18).toFixed(2)
			},
			mintedFormat() {
				return (this.minted / 1e18).toFixed(2)
			},
			triggerUpdateLimit() {
				return this.depositAmount, veStore.state.deposit, veStore.state.increaseLock, Date.now()
			},
			claimableRewardFormat() {
				return this.toFixed(this.claimableReward / 1e18)
			},
			claimedRewardsFormat() {
				return this.toFixed(this.claimedRewards / 1e18)
			},
			gasPrice() {
                return gasPriceStore.state.gasPrice
            },
            gasPriceWei() {
                return gasPriceStore.state.gasPriceWei
            },
            publicPath() {
                return process.env.BASE_URL
            },
            canApplyBoost() {
            	console.log(this.gauge.name, this.gauge.currentWorkingBalance, this.gauge.previousWorkingBalance, this.gauge.currentWorkingBalance > +this.gauge.previousWorkingBalance, "WORKING BALANCES")
            	return this.gauge.gaugeBalance > 0 && (Date.now() / 1000) > 1597271916 && this.currentBoost < this.currentBoostCheck
            },
            CRVAPY() {
            	let apy = this.apy
            	if(this.currentBoost > 0)
            		apy *= this.currentBoost
            	return apy
            },
            synthsUnavailable() {
            	return gaugeStore.state.synthsUnavailable
            },
		},

		watch: {
			// depositSlider(val) {
			// 	this.depositAmount = ((this.gauge.balance / 1e18) * val/100).toFixed(2)
			// },

			// withdrawSlider(val) {
			// 	this.withdrawAmount = ((this.gauge.gaugeBalance / 1e18) * val/100).toFixed(2)
			// },

			depositAmount(val) {
				let depositVal = (val * 100 / (this.gauge.balance / 1e18)) || 0
				this.depositSlider = (Math.min(depositVal, 100)).toFixed(0)
			},

			withdrawAmount(val) {
				let withdrawVal = (val * 100 / (this.gauge.gaugeBalance / 1e18)) || 0

				this.withdrawSlider = (Math.min(withdrawVal, 100)).toFixed(0)
			},
			async triggerUpdateLimit() {
				this.updateLimit()
			},
		},

		mounted() {
			this.mounted()
		},

		methods: {
			async mounted() {
				this.depositAmount = this.poolBalanceFormat
				this.withdrawAmount = this.gaugeBalanceFormat

				this.gaugeContract = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, this.gauge.gauge)

				this.swap_token = new contract.web3.eth.Contract(ERC20_abi, this.gauge.swap_token)

				this.loaded = true

				//this.claimableTokens = await this.gaugeContract.methods.claimable_tokens(contract.default_account).call()
				this.claimableTokens = +this.gauge.claimable_tokens
				
				gaugeStore.state.totalClaimableCRV += +this.claimableTokens
				if(['susdv2', 'sbtc'].includes(this.gauge.name)) {
					let curveRewards = new web3.eth.Contract(allabis[this.gauge.name].sCurveRewards_abi, allabis[this.gauge.name].sCurveRewards_address)
					this.stakedBalance = await curveRewards.methods.balanceOf(contract.default_account).call()

					// gaugeStore.state.mypools[this.i].balance = 0
					// gaugeStore.state.mypools[this.i].balance = +gaugeStore.state.mypools[this.i].balance + +this.stakedBalance

					this.claimableReward = await this.gaugeContract.methods.claimable_reward(contract.default_account).call()
					this.claimedRewards = await this.gaugeContract.methods.claimed_rewards_for(contract.default_account).call()

					this.claimableReward -= this.claimedRewards
				}
				
				//this.minted = await gaugeStore.state.minter.methods.minted(contract.default_account, this.gauge.gauge).call()
				this.minted = this.gauge.minted

				gaugeStore.state.totalMintedCRV += +this.minted

				let allowance = BN(await this.swap_token.methods.allowance(contract.default_account, this.gauge.gauge).call())

				if(allowance.lte(contract.max_allowance.div(BN(2))))
					this.inf_approval = false

				if(+this.gauge.gaugeBalance > 0) {
					this.currentBoost = Math.max(1, gaugeStore.state.boosts[this.gauge.name])
					this.checkLimit()
				}

				//this.maxGaugeBoost = this.gauge.original_supply / this.gauge.working_supply

			},

			async deposit() {
				let deposit = BN(this.depositAmount).times(1e18)
				let balance = BN(await this.swap_token.methods.balanceOf(contract.default_account).call())
				if(deposit.gt(BN(this.gauge.balance)))
					deposit = balance

				let gas = 500000

				// if(['susdv2', 'sbtc'].includes(this.gauge.name) && deposit.gt(BN(this.gauge.origBalance))) {
				// 	let curveRewards = new web3.eth.Contract(allabis[this.gauge.name].sCurveRewards_abi, allabis[this.gauge.name].sCurveRewards_address)
				// 	let stakedBalance = BN(await curveRewards.methods.balanceOf(contract.default_account).call())
				// 	let withdraw = deposit
				// 	if(withdraw.gt(stakedBalance))
				// 		withdraw = stakedBalance

				// 	await new Promise((resolve, reject) => {
    // 					curveRewards.methods.withdraw(withdraw.toFixed(0,1))
    // 						.send({
    // 							from: contract.default_account,
    // 							gas: 125000,
    // 						})
    // 						.once('transactionHash', resolve)
    //                         .catch(err => reject(err))
    // 				})

				// }

				if(['susdv2', 'sbtc'].includes(this.gauge.name)) {
					gas = 1000000
				}


				await common.approveAmount(this.swap_token, deposit, contract.default_account, this.gauge.gauge, this.inf_approval)

				var { dismiss } = notifyNotification(`Please confirm depositing into ${this.gauge.name} gauge`)

				await this.gaugeContract.methods.deposit(deposit.toFixed(0,1)).send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: gas,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
				})

				this.updateBalances()

			},

			async withdraw() {
				let withdraw = BN(this.withdrawAmount).times(1e18)
				let balance = BN(await this.gaugeContract.methods.balanceOf(contract.default_account).call())
				if(withdraw.gt(balance))
					withdraw = balance
				let withdrawMethod = this.gaugeContract.methods.withdraw(withdraw.toFixed(0,1))
				if(['susdv2', 'sbtc'].includes(this.gauge.name) && this.synthsUnavailable) {
					let gaugeContract = new web3.eth.Contract(daoabis.liquiditygaugerewards_abi, this.gauge.gauge)
					withdrawMethod = gaugeContract.methods.withdraw(withdraw.toFixed(0,1), !this.synthsUnavailable)
				}
				let gas = 1000000
				try {
					gas = await withdrawMethod.estimateGas()
				}
				catch(err) {
					console.error(err)
				}

				var { dismiss } = notifyNotification(`Please confirm withdrawing from ${this.gauge.name} gauge`)

				await withdrawMethod.send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: gas * 1.5 | 0,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
				})

				// try {
				// 	await this.gaugeContract.methods.withdraw(withdraw.toFixed(0,1)).estimateGas()
				// }
				// catch(err) {
				// 	if(err && err.message.includes('gas required exceeds allowance')) {
				// 		await this.gaugeContract.methods.withdraw(withdraw.toFixed(0,1), false).send({
				// 			from: contract.default_account,
				// 			gas: 1000000,
				// 		})
				// 	}
				// 	else {
				// 		await this.gaugeContract.methods.withdraw(withdraw.toFixed(0,1)).send({
				// 			from: contract.default_account,
				// 			gas: 1000000,
				// 		})
				// 	}
				// }

				this.updateBalances()
			},

			async updateBalances() {
				let calls = [
					//balanceOf
					[this.gauge.swap_token, '0x70a08231000000000000000000000000' + contract.default_account.slice(2)],
					[this.gaugeContract._address, this.gaugeContract.methods.balanceOf(contract.default_account).encodeABI()],
				]

				let aggcalls = await contract.multicall.methods.aggregate(calls).call()

				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))

				gaugeStore.state.mypools[this.i].balance = decoded[0]
				gaugeStore.state.mypools[this.i].gaugeBalance = decoded[1]
			},

			toFixed(num) {
                if(num == '' || num == undefined || +num == 0) return '0.00'
                if(!BN.isBigNumber(num)) num = +num
                if(['ren', 'sbtc'].includes(this.gauge.name)) return num.toFixed(8)
                return num.toFixed(2)
            },

			setMaxPool() {
				this.depositAmount = this.gauge.balance / 1e18
			},

			setMaxGauge() {
				this.withdrawAmount = this.gauge.gaugeBalance / 1e18
			},

			onDepositSlider(event) {
				let val = event.target.value
				this.depositSlider = val
				this.depositAmount = this.toFixed((this.gauge.balance / 1e18) * val/100)
			},

			onWithdrawSlider(event) {
				let val = event.target.value
				this.withdrawSlider = val
				this.withdrawAmount = this.toFixed((this.gauge.gaugeBalance / 1e18) * val/100)
			},

			async update_liquidity_limit(new_l = null, new_voting_balance = null) {
				let l = +this.gauge.gaugeBalance
				if(new_l !== null)
					l = new_l * 1e18
				let example_gauge = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, this.gauge.gauge)

				let calls = [
					[gaugeStore.state.votingEscrow._address, gaugeStore.state.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[gaugeStore.state.votingEscrow._address, gaugeStore.state.votingEscrow.methods.totalSupply().encodeABI()],
					[this.gauge.gauge, example_gauge.methods.period_timestamp(0).encodeABI()],
					[this.gauge.gauge, example_gauge.methods.working_balances(contract.default_account).encodeABI()],
					[this.gauge.gauge, example_gauge.methods.working_supply().encodeABI()],
					[this.gauge.gauge, example_gauge.methods.totalSupply().encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				let voting_balance = +decoded[0]
				let voting_total = +decoded[1] - +voting_balance
				let period_timestamp = +decoded[2]
				let working_balances = +decoded[3]
				let working_supply = +decoded[4]
				let L = +decoded[5] + l


				if(new_voting_balance !== null) {
					voting_balance = new_voting_balance * 1e18
				}

				voting_total += voting_balance


				let TOKENLESS_PRODUCTION = 40

				let BOOST_WARMUP = this.BOOST_WARMUP
			
				let lim = l * TOKENLESS_PRODUCTION / 100
				if(voting_total > 0 && ((Date.now() / 1000) > period_timestamp + BOOST_WARMUP))
					lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

				lim = Math.min(l, lim)
				
				let old_bal = working_balances
				let noboost_lim = TOKENLESS_PRODUCTION * l / 100
				let noboost_supply = working_supply + noboost_lim - old_bal
				let _working_supply = working_supply + lim - old_bal

				return [_working_supply, (lim / _working_supply) / (noboost_lim / noboost_supply)]

			},

			async claim() {
				let gas = await gaugeStore.state.minter.methods.mint(this.gauge.gauge).estimateGas()
				if(['susdv2', 'sbtc'].includes(this.gauge.name))
					gas = 1000000

				var { dismiss } = notifyNotification(`Please confirm claiming CRV from ${this.gauge.name} gauge`)

				await gaugeStore.state.minter.methods.mint(this.gauge.gauge).send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: gas * 1.5 | 0,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
				})
			},

			async claimRewards() {
				let gas = await this.gaugeContract.methods.claim_rewards(contract.default_account).estimateGas()
				// if(['susdv2', 'sbtc'].includes(this.gauge.name))
				// 	gas = 1000000

				var { dismiss } = notifyNotification(`Please confirm claiming ${this.gauge.name == 'susdv2' ? 'SNX' : 'BPT'}`)

				await this.gaugeContract.methods.claim_rewards(contract.default_account).send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: 500000,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
				})
			},

			async applyBoost() {
				let gas = 600000
				try {
					gas = await this.gaugeContract.methods.user_checkpoint(contract.default_account).estimateGas()
				}
				catch(err) {
					console.error(err)
				}

				var { dismiss } = notifyNotification(`Please confirm applying boost`)

				await this.gaugeContract.methods.user_checkpoint(contract.default_account).send({
					from: contract.default_account,
					gasPrice: this.gasPriceWei,
					gas: gas,
				})
				.once('transactionHash', hash => {
					dismiss()
					notifyHandler(hash)
				})
			},

			async updateLimit() {
				if(!this.loaded) return;
				this.promise.cancel()
				this.promise = helpers.makeCancelable(this.update_liquidity_limit(this.depositAmount, veStore.newVotingPower()))
				let newLimit = await this.promise

				this.boost = newLimit[1]
			},

			async checkLimit() {
				let currentLimit = await this.update_liquidity_limit()

				this.currentBoostCheck = currentLimit[1]
				if(this.currentBoost < this.currentBoostCheck && this.claimableTokens == 0)
					gaugeStore.state.gaugesNeedApply.push(this.gauge.gauge)
			}
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	.pools {
		display: flex;
		flex-wrap: wrap;
		width: 80%;
		margin: 0 auto;
	}
	.pools.justifySpaceAround {
		width: 100%;
		margin: 0;
		justify-content: space-around;
	}
	.pools .hoverpointer {
		cursor: pointer;
		border-bottom: 1px solid black;
		border-bottom-style: dotted;
	}
	.pools .hoverpointer:hover {
		border-bottom-style: solid;
	}
	.pools button {
		margin-top: 1em;
	}
	.pools input {
		width: 6em;
	}
	.pools .input {
		margin-top: 1em;
	}
	.range {
		margin-top: 1em;
	}
	.range label {
		margin-right: 1em;
	}
	.range div {
		display: inline-block;
	}
	.range div.label {
		width: 3em;
	}
	.claimtokens {
		margin-right: 1em;
	}
	.pool-info {
		text-align: center;
	}
	.pool-info .boost {
		margin-top: 1em;
	}
	.claimButtons {
		/*width: 100%;*/
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}
	.poolBalance, .gaugeBalance {
		margin-top: 1em;
	}
	.inf-approval-label {
		margin-top: 1em;
	}
	.gauge .unstake {
		visibility: hidden;
	}
	.mintedCRVFrom, .gaugeRelativeWeight, .claimedRewards {
		margin-top: 0.4em;
	}
	.gaugeRelativeWeight {
		margin-top: 1em;
	}
	.greentext {
		color: green;
	}
	@media only screen and (max-device-width: 730px) {
		.gauge .unstake {
			display: none;
		}
	}
</style>