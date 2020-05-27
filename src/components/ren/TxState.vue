<template>
	<div>
		<span v-show='state == 0'>
			Waiting for renVM BTC deposit address
		</span>
		<span v-show='state == 1'>
			Waiting for deposit on BTC address
		</span>
		<span v-show='state == 2'>
			Waiting for BTC confirmation
		</span>
		<span v-show='state == 3'>
			Waiting for renVM
		</span>
		<span v-show='state == 4'>
			Got BTC {{ (transaction.utxoAmount / 1e8).toFixed(8) }}, now initiating swap
		</span>
		<span v-show='state == 5'>
			Swap ready
		</span>
		<span v-show='state == 5'>
			Swap ready
		</span>
		<span v-show='state == 6'>
			Got {{ (transaction.utxoAmount / 1e8).toFixed(8) }} renBTC, do you want to 
			<button @click="$emit('mint', transaction)">swap</button>
		</span>
		<span v-show='state == 7'>
			Exchange rates expired, you got {{ (transaction.utxoAmount / 1e8).toFixed(8) }} BTC shifted to renBTC.
			If you want to continue swapping to WBTC, go to the <router-link to="/ren/swap">swap page</router-link>
		</span>

		<span v-show='state == 30'>
			Started swap WBTC->BTC
		</span>

		<span v-show='state == 31'>
			Submitted to RenVM
		</span>

		<span v-show='state == 32'>
			Waiting for RenVM
		</span>

		<span v-show='state == 33'>
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