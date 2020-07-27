import { notify, notifyHandler, notifyNotification } from '../../../init'

import { state, getVotingAppName, getSupportQuorum } from '../voteStore'

export default {

	data: () => ({
		showRootModal: false,
		willSucceed: true,
	}),

	computed: {
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
    	getSupportText() {
    		return getSupportQuorum(this.appName).support
    	},
    	getQuorumText() {
    		return getSupportQuorum(this.appName).quorum
    	},
    	voteDescription() {
    		console.log(this.transactionPath, "TRANSACTION PATH DESCRIPTION")
    		return this.transactionPath.transactions[0].description
    	},
    	executeVote() {
    		return state.executeVote
    	},

	},

	methods: {
		async createVote() {
			let data = this.transactionPath.transactions[0]

			console.log(data, "THE TX DATA")

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

			this.showRootModal = false
		},
		hideRootModal() {
			this.showRootModal = false
			state.executeVote = false
		},
	},
}