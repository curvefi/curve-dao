import Vue from 'vue'

export let state = Vue.observable({
	txError: null,
})

export function handleError(error) {
	if(error && error.message && error.message.length < 100)
		state.txError = error.message
}