<template>
	<div class='window white'>
		<fieldset>
			<legend>
				{{ gauge.name }} {{ gauge.typeName }} gauge
			</legend>
			<div class='pools'>
				<div>
					Minted CRV from this gauge: {{ mintedFormat }}
				</div>
				<div class='flex-break'></div>
				<div v-show='boost !== null && !isNaN(boost)'>
					Boost: {{ boost && boost.toFixed(4) }}
				</div>
				<div class='flex-break'></div>
				<div class='pool'>
					<div>Balance: <span class='hoverpointer' @click='setMaxPool'>{{ poolBalanceFormat }}</span> {{ gauge.name }} LP token</div>
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
					<button @click='deposit'>Deposit</button>
				</div>
				<div class='gauge'>
					<div>Balance: <span class='hoverpointer' @click='setMaxGauge'>{{ gaugeBalanceFormat }}</span> in gauge</div>
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
				<div>
					<button @click='claim' v-show='claimableTokens !== null' class='claimtokens'>Claim {{ claimableTokensFormat }} CRV</button>
					<button @click='claimRewards' v-show='claimableReward !== null' class='claimrewards'>Claim {{ claimableRewardFormat }} SNX</button>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
	import * as common from '../../utils/common'

	import allabis, { ERC20_abi } from '../../allabis'
	import daoabis from '../dao/allabis'

	import * as gaugeStore from './gaugeStore'
	import * as veStore from './veStore'

	import BN from 'bignumber.js'

	import * as helpers from '../../utils/helpers'

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
			minted: null,

			boost: null,

			loaded: false,

			promise: helpers.makeCancelable(Promise.resolve()),

			thegauge: {
				balance: 0,
				gauge: '0xd13BBE09C4532CdbBC42bf9205CaED3587F25789',
				gaugeBalance: 0,
				name: 'curvepool1',
				swap: '0xbbe6874b45eFd4E44396F6aE619663067424b218',
				swap_token: '0x1796E153ce80fCf2015E19035DcecFb005bc017D',
				type: 0,
				typeName: 'Liquidity'
			}
		}),

		computed: {
			gauge() {
				return gaugeStore.state.mypools[this.i]
			},
			poolBalanceFormat() {
				return (this.thegauge.balance / 1e18).toFixed(2)
			},
			gaugeBalanceFormat() {
				return (this.thegauge.gaugeBalance / 1e18).toFixed(2)
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
				return (this.claimableReward / 1e18).toFixed(2)
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
				if(!this.loaded) return;
				this.promise.cancel()
				this.promise = helpers.makeCancelable(this.update_liquidity_limit(this.depositAmount, veStore.newVotingPower()))
				let newLimit = await this.promise
				console.log(newLimit, "new limit")

				this.boost = newLimit[1]

			},
		},

		mounted() {
			this.mounted()
		},

		methods: {
			async mounted() {


				this.gaugeContract = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, this.thegauge.gauge)

				console.log(this.gaugeContract._address, "THE ADDRESS")

				this.swap_token = new contract.web3.eth.Contract(ERC20_abi, this.thegauge.swap_token)
				//just for test

				this.thegauge.balance = this.gauge.balance

				this.thegauge.gaugeBalance = await this.gaugeContract.methods.balanceOf(contract.default_account).call()

				console.log(this.thegauge.gaugeBalance, "GAUGE BALANCE")

				//just for test

				this.depositAmount = this.poolBalanceFormat
				this.withdrawAmount = this.gaugeBalanceFormat

				setTimeout(() => this.loaded = true, 1000)

				console.log(this.gaugeContract, "GAUGE CONTRACT")
				console.log(this.gauge, "THE GAUGE")
				this.claimableTokens = await this.gaugeContract.methods.claimable_tokens(contract.default_account).call()
				console.log(this.claimableTokens, "CLAIMABLE TOKENS")
				if(gaugeStore.state.totalClaimableCRV === null)
					gaugeStore.state.totalClaimableCRV = this.claimableTokens
				else
					gaugeStore.state.totalClaimableCRV += this.claimableTokens
				if(this.thegauge.typeName.toLowerCase().includes('rewards'))
					this.claimableReward = await this.gaugeContract.methods.claimable_reward(contract.default_account).call()
				
				this.minted = await gaugeStore.state.minter.methods.minted(contract.default_account, this.thegauge.gauge).call()

			},

			async deposit() {
				let deposit = BN(this.depositAmount).times(1e18)
				// let balance = BN(await this.swap_token.methods.balanceOf(contract.default_account).call())
				// if(balance.div(1e18).minus(deposit.times(BN(1e18))).abs().lt(BN(0.0001)))
				// 	deposit = balance

				await common.approveAmount(this.swap_token, deposit, contract.default_account, this.thegauge.gauge)

				await this.gaugeContract.methods.deposit(deposit.toFixed(0,1)).send({
					from: contract.default_account,
					gas: 1000000,
				})

			},

			async withdraw() {
				let withdraw = BN(this.withdrawAmount).times(1e18)
				// let balance = BN(await this.gaugeContract.methods.balanceOf(contract.default_account).call())
				// if(balance.div(1e18).minus(withdraw.times(BN(1e18))).abs().lt(BN(0.0001)))
				// 	deposit = balance

				await this.gaugeContract.methods.withdraw(withdraw.toFixed(0,1)).send({
					from: contract.default_account,
					gas: 1000000,
				})
			},

			setMaxPool() {
				this.depositAmount = this.thegauge.balance / 1e18
			},

			setMaxGauge() {
				this.withdrawAmount = this.thegauge.gaugeBalance / 1e18
			},

			onDepositSlider(event) {
				let val = event.target.value
				this.depositSlider = val
				this.depositAmount = ((this.thegauge.balance / 1e18) * val/100).toFixed(2)
			},

			onWithdrawSlider(event) {
				let val = event.target.value
				this.withdrawSlider = val
				this.withdrawAmount = ((this.thegauge.gaugeBalance / 1e18) * val/100).toFixed(2)
			},

			async update_liquidity_limit(new_l = null, new_voting_balance = null) {
				console.log(+new_voting_balance, "Voting balance")
				let l = +this.thegauge.gaugeBalance
				if(new_l)
					l = new_l * 1e18
				let example_gauge = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, this.thegauge.gauge)

				let calls = [
					[gaugeStore.state.votingEscrow._address, gaugeStore.state.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[gaugeStore.state.votingEscrow._address, gaugeStore.state.votingEscrow.methods.totalSupply().encodeABI()],
					[this.thegauge.gauge, example_gauge.methods.period_timestamp(0).encodeABI()],
					[this.thegauge.gauge, example_gauge.methods.working_balances(contract.default_account).encodeABI()],
					[this.thegauge.gauge, example_gauge.methods.working_supply().encodeABI()],
					[this.thegauge.gauge, example_gauge.methods.totalSupply().encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				let voting_balance = +decoded[0]
				let voting_total = +decoded[1] - +voting_balance
				let period_timestamp = +decoded[2]
				let working_balances = +decoded[3]
				let working_supply = +decoded[4]
				let L = +decoded[5] + l

				console.log(L, "TOTAL SUPPLY")


				if(new_voting_balance) {
					voting_balance = new_voting_balance * 1e18
				}

				voting_total += voting_balance


				let TOKENLESS_PRODUCTION = 40
				let BOOST_WARMUP = 2 * 7 * 86400
				BOOST_WARMUP = 0

				let lim = l * TOKENLESS_PRODUCTION / 100
				console.log(lim, "lim initial")
				if(voting_total > 0 && ((Date.now() / 1000) > period_timestamp + BOOST_WARMUP))
					lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100
				console.log(lim, "lim after")

				console.log(l, lim, Math.min(l, lim))
				lim = Math.min(l, lim)
				console.log('voting_balance: ', voting_balance, 'voting_total: ', voting_total, 'period_timestamp: ',
								period_timestamp, 'working_balances: ', working_balances, 'working_supply: ', working_supply,
								'l: ', l,'L: ', L,'lim: ', lim)
				let old_bal = working_balances
				let noboost_lim = TOKENLESS_PRODUCTION * l / 100
				let noboost_supply = working_supply + noboost_lim - old_bal
				let _working_supply = working_supply + lim - old_bal

				console.log(noboost_lim, noboost_supply, 'noboost')

				console.log(_working_supply, "working supply")
				console.log(this.thegauge.name, "GAUGE NAME")
				return [_working_supply, (lim / _working_supply) / (noboost_lim / noboost_supply)]

			},

			async claim() {
				await gaugeStore.state.minter.methods.mint(this.thegauge.gauge).send({
					from: contract.default_account,
				})
			},

			async claimRewards() {
				await this.gaugeContract.methods.claim_rewards().send({
					from: contract.default_account,
				})
			},
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
</style>