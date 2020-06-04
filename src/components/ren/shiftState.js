import Vue from 'vue'

export const state = Vue.observable({

	address: null,
	sdk: null,

	transactions: [],

	address: null,
	default_account: null,

	minersFee: 35000,
	minersLockFee: 0,
	minersReleaseFee: 0,
	mintFee: 0,
	burnFee: 0,

	confirmations: 6,

	space: null,
	box: null,

	adapterContract: null,
})

export function hasIncomplete() {
	for(let [key, value] of Object.entries(localStorage)) {
		if(!key.startsWith('curvebtc_')) continue;
		if([0,3].includes(value.type) && ![14,15].includes(value.state)) return true
		if(value.type == 1 && value.state != 65) return true
	}
}