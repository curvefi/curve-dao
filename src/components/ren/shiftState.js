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

	showModal: false,

	msg_signature: null,
	password: null,
	aes_key: null,
	fireUser: null,

	loaded: false,
	adapterContract: null,
})

export function hasIncomplete() {
	let len = 0
	for(let [key, value] of Object.entries(localStorage)) {
		if(!key.startsWith('curvebtc_')) continue;
		value = JSON.parse(value)
		if(value.removed) continue;
		if([0,3].includes(value.type) && ![14,15].includes(value.state)) len++
		if(value.type == 1 && value.state != 65) len++
	}
	return len
}