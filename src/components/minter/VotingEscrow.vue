<template>
	<div class='window white'>
		<fieldset>
			<legend>
				Voting power in DAO
			</legend>
			<p>
				Balance in Voting Escrow: {{ vecrvBalanceText }} veCRV
				<br>
				<img :src="publicPath + 'lock-solid.svg'" class='icon small'> Locked until: {{ lockTimeText }}
			</p>
			<div class='increaselock' v-show='hasvecrv'>
				<p class='depositinputs'>
					<label for='deposit'>Increase amount:</label>
					<input id='deposit' type='text' v-model='deposit'>
					<span class='maxbalance' @click='setMaxBalance'>Max: {{ crvBalanceText }}</span>
					<br>
					<button @click='increaseAmount'>Add</button>
				</p>
				<p class='depositinputs'>
					<label for='incraselock'>Increase lock:</label>
					<datepicker 
						id='increaselock' 
						name='increaselock' 
						v-model='increaseLock'
						:disabled-dates='disabledDates'
						:open-date='openDate'
					></datepicker>
					<br>
					<button @click='submitIncreaseLock'>Increase lock</button>
				</p>
			</div>
			<div class='increaselock' v-show='!hasvecrv'>
				<p class='depositinputs'>
					<label for='deposit'>Amount:</label>
					<input id='deposit' type='text' v-model='deposit'>
					<span class='maxbalance' @click='setMaxBalance'>Max: {{ crvBalanceText }}</span>
				</p>
				<p class='depositinputs'>
					<label for='incraselock'>Lock time:</label>
					<datepicker 
						id='increaselock' 
						name='increaselock' 
						v-model='increaseLock'
						:disabled-dates='disabledDates'
						:open-date='openDate'
					></datepicker>
				</p>
				<button @click='createLock'>Create lock</button>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import Datepicker from 'vuejs-datepicker';

	import { contract } from '../../contract'

	import daoabis from '../dao/allabis'
	console.log(daoabis, "DAO ABIS")

	import * as helpers from '../../utils/helpers'

	import BN from 'bignumber.js'

	export default {
		components: {
			Datepicker,
		},

		data: () => ({
			CRV: null,
			crvBalance: BN(0),
			votingEscrow: null,
			vecrvBalance: BN(0),
			lockTime: 0,
			deposit: 0,
			increaseLock: Date.now(),

		}),

		async created() {
			this.$watch(() => contract.default_account && contract.multicall, val => {
				if(val)
					this.mounted()
			})
		},

		computed: {
			crvBalanceText() {
				return this.crvBalance.div(1e18).toFixed(2,1)
			},
			vecrvBalanceText() {
				return this.vecrvBalance.div(1e18).toFixed(2,1)
			},
			lockTimeText() {
				return helpers.formatDateToHuman(this.lockTime)
			},
			publicPath() {
				return process.env.BASE_URL
			},
			disabledDates() {
				return {
					to: new Date(this.lockTime * 1000) 
				}
			},
			openDate() {
				return new Date(this.lockTime * 1000)
			},
			hasvecrv() {
				return this.vecrvBalance.gt(0)
			},
		},

		methods: {
			async mounted() {
				console.log("HERE ")
				this.votingEscrow = new web3.eth.Contract(daoabis.votingescrow_abi, daoabis.votingescrow_address)
				this.CRV = new web3.eth.Contract(daoabis.CRV_abi, daoabis.CRV_address)

				let calls = [
					[this.votingEscrow._address, this.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[this.votingEscrow._address, this.votingEscrow.methods.locked__end(contract.default_account).encodeABI()],
					[this.CRV._address, this.CRV.methods.balanceOf(contract.default_account).encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				this.vecrvBalance = BN(decoded[0])
				this.lockTime = +decoded[1]
				this.increaseLock = new Date(this.lockTime * 1000)
				if(this.lockTime == 0)
					this.lockTime = Date.now()
				this.crvBalance = BN(decoded[2])
			},

			setMaxBalance() {
				this.deposit = this.crvBalance.div(1e18).toString()
			},

			async increaseAmount() {
				let deposit = BN(this.deposit).times(1e18).toFixed(0,1)
				await this.votingEscrow.methods.increase_amount(deposit).send({
					from: contract.default_account,
					gas: 400000,
				})
			},

			async submitIncreaseLock() {
				let lockTime = BN(this.increaseLock).toFixed(0,1)
				await this.votingEscrow.methods.increase_unlock_time(lockTime).send({
					from: contract.default_account,
					gas: 4000000,
				})
			},

			async createLock() {
				let deposit = BN(this.deposit).times(1e18).toFixed(0,1)
				let lockTime = BN(this.increaseLock).toFixed(0,1)
				await this.votingEscrow.methods.create_lock(deposit, lockTime).send({
					from: contract.default_account,
					gas: 400000,
				})
			},
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	.depositinputs >>>input {
		width: 6em;
	}
	.maxbalance {
		margin-left: 1em;
		cursor: pointer;
	}
	.maxbalance:hover {
		text-decoration: underline;
	}
	.vdp-datepicker {
		display: inline-block;
	}
	button {
		margin-top: 1em;
	}
</style>