<template>
	<div>
		<div id='modal' class='modal' v-show='showModal' @click.self='showModal = false'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='showModal = false'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>Create a vote on {{ appName }}</legend>
					<div class='content'>
						<div>
							{{ description }}
						</div>
						<hr>
						<p class='explanation'>
							This vote requires 51% acceptance and 50% quorum to be passed
						</p>
					</div>
					<button @click='createVote'>Submit</button>
				</fieldset>
			</div>
		</div>
	</div>
</template>

<script>
    import { notify, notifyHandler, notifyNotification } from '../../../init'

	import { state, getVotingAppName } from '../voteStore'

	export default {
		data: () => ({

		}),

		computed: {
			showModal: {
        		get() {
        			return state.showRootModal
        		},
        		set(value) {
        			state.showRootModal = value
        		},
        	},
        	transactionIntent() {
        		return state.transactionIntent
        	},
        	transactionPath() {
        		if(Array.isArray(this.transactionIntent))
        			return this.transactionIntent[0]
        		return this.transactionIntent
        	},
        	appName() {
        		console.log(this.transactionPath.destination, "THE TX PATH DESTINATION")
        		return getVotingAppName(this.transactionPath.destination.address)
        	},
        	description() {
        		return this.transactionPath.transactions[0].description
        	},

		},

		methods: {
			async createVote() {
				let data = this.transactionPath.transactions[0]
				await web3.eth.sendTransaction(data)
			},
		},
	}
</script>

<style scoped>
	#modal {
		z-index: 3;
	}
	.modal-content {
		text-align: center;
		padding: 0;
		border: none;
		width: 460px;
	}
	.modal-content fieldset {
		color: white;
		font-weight: bolder;
		border: 6px double white;
		padding-block-start: 1em;
		padding-block-end: 1em;
	}
	.modal-content legend {
		color: black;
	}
	.modal-content button {
		margin-top: 0.6em;
		padding: 0 2em;
	}
	.legend2 {
	  position: absolute;
	  top: 0;
	  left: 2em;
	  background: #c0c0c0;
	  line-height:1.2em;
	}
	.greentext {
		color: green;
	}
	.legend2 .greentext {
		display: inline-block;
		transform: translate3d(0,-0.1em,10em);
	}
	.legend2 .greentext:hover {
		transform: none;
	}
	.hoverpointer {
		cursor: pointer;
	}
	.content {
		color: black;
		text-align: left;
	}
</style>