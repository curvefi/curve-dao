<template>
	<div class='window white'>
		<fieldset>
			<legend>Gauge Weight Voting</legend>
			<p class='info-message gentle-message'>
				You can vote for gauge weight with your veCRV tokens(locked CRV tokens in <router-link to="/locker">Locker</router-link>). Gauge weights are used to determine how much CRV does each pool get
			</p>
			<p class='info-message gentle-message' v-show='+balance == 0'>
				You need to have CRV locked in <router-link to="/locker">Locker</router-link> in order to vote for gauge weights
			</p>
			<p class='info-message gentle-message' v-show='+balance > 0'>
				You're voting with {{ balanceFormat }} veCRV
			</p>
			<p class='info-message gentle-message' v-show='lockExpiresSoon'>
				Your lock expires soon. You need to lock at least for a week in <router-link to="/locker">Locker</router-link>
			</p>
			<p class='info-message gentle-message' v-show='voteIsOften'>
				You can vote only once in 10 days
			</p>
			<p class='info-message gentle-message' v-show='tooMuchPower'>
				You alrady used too much power for this gauge
			</p>
			<div class='gaugeweight'>
				<div class='input'>
					<select class='tvision' v-model='selectedGauge'>
						<option v-for='(gauge, address) in gaugesNames' :value='address'>
							{{ gauge }} {{ shortenAddress(address) }}
						</option>
					</select>
					<div class='weight'>
						<label for='weight'>Weight of your voting(in BPS):</label>
						<input id='weight' type='text' :class="{'invalid': isInvalidWeight}" v-model='weight'>
						<div class='allocationInfo'> {{ weightAllocated }} ({{ weight / 100 }} %) of your voting power will be allocated to this gauge</div>
					</div>
				</div>

				<gas-price></gas-price>

				<p class='info-message gentle-message' v-show='message'>
					{{ message }}
				</p>

				<div>
					<button :disabled='disabled' @click='submit'>Submit</button>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { contract, getters } from '../../../contract'
	import { notify, notifyHandler, notifyNotification } from '../../../init'

	import daoabis from '../../dao/allabis'

	import * as gasPriceStore from '../../common/gasPriceStore'
    import GasPrice from '../../common/GasPrice.vue'

	import BN from 'bignumber.js'

	const WEEK = 604800

	const WEIGHT_VOTE_DELAY = 10 * 86400

	export default {
		components: {
			GasPrice,
		},

		data: () => ({
			votingEscrow: null,
			gaugeController: null,

			gaugesNames: {
			  "0x0000000000000000000000000000000000000000": 'Select a gauge',
			  "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575": 'compound',
			  "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53": 'usdt',
			  "0xFA712EE4788C042e2B7BB55E6cb8ec569C4530c1": 'y',
			  "0x69Fb7c45726cfE2baDeE8317005d3F94bE838840": 'busd',
			  "0x64E3C23bfc40722d3B649844055F1D51c1ac041d": 'pax',
			  "0xB1F2cdeC61db658F091671F5f199635aEF202CAC": 'ren',
			  "0xA90996896660DEcC6E997655E065b23788857849": 'susdv2',
			  "0x705350c4BcD35c9441419DdD5d2f097d7a55410F": 'sbtc',
			},
			selectedGauge: "0x0000000000000000000000000000000000000000",
			weight: 1,
			balance: null,
			lock_end: null,
			next_time: null,
			last_user_vote: null,
			old_slope: null,
			power_used: null,

			message: '',
		}),

		async created() {
			this.$watch(() => contract.initializedContracts, (val, oldval) => {
				console.log(val, "THE VAL")
			 	if(val) this.mounted()
			})
		},

		async mounted() {
			if(contract.multicall) {
				this.mounted()
			}
		},

		watch: {
			async selectedGauge(val) {
				this.last_user_vote = await this.gaugeController.methods.last_user_vote(contract.default_account, this.selectedGauge).call()
				this.old_slope = await this.gaugeController.methods.vote_user_slopes(contract.default_account, this.selectedGauge).call()
			},
		},

		computed: {
			lockExpiresSoon() {
				return this.lock_end <= this.next_time
			},
			voteIsOften() {
				return (Date.now() / 1000) < this.last_user_vote + WEIGHT_VOTE_DELAY
			},
			balanceFormat() {
				return (this.balance / 1e18).toFixed(2)
			},
			isInvalidWeight() {
				return this.weight <= 0 || this.weight > 10000 || isNaN(+this.weight)
			},
			weightAllocated() {
				return (this.weight / 10000 * this.balance / 1e18).toFixed(8)
			},
			tooMuchPower() {
				if(this.old_slope === null) return false
				let power_used = this.power_used
				power_used = power_used + this.weight - +this.old_slope.power
				return !(power_used >= 0 || power_used <= 10000)
			},
			gasPrice() {
                return gasPriceStore.state.gasPrice
            },
            gasPriceWei() {
                return gasPriceStore.state.gasPriceWei
            },
            disabled() {
            	return this.selectedGauge == "0x0000000000000000000000000000000000000000"
            },
		},

		methods: {
			async mounted() {
				this.votingEscrow = new web3.eth.Contract(daoabis.votingescrow_abi, '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2')
				this.gaugeController = new contract.web3.eth.Contract(daoabis.gaugecontroller_abi, '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB')

				let calls = [
					[this.votingEscrow._address, this.votingEscrow.methods.balanceOf(contract.default_account).encodeABI()],
					[this.votingEscrow._address, this.votingEscrow.methods.locked__end(contract.default_account).encodeABI()],
					[this.gaugeController._address, this.gaugeController.methods.vote_user_power(contract.default_account).encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				this.balance = +decoded[0]
				this.lock_end = +decoded[1]
				this.power_used = +decoded[2]
				this.next_time = ((Date.now() / 1000) + WEEK) / WEEK * WEEK
			},

			shortenAddress(address) {
				if(!address) return ''
				if(address == "0x0000000000000000000000000000000000000000") return ''
				return address.slice(0,6) + '...' + address.slice(-6)
			},

			async submit() {
				var { dismiss } = notifyNotification(`Please confirm voting for ${this.gaugesNames[this.selectedGauge]} gauge with ${this.weight}`)
				await this.gaugeController.methods.vote_for_gauge_weights(this.selectedGauge, BN(this.weight).toFixed(0,1))
					.send({
						from: contract.default_account,
						gasPrice: this.gasPriceWei,
						gas: 600000,
					})
					.once('transactionHash', hash => {
						dismiss()
						notifyHandler(hash)
						this.message = `You voted for ${this.gaugesNames[this.selectedGauge]} with ${this.weight}, you can continue and vote for other gauges`
						setTimeout(() => this.message = '', 4000)
					})
			},
		},
	}
</script>

<style scoped>
	select.tvision {
		box-shadow: none
	}
	.weight {
		margin-top: 1em;
	}
	.weight input {
		width: 4em;
	}
	.weight input.invalid {
		background: red;
	}
	.allocationInfo {
		margin-top: 1em;
	}
	button {
		margin-top: 1em;
	}
	.gaugeweight {
		margin-top: 1em;
	}
	select option {
		text-align: justify;
	}
</style>