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