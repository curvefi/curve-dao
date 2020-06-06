import Vue from 'vue'
import * as helpers from '../../utils/helpers'
export let state = Vue.observable({
	suscription: null,
})

export function setSubscription(subscription) {
	state.subscription = subscription
}

export async function init() {
	let swregistration = await navigator.serviceWorker.ready
	let subscription = swregistration.pushManager.getSubscription()
	console.log(subscription, "THE SUBSCRIPTION YOU GOT")
	if(subscription !== null) {
	  await updateSubscriptionServer(subscription)
	  setSubscription(subscription)
	}
}

export async function subscribeNotifications() {
	let swregistration = navigator.serviceWorker.ready
	let response = await fetch('https://pushservice.curve.fi/vapidPublicKey');
    let vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    let convertedVapidKey = helpers.urlBase64ToUint8Array(vapidPublicKey);

    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    let subscription = await swregistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    await registerSubscription(subscription)
    state.subscription = subscription
}

export async function unsubscribeNotifications() {
	let swregistration = navigator.serviceWorker.ready
	let subscription = swregistration.pushManager.getSubscription()
	await subscription.unsubscribe()
	await fetch('https://pushservice.curve.fi/removeSubscription', {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify({
			subscription: subscription,
		})
	})
	state.subscription = null
}

export async function updateSubscriptionServer(newSubscription) {
	await fetch('https://pushservice.curve.fi/updateSubscription', {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify({
			oldSubscription: state.subscription,
			newSubscription: newSubscription, 
		})
	})
	state.subscription = newSubscription
}

export async function registerSubscription(subscription) {
	await fetch('https://pushservice.curve.fi/register', {
		method: 'post',
		headers: {
		  'Content-type': 'application/json'
		},
		body: JSON.stringify({
		  subscription: subscription
		}),
	});
}

export async function postTxNotification(txHash) {
	let subscription = state.subscription
	console.log(subscription)
	return fetch('https://pushservice.curve.fi/addtx', 
		{
		    method: 'POST', 
		    headers: {
		      'Content-Type': 'application/json'
		      // 'Content-Type': 'application/x-www-form-urlencoded',
		    },
		    body: JSON.stringify({ subscription, txHash: txHash})
		})
}
