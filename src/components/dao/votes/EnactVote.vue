<template>
	<span>
		<div id='modal' class='modal rootmodal' v-if='showRootModal' @click.self='hideRootModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideRootModal'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Execute vote #{{ vote.voteNumber }} on {{ appName }}</legend>
					<div class='content'>
						<div>
							<span> {{ voteDescription }} </span>
							<div class='content' v-if='vote'>
								<span v-show='vote.contractName'>
									{{ vote.contractName }}: <span v-html='vote.description'></span>
								</span>
								<span v-show='!vote.contractName && vote.metadata'>
									{{ vote.metadata }}
								</span>
								<span v-show='!vote.contractName && vote.description'>
									<span v-html='vote.description'></span>
								</span>
							</div>
						</div>
						<hr>
						<p class='explanation' v-show='!executeVote'>
							This vote requires {{ getSupportText }}% acceptance and {{ getQuorumText }}% quorum to be passed
						</p>
						<p class='simple-error' v-show='!willSucceed'>
							The transaction may fail, you may not have the required permissions to make the transaction
						</p>
					</div>
					<button @click='createVote'>Execute</button>
				</fieldset>
			</div>
		</div>

		<button v-show='canExecute' @click='enact'>Enact <span class='loading line' v-show='loading'></span></button>
	</span>
</template>

<script>
	import { contract } from '../../../contract'

	import { state, OWNERSHIP_APP_ADDRESS, PARAMETER_APP_ADDRESS, helpers as voteHelpers } from '../voteStore'

	import RootModalMixin from '../common/RootModalMixin'

	export default {
		props: ['vote'],

		mixins: [RootModalMixin],

		data: () => ({
			loading: false,
		}),

		computed: {
			canExecute() {
				return voteHelpers.canExecute(this.vote)
			},
		},

		methods: {
			async enact() {
				console.log("ENACT")
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

				this.showRootModal = true
				state.executeVote = true


				console.log(paths, "THEPATH")
			},
		}
	}
</script>

<style scoped>
	
</style>