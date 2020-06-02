<template>
	<div>
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
				<tr v-for='transaction in transactions'>
					<td class='shifttype'>
						{{ transaction.type == 0 ? 'BTC->wBTC' : 'wBTC->BTC' }}
					</td>
					<td>
						<span :class="{'loading line': !transaction.gatewayAddress }"></span>
						<span v-show='transaction.gatewayAddress'>
							<span class='hoverpointer'>{{transaction.gatewayAddress}}</span>
							<span class='hoverpointer' v-show='transaction.type == 0' @click='copy(transaction)'>
								<span class='tooltip'>
									<img class='icon small' src='@/assets/copy-solid.svg'>
									<span class='tooltiptext small'>{{ copied == false ? 'Copy' : 'Copied' }}</span>
								</span>
							</span>
							<img class='icon small hoverpointer' v-show='transaction.type == 0'
								@click='showQR(transaction)' src='@/assets/qrcode-solid.svg'>
						</span>
					</td>
					<td>
						<a :href="getTxHashLink(transaction)"> 
							<span v-show='transaction.type == 0 && transaction.state < 10'>{{ transaction.confirmations }} / {{ confirmations }}</span>
							<span v-show='transaction.type == 0 && transaction.state >= 10 && transaction.state < 14'>Confirmed</span>
							<span v-show='transaction.type == 0 && [14,15].includes(transaction.state)'>
								Done
							</span>
							<span v-show='transaction.type == 1 && transaction.state >= 30 && transaction.state < 60'> {{ transaction.confirmations }} / 30 </span>
							<span v-show='transaction.type == 1 && transaction.state > 60'> {{ transaction.confirmations }}  </span>
						</a>
						<div v-show='transaction.type == 0 && transaction.state == 14'>
							<a :href="'https://etherscan.io/tx/' + transaction.ethTxHash">Etherscan</a>
						</div>
					</td>
					<td>
						<tx-state 
							:state='transaction.state' 
							:transaction='transaction'
							@mint='mintThenSwap'/>
					</td>
					<td class='nowrap'>
						<span v-show='transaction.type == 0'>
							{{ txProgress(transaction) }}%
							<span :class="{'loading line': txProgress(transaction) < 100}"></span>
						</span>
						<span v-show='transaction.type == 1'>
							{{ txProgress(transaction) }}%
							<span :class="{'loading line': txProgress(transaction) < 100}"></span>
						</span>
						<span v-show='transaction.type == 0 && !transaction.btcTxHash' class='icon cancel' @click='removeTx(transaction)'>
							<!-- [<span class='redtext'>&times;</span>] -->
							<img src='@/assets/trash-alt-solid.svg'>
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
		}),

		computed: {
			transactions() {
				return state.transactions
			}
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

			getTxHashLink(transaction) {
				let hash = transaction.type == 0 ? 
					'https://blockchain.info/btc/tx/' + transaction.btcTxHash 
					: 'https://etherscan.io/tx/' + transaction.ethTxHash;
				return hash;
			},

			txProgress(transaction) {
        		if(transaction.type == 0) {
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

		}
	}
</script>

<style scoped>
	
</style>