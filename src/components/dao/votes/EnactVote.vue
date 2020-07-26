<template>
	<span>
		<button @click='enact'>Enact <span class='loading line' v-show='loading'></span></button>
	</span>
</template>

<script>
	import { contract } from '../../../contract'

	import { state, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, helpers as voteHelpers } from '../voteStore'

	export default {
		props: ['vote'],

		data: () => ({
			loading: false,
		}),

		methods: {
			async enact() {
				this.loading = true
				let intent
				try {
					intent = await state.org.appIntent(this.vote.appAddress.toLowerCase(), 'executeVote(uint256)', [this.vote.voteNumber])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				state.transactionIntent = paths

				this.loading = false
				state.showModal = false

				state.showRootModal = true
				state.executeVote = true


				console.log(paths, "THEPATH")
			},
		}
	}
</script>

<style scoped>
	
</style>