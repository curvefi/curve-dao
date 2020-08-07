<template>
	<div class='window white'>
		<fieldset>
			<legend>
				{{ gauge.name }}
			</legend>
			<div class='pools'>
				<div>
					Minted CRV from this gauge: {{ mintedFormat }}
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
					<button @click='claim' v-show='claimableTokens !== null'>Claim {{ claimableTokensFormat }}</button>
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

	import BN from 'bignumber.js'

	export default {
		props: ['i'],


		data: () => ({
			depositAmount: 0,
			withdrawAmount: 0,
			gaugeContract: null,

			depositSlider: 100,
			withdrawSlider: 100,

			claimableTokens: null,
			minted: null,
		}),

		computed: {
			gauge() {
				return gaugeStore.state.mypools[this.i]
			},
			poolBalanceFormat() {
				return (this.gauge.balance / 1e18).toFixed(2)
			},
			gaugeBalanceFormat() {
				return (this.gauge.gaugeBalance / 1e18).toFixed(2)
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
		},

		mounted() {
			this.mounted()
		},

		methods: {
			async mounted() {
				this.depositAmount = this.poolBalanceFormat
				console.log(this.poolBalanceFormat, " POOL BALANCE FORMAT ")
				this.withdrawAmount = this.gaugeBalanceFormat

				this.gaugeContract = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, this.gauge.gauge)
				this.swap_token = new contract.web3.eth.Contract(ERC20_abi, this.gauge.swap_token)

				this.claimableTokens = await this.gaugeContract.methods.claimable_tokens().call()
				this.minted = await gaugeStore.state.minter.methods.minted(contract.default_account, this.gauge.gauge).call()
			},

			async deposit() {
				let deposit = BN(this.depositAmount).times(1e18)
				// let balance = BN(await this.swap_token.methods.balanceOf(contract.default_account).call())
				// if(balance.div(1e18).minus(deposit.times(BN(1e18))).abs().lt(BN(0.0001)))
				// 	deposit = balance

				await common.approveAmount(this.swap_token, deposit, contract.default_account, this.gauge.gauge)

				await this.gaugeContract.methods.deposit(deposit).send({
					from: contract.default_account,
					gas: 1000000,
				})

			},

			async withdraw() {
				let withdraw = BN(this.withdrawAmount).times(1e18)
				// let balance = BN(await this.gaugeContract.methods.balanceOf(contract.default_account).call())
				// if(balance.div(1e18).minus(withdraw.times(BN(1e18))).abs().lt(BN(0.0001)))
				// 	deposit = balance

				await this.gaugeContract.methods.withdraw(withdraw).send({
					from: contract.default_account,
					gas: 1000000,
				})
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
				//console.log(val, "THE VAL")
				this.depositAmount = ((this.gauge.balance / 1e18) * val/100).toFixed(2)
			},

			onWithdrawSlider(event) {
				let val = event.target.value
				this.withdrawSlider = val
				this.withdrawAmount = ((this.gauge.gaugeBalance / 1e18) * val/100).toFixed(2)
			},

			async update_liquidity_limit() {
				let l = +this.gauge.gaugeBalance
				let example_gauge = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, this.gauge.gauge)

				let calls = [
					[state.votingEscrow._address, state.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[state.votingEscrow._address, state.votingEscrow.methods.totalSupply().encodeABI()],
					[this.gauge.gauge, example_gauge.methods.period_timestamp(0).encodeABI()],
					[this.gauge.gauge, example_gauge.methods.working_balances(contract.default_account).encodeABI()],
					[this.gauge.gauge, example_gauge.methods.working_supply().encodeABI()],
					[this.gauge.gauge, example_gauge.methods.totalSupply().encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggcalls(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				let voting_balance = +decoded[0]
				let voting_total = +decoded[1]
				let period_timestamp = +decoded[2]
				let working_balances = +decoded[3]
				let working_supply = +decoded[4]
				let L = +decoded[5]

				let TOKENLESS_PRODUCTION = 40
				let BOOST_WARMUP = 2 * 7 * 86400

				let lim = l * TOKENLESS_PRODUCTION / 100
				if(voting_total > 0 && ((Date.now() / 1000) > period_timestamp + BOOST_WARMUP))
					lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

				lim = Math.min(l, lim)
				let old_bal = working_balances
				let _working_supply = working_supply + lim - old_bal

				return _working_supply

			},

			async claim() {
				await gaugeStore.state.minter.methods.mint(this.gauge.gauge).send({
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
	.range label {
		margin-right: 1em;
	}
	.range div {
		display: inline-block;
	}
	.range div.label {
		width: 3em;
	}
</style>