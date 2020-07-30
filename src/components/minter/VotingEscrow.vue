<template>
	<div :class="{'window white': showvelock}">

		<div id='modal' class='rootmodal modal' v-show='showModal' @click.self='showModal = false'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='showModal = false'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Confirm lock</legend>
					<div class='content'>
						Confirm locking {{ deposit }} CRV until {{ increaseLockText }}
					</div>
					<p class='info-message gentle-message' v-show='showConfirmMessage'>
						Please confirm the transaction in your wallet
					</p>
					<button @click='submitModal'> OK </button>
				</fieldset>
			</div>
		</div>

		<fieldset>
			<legend>
				Voting power in DAO
			</legend>
			<div>
				CRV <img class='icon small' :src="publicPath + 'logo.png'"> balance: {{ crvBalanceText }}
			</div>
			<div v-show='hasvecrv'>
				<div>
					Balance in Voting Escrow: {{ vecrvBalanceText }} veCRV
				</div>
				<div>
					<img :src="publicPath + 'lock-solid.svg'" class='icon small'> Locked until: {{ lockTimeText }}
				</div>
			</div>
			<div class='velock' v-show='showvelock'>
				<div class='increaselock' v-show='hasvecrv'>
					<p class='depositinputs'>
						<label for='deposit'>Increase amount:</label>
						<input id='deposit' type='text' :class = "{'invalid': isInvalidAmount}" v-model='deposit'>
						<span class='maxbalance' @click='setMaxBalance'>Max: {{ crvBalanceText }}</span>
						<br>
						<button @click="confirmModal('increaseAmount')">Add</button>
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
						<button @click="confirmModal('submitIncreaseLock')">Increase lock</button>
					</p>
				</div>
				<div class='increaselock' v-show='!hasvecrv'>
					<p class='depositinputs'>
						<label for='deposit'>Amount:</label>
						<input id='deposit' type='text' :class = "{'invalid': isInvalidAmount}" v-model='deposit'>
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
					<button @click="confirmModal('createLock')">Create lock</button>
				</div>
				<p>
					Your starting voting power will be: {{ newVotingPower() }} veCRV
				</p>
				<p class='info-message gentle-message' v-show='newVotingPower() < 2500'>
					You need at least 2500 veCRV to be able to create a vote
				</p>
			</div>
			<div v-show='!showvelock'>
				<slot></slot>
			</div>
		</fieldset>
	</div>
</template>

<script>
    import * as common from '../../utils/common.js'

	const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic')

	import Datepicker from 'vuejs-datepicker';

	import { contract } from '../../contract'

	import daoabis from '../dao/allabis'

	import * as helpers from '../../utils/helpers'

	import BN from 'bignumber.js'

	export default {
		props: {
			showvelock: {
				type: Boolean,
				default: true,
			},
		},

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

			interval: null,

			showModal: false,
			showConfirmMessage: false,

			method: null,

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
					to: new Date((this.lockTime + 604800) * 1000),
					from: new Date(Date.now() + 126144000000),
				}
			},
			openDate() {
				return new Date((this.lockTime + 604800) * 1000)
			},
			hasvecrv() {
				return this.vecrvBalance.gt(0)
			},
			isInvalidAmount() {
				return this.deposit <= 0 || BN(this.deposit).gt(this.crvBalance.div(1e18))
			},
			increaseLockText() {
				return helpers.formatDateToHuman(Date.parse(this.increaseLock) / 1000)
			},
		},

		methods: {
			async mounted() {
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
				this.increaseLock = new Date((this.lockTime + 604800)* 1000)
				if(this.lockTime == 0) {
					this.lockTime = Date.now() / 1000
					this.increaseLock = new Date(Date.now() + 604800 * 1000)
				}
				this.crvBalance = BN(decoded[2])
				this.deposit = this.crvBalance.div(1e18).toFixed(0,1)

				if(this.crvBalance.gt(0)) {
					this.interval = setIntervalAsync(this.newVotingPower, 10000)
				}
			},

			setMaxBalance() {
				this.deposit = this.crvBalance.div(1e18).toString()
			},

			async increaseAmount() {
				this.showConfirmMessage = true;

				let deposit = BN(this.deposit).times(1e18)
				if(deposit.gt(this.crvBalance))
					deposit = this.crvBalance
				await common.approveAmount(this.CRV, deposit, contract.default_account, this.votingEscrow._address)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_amount(deposit.toFixed(0,1)).send({
							from: contract.default_account,
							gas: 1000000,
						})
						.once('transactionHash', () => resolve())
						.on('error', err => reject(err))
						.on('receipt', receipt => {
							this.mounted()
						})
				})
				this.showConfirmMessage = false
				this.showModal = false
			},

			async submitIncreaseLock() {
				this.showConfirmMessage = true;

				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.increase_unlock_time(lockTime).send({
							from: contract.default_account,
							gas: 10000000,
						})
						.once('transactionHash', () => resolve())
						.on('error', err => reject(err))
						.on('receipt', receipt => {
							this.mounted()
						})
				})
				this.showConfirmMessage = false
				this.showModal = false
			},

			async createLock() {
				this.showConfirmMessage = true;
				console.log("INCREASE LOCK")

				let deposit = BN(this.deposit).times(1e18)
				if(deposit.gt(this.crvBalance))
					deposit = this.crvBalance
				await common.approveAmount(this.CRV, deposit, contract.default_account, this.votingEscrow._address)
				let lockTime = BN(Date.parse(this.increaseLock) / 1000).toFixed(0,1)
				await new Promise(async (resolve, reject) => {
						await this.votingEscrow.methods.create_lock(deposit.toFixed(0,1), lockTime).send({
							from: contract.default_account,
							gas: 1000000,
						})
						.once('transactionHash', () => resolve())
						.on('error', err => reject(err))
						.on('receipt', receipt => {
							this.mounted()
						})
				})
				this.showConfirmMessage = false
				this.showModal = false
			},

			async confirmModal(method) {
				this.method = method
				this.showModal = true
			},

			async submitModal(method) {
				this[this.method]()
			},

			newVotingPower() {
				let lockTime = Date.parse(this.increaseLock)
				let deposit = BN(this.deposit).plus(this.vecrvBalance / 1e18)

				return deposit.times((lockTime - Date.now()) / 1000).div(86400 * 365).div(4).toFixed(0,2)
			},

			beforeDestroy() {
				this.interval && clearIntervalAsync(this.interval)
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
		margin-top: 0.8em;
	}
	.depositinputs label {
		margin-right: 0.4em;
	}
	.depositinputs input.invalid {
		background: red;
	}
	.modal-content .content {
		color: black;
	}
</style>