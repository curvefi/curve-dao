<template>
	<div class='transaction-table'>
		<button class='simplebutton' @click='use3Box'>
			<span v-show='space === null'>
				Use permanent storage
				<span class='tooltip'> [?]
					<span class='tooltiptext long'>
						Use 3box instead of local storage
						<!-- Data about ren transaction is stored in local storage, which can be cleared, currently.
						That means if you clear the storage, a loss of funds may occur.
						Using 3box permanent storage is recommended.  -->
					</span>
				</span>
			</span>
			<span v-show='space !== null'>Permanent storage loaded</span>
		</button>

		<div id='modal' class='modal' v-show='showModal'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='showModal = false'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>QR CODE</legend>
					<vue-qrcode :value="qrValue" :options="qrOptions"></vue-qrcode>
					<button @click='showModal =false'> OK </button>
				</fieldset>
			</div>
		</div>


		<span class='notification tooltip' @click='showNotifications'>
			<img src='bell-solid.svg' class='bell notification icon hoverpointer'>
			<span class='tooltiptext'>
				Enable push notifications on transactions received
			</span>
		</span>

		<p v-show='transactions.filter(t => t.removed).length'>
			<input id='showremoved' type='checkbox' v-model='showRemoved'/>
			<label for='showremoved'>Show removed transactions</label>
		</p>

		<div class='info-message gentle-message' v-show='showCompleted'>
			Swap completed
		</div>

		<table class='tui-table'>
			<thead>
				<tr>
					<th>Type</th>
					<th>BTC Address</th>
					<th>Confirmations</th>
					<th>Status</th>
					<th>Progress</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for='transaction in filteredTransactions'>
					<td class='shifttype'>
						{{ transaction.type == 0 ? 'BTC->wBTC' : 'wBTC->BTC' }}
					</td>
					<td>
						<span :class="{'loading line': !transaction.gatewayAddress }"></span>
						<span class='nowrap' v-show='transaction.gatewayAddress'>
							<span class='hoverpointer tooltip' @click='copy(transaction)'>
								{{shortenAddress(transaction.gatewayAddress)}}
								<span class='tooltiptext long'>
									{{transaction.gatewayAddress}}
								</span>
							</span>
							<span class='hoverpointer' v-show='[0,3].includes(transaction.type)' @click='copy(transaction)'>
								<span class='tooltip'>
									<img class='icon small' src='@/assets/copy-solid.svg'>
									<span class='tooltiptext small'>{{ copied == false ? 'Copy' : 'Copied' }}</span>
								</span>
							</span>
							<img class='icon small hoverpointer' v-show='[0,3].includes(transaction.type)'
								@click='showQR(transaction)' src='@/assets/qrcode-solid.svg'>
						</span>
					</td>
					<td>
						<a :href="getTxHashLink(transaction)" target="_blank" rel="noopener noreferrer"> 
							<span v-show='[0,3].includes(transaction.type) && transaction.state < 10'>{{ transaction.confirmations }} / 6</span>
							<span v-show='[0,3].includes(transaction.type) && transaction.state >= 10 && transaction.state < 14'>Confirmed</span>
							<span v-show='[0,3].includes(transaction.type) && [14,15].includes(transaction.state)'>
								Done
							</span>
							<span v-show='transaction.type == 1 && transaction.state >= 30 && transaction.state < 60'> {{ transaction.confirmations }} / 30 </span>
							<span v-show='transaction.type == 1 && transaction.state > 60'> {{ transaction.confirmations }}  </span>
						</a>
						<div v-show='[0,3].includes(transaction.type) && transaction.state == 14'>
							<a :href="'https://etherscan.io/tx/' + transaction.ethTxHash" target="_blank" rel="noopener noreferrer">Etherscan</a>
						</div>
					</td>
					<td>
						<tx-state 
							:state='transaction.state' 
							:transaction='transaction'
							@swapNow='swapNow'
							@receiveRen='receiveRen'
							@depositNow='depositNow'
							@receiveRenDeposit='receiveRenDeposit'
							@mint='mintThenSwap'
							/>
					</td>
					<td class='nowrap'>
						<span v-show='[0,3].includes(transaction.type)'>
							{{ txProgress(transaction) }}%
							<span :class="{'loading line': txProgress(transaction) < 100}"></span>
						</span>
						<span v-show='transaction.type == 1'>
							{{ txProgress(transaction) }}%
							<span :class="{'loading line': txProgress(transaction) < 100}"></span>
						</span>
						<span v-show='[0,3].includes(transaction.type) && !transaction.btcTxHash' class='icon cancel' @click='removeTx(transaction)'>
							<!-- [<span class='redtext'>&times;</span>] -->
							<img src='@/assets/trash-alt-solid.svg'>
						</span>
						<span v-show='transaction.removed' class='icon refresh' @click='refresh(transaction)'>
							<img src='@/assets/sync-solid.svg'>
						</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	import * as store from './shiftStore'
	import { state } from './shiftState'
	import * as helpers from '../../utils/helpers'
	import TxState from './TxState.vue'
	import VueQrcode from '@chenfengyuan/vue-qrcode'

	export default {
		components: {
			TxState,
			VueQrcode,
		},

		data: () => ({
			showModal: false,
			qrValue: null,
			qrOptions: {
				width: 200,
				margin: 0,
				color: {
					light: '#0000'
				}
        	},
        	copied: false,
        	showRemoved: false,
		}),

		computed: {
			transactions() {
				return state.transactions
			},
			filteredTransactions() {
				if(this.showRemoved) return state.transactions
				return state.transactions.filter(t => !t.removed)
			},
			showCompleted() {
        		let tx = state.transactions[0]
        		if(!tx) return;
        		return tx.type == 0 && [14,15].includes(tx.state) || tx.type == 1 && tx.state == 65
        	},
        	space() {
        		return state.space
        	},
		},


		methods: {
			showQR({ fromInput, gatewayAddress }) {
				this.showModal = true
				this.qrValue = `bitcoin:${gatewayAddress}?amount=${fromInput}`
			},

			copy(transaction) {
				this.copied = true;
				setTimeout(() => this.copied = false, 600)
				helpers.copyToClipboard(transaction.gatewayAddress)
			},

			shortenAddress(address) {
				return address.slice(0,6) + '...' + address.slice(-6)
			},

			getTxHashLink(transaction) {
				let hash = [0,3].includes(transaction.type) ? 
					'https://blockchain.info/btc/tx/' + transaction.btcTxHash 
					: 'https://etherscan.io/tx/' + transaction.ethTxHash;
				return hash;
			},

			txProgress(transaction) {
        		if([0,3].includes(transaction.type)) {
        			let progress = transaction.state / 14 * 100 | 0
        			if(progress > 100) progress = 100
        			return [14, 15].includes(transaction.state) ? 100 : progress
        		}
        		if(transaction.type == 1) {
        			let progress = ((transaction.state - 30) / 35) * 100 | 0
        			if(progress > 100) progress = 100
        			return transaction.state == 65 ? 100 : progress
        		}
        	},

        	removeTx(transaction) {
        		store.removeTx(transaction)
			},

			mintThenSwap(transaction) {
				store.mintThenSwap(transaction)
			},

			use3Box() {
				return store.use3Box()
			},

			swapNow(transaction) {
				store.swapNow(transactions)
			},

			receiveRen(transaction) {
				store.receiveRen(transaction)
			},

			depositNow(transaction) {
				store.depositNow(transaction)
			},

			receiveRenDeposit(transaction) {
				store.receiveRenDeposit(transaction)
			},

			refresh(transaction) {
				store.refresh(transaction)
			},
			showNotifications() {
				navigator.serviceWorker.ready
					.then(function(registration) {
					  // Use the PushManager to get the user's subscription to the push service.
					  return registration.pushManager.getSubscription()
					  .then(async function(subscription) {
					    // If a subscription was found, return it.
					    if (subscription) {
					      return subscription;
					    }

					    // Get the server's public key
					    const response = await fetch('https://pushservice.curve.fi/vapidPublicKey');
					    const vapidPublicKey = await response.text();
					    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
					    // urlBase64ToUint8Array() is defined in /tools.js
					    const convertedVapidKey = helpers.urlBase64ToUint8Array(vapidPublicKey);

					    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
					    // send notifications that don't have a visible effect for the user).
					    return registration.pushManager.subscribe({
					      userVisibleOnly: true,
					      applicationServerKey: convertedVapidKey
					    });
					  });
					}).then(function(subscription) {
					  subscriptionStore.setSubscription(subscription)
					  console.log(subscriptionStore.subscription)
					  // Send the subscription details to the server using the Fetch API.
					  fetch('https://pushservice.curve.fi/register', {
					    method: 'post',
					    headers: {
					      'Content-type': 'application/json'
					    },
					    body: JSON.stringify({
					      subscription: subscription
					    }),
					  });
					});
			},

		}
	}
</script>

<style scoped>
	.tui-table {
		width: 100%;
		margin-top: 1em;
	}
	.shifttype {
		white-space: nowrap;
	}
	tbody tr td {
		padding-bottom: 0.6em;
	}
	.icon.small {
		height: 1em;
	}
	.hoverpointer {
		cursor: pointer;
	}
	.modal-content {
		text-align: center;
		padding: 0;
		border: none;
		width: 260px;
	}
	.modal-content fieldset {
		color: white;
		font-weight: bolder;
		border: 6px double white;
		padding-block-start: 1em;
		padding-block-end: 1em;
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
	.tooltiptext.small {
		width: 70px;
		margin-left: -35px;
	}
	.legend2 .greentext {
		display: inline-block;
		transform: translate3d(0,-0.1em,10em);
	}
	.legend2 .greentext:hover {
		transform: none;
	}
	.icon.cancel {
		cursor: pointer;
		font-size: 1em;
	}
	.icon.cancel img {
		width: 1em;
		margin-left: 0.8em;
		filter: invert(13%) sepia(90%) saturate(4444%) hue-rotate(11deg) brightness(88%) contrast(97%);
	}
	.redtext {
		color: red;
	}
	.nowrap {
		white-space: nowrap;
	}
	.transaction-table {
		margin-top: 1em;
	}
	.icon.refresh {
		cursor: pointer;
		font-size: 1em;
	}
	.icon.refresh img {
		width: 1em;
		margin-left: 0.8em;
		filter: invert(37%) sepia(11%) saturate(2344%) hue-rotate(174deg) brightness(101%) contrast(104%);
	}
	.notification.tooltip {
		margin-left: 1em;
		margin-top: 1em;
	}
</style>