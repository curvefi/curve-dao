import Vue from 'vue'

import BN from 'bignumber.js'

export let state = Vue.observable({
	vecrvBalance: BN(0),
	deposit: 0,
	increaseLock: Date.now()
})

export function newVotingPower() {
	let lockTime = Date.parse(state.increaseLock)
	let deposit = BN(state.deposit)

	return deposit.times((lockTime - Date.now()) / 1000).div(86400 * 365).div(4).plus(state.vecrvBalance / 1e18)
}