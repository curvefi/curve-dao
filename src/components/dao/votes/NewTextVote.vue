<template>
	<div>
		<modal>
			<template v-slot:activate='{ show }'>
				<div v-show = 'canCreateNewVote' @click='show'>
					<button class='simplebutton'>New vote</button>
				</div>
			</template>
			<template v-slot:title>
				Create new vote
			</template>
			<div class='content'>
				<label for='newtextvote'>Vote description:</label>
				<textarea id='newtextvote' v-model='description'></textarea>
			</div>
			<template v-slot:submit>
				<span @click='submit'>Submit <span class='loading line' v-show='loading'></span></span>
			</template>
		</modal>
	</div>
</template>

<script>
	import { contract } from '../../../contract'

	import { Voting } from '@aragon/connect-thegraph-voting'

	import Modal from '../common/Modal'

	import { state, helpers as voteHelpers } from '../voteStore'

	export default {

		components: {
			Modal,
		},

		data: () => ({
			description: '',
			loading: false,

			canCreateNewVote: false,
		}),

		async created() {
			this.$watch(() => state.initialized, val => {
				if(val) this.created()
			}, {
				immediate: true,
			})
		},

		computed: {
			
		},

		methods: {
			async created() {
				this.canCreateNewVote = await voteHelpers.canCreateNewVote()
			},
			async submit() {
				this.loading = true
				let intent
				try {
					intent = await state.org.appIntent("0x96b58c29c74fce0abfe7c0c62225095f47a91a6d", 'newVote', ['0x00000001', this.description])
				}
				catch(err) {
					console.error(err)
				}
				let paths = await intent.paths(contract.default_account)

				state.transactionIntent = paths

				this.loading = false
				state.showModal = false

				state.showRootModal = true


				console.log(paths, "THEPATH")
			},
		},
	}
</script>

<style scoped>
	.content {
		display: flex;
		flex-wrap: wrap;
		color: black;
	}
	.content input {
		
	}
	textarea {
		margin-top: 1em;
		font-size: 1em;
	}
</style>