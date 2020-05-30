<template>
	<div>
		<span v-show='state == 0'>
			Waiting for renVM BTC deposit address
		</span>
		<span v-show='state == 1'>
			Waiting for deposit on BTC address
		</span>
		<span v-show='state >= 2 && state <= 9	'>
			Waiting for BTC confirmation
		</span>
		<span v-show='state == 10'>
			Waiting for renVM
		</span>
		<span v-show='state == 11'>
			Got BTC {{ (transaction.utxoAmount / 1e8).toFixed(8) }}, now initiating swap
		</span>
		<span v-show='state == 12'>
			Waiting for swap confirmation
		</span>
		<span v-show='state == 14'>
			Swap done
		</span>
		<span v-show='state == 15'>
			Got {{ (transaction.utxoAmount / 1e8).toFixed(8) }} renBTC, do you want to 
			<button @click="$emit('mint', transaction)">swap</button>
		</span>
		<span v-show='state == 13'>
			Exchange rates expired, you got {{ (transaction.utxoAmount / 1e8).toFixed(8) }} BTC shifted to renBTC.
			If you want to continue swapping to WBTC, go to the <router-link to="/ren/swap">swap page</router-link>
		</span>
		<span v-show='state == 16'>
			ETH transaction failed
			<button @click="$emit('mint', transaction)">resubmit</button>
		</span>

		<span v-show='state == 8'>
			Swap done
		</span>

		<span v-show='state == 30'>
			Started swap WBTC->BTC
		</span>

		<span v-show='state >= 30 && state <= 60'>
			Waiting for confirmations
		</span>

		<span v-show='state == 61'>
			Submitted to RenVM
		</span>

		<span v-show='state == 62'>
			Waiting for RenVM
		</span>

		<span v-show='state == 63'>
			BTC sent
		</span>
	</div>
</template>

<script>
	import BN from 'bignumber.js'

	export default {
		props: ['state', 'transaction'],
		computed: {
			renFee() {
				return BN(this.transaction.utxoAmount).times(1e8).times(0.001).div(1e8).toFixed()
			},
		}
	}
</script>

<style scoped>
	button {
		box-shadow: none;
	}
</style>