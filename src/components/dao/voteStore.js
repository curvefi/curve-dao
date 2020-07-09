import Vue from 'vue'
import * as allabis from './allabis'

export let state = Vue.observable({
	apps: [],
	votes: [],
})

export const OWNERSHIP_VOTE_TIME = 3600
export const PARAMETER_VOTE_TIME = 3600
export const OWNERSHIP_APP_ADDRESS = '0xE0Ceb216ff30B7E4A79F9aE21eCb98766bC60261'
export const PARAMETER_APP_ADDRESS = '0x4FE4e8412c1C04127A64AECb60a857975E2ceE71'

export let contractMap = {
	[allabis.poolproxy_address]: 'Pool Proxy',
	[allabis.votingescrow_address]: 'Voting Escrow',
	[allabis.gaugecontroller_address]: 'Gauge Controller',
}

export let getters = {
	votes() {
		return state.votes
	},
	openVotes() {
		return state.votes.filter(vote => vote.startDate > (new Date().getTime() / 1000) - OWNERSHIP_VOTE_TIME)
	},
	closedVotes() {
		return state.votes.filter(vote => vote.startDate < (new Date().getTime() / 1000) - OWNERSHIP_VOTE_TIME)
	}
}

export let helpers = {
	isOpen(vote) {
		return vote.startDate > (new Date().getTime() / 1000) - OWNERSHIP_VOTE_TIME
	},
}