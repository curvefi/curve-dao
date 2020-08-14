<template>
	<div>
		<div id='modal' class='modal' v-show='showModal' @click.self='hideModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='hideModal'>
						[<span class='greentext'>■</span>]
					</div>
					<legend v-show='!executeVote'>Create a vote on {{ appName }}</legend>
					<legend v-show='executeVote'>Execute a vote on {{ appName }}</legend>
					<div class='content'>
						<div>
							<span> {{ description }} </span>
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
					<button @click='createVote' v-show='!executeVote'>Create Vote</button>
					<button @click='createVote' v-show='executeVote'>Vote</button>
				</fieldset>
			</div>
		</div>
	</div>
</template>

<script>
    import { notify, notifyHandler, notifyNotification } from '../../../init'

	import { state, getVotingAppName, getSupportQuorum } from '../voteStore'

	export default {
		props: ['vote'],

		data: () => ({
			willSucceed: true,
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
        		return getVotingAppName(this.transactionPath.destination.address)
        	},
        	getSupportText() {
        		return getSupportQuorum(this.appName).support
        	},
        	getQuorumText() {
        		return getSupportQuorum(this.appName).quorum
        	},
        	description() {
        		return this.transactionPath.transactions[0].description
        	},
        	executeVote() {
        		return state.executeVote
        	},

		},

		methods: {
			async createVote() {
				let data = this.transactionPath.transactions[0]


				try {
					await web3.eth.estimateGas(data)
				}
				catch(err) {
					this.willSucceed = false
				}
				
				await new Promise((resolve, reject) => 
					web3.eth.sendTransaction(data)
						.once('transactionHash', resolve)
						.on('error', reject)
				)

				state.showRootModal = false
			},
			hideModal() {
				this.showModal = false
				state.executeVote = false
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
	.explanation {
		font-size: 0.8em;
	}
</style>