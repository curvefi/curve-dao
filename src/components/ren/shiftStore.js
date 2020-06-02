import Vue from 'vue'
import RenSDK from '@renproject/ren'
const sdk = new RenSDK('mainnet')
import Box from '3box'
import BN from 'bignumber.js'
import { getters, allCurrencies, contract } from '../../contract'
import allabis, { ERC20_abi, adapterABI, adapterAddress } from '../../allabis'
import * as subscriptionStore from '../common/subscriptionStore'
import EventBus from '../graphs/EventBus'
import { state } from './shiftState'

const txObject = () => ({
	id: '',
	timestamp: null,
	type: '',
	amount: '',
	fromInput: 0,
	toInput: 0,
	toAmount: 0,
	address: '',
	params: '',
	ethTxHash: '',
	ethStartBlock: null,
	ethCurrentBlock: null,
	ethConfirmations: null,
	renVMHash: '',
	gatewayAddress: '',
	confirmations: 0,
	// 0 - waiting for renVM gateway address, 1 - waiting for deposit on BTC address, 2 - got BTC transaction, waiting for confirmation
	// 3 - waiting for renVM to do it's magic and shift, 4 - got renBTC, now initiating swap, 5 - swap ready
	state: 0,
	btcTxHash: '',
	btcTxVOut: '',
	renResponse: '',
	signature: '',
})



EventBus.$on('mint', data => {
	mint(data)
})

EventBus.$on('burn', () => {
	console.log("BURN ME")
})

state.adapterContract = new contract.web3.eth.Contract(adapterABI, adapterAddress)
state.address = state.default_account =  contract.default_account


export async function loadTransactions() {
	let items = await getAllItems()
	state.transactions = Object.values(items).filter(t=>t.state).sort((a, b) => b.timestamp - a.timestamp)
	let mints = state.transactions.filter(t => t.btcTxHash && ![14,15].includes(t.state)).map(t=>sendMint(t))
	console.log(mints, "MINTS")
	let burns = state.transactions.filter(t => !t.btcTxHash && t.ethTxHash && t.state && t.state != 65)
	console.log(burns, "THE BURNS")
	if(burns.length) {
		web3.eth.subscribe('newBlockHeaders')
			.on('data', block => {
				console.log("NEW BLOCK")
				for(let transaction of burns) {
					console.log(transaction, "TRANSACTION")
					if(transaction.state > 63 || transaction.confirmations >= 30) continue;
					transaction.confirmations = block.number - transaction.ethStartBlock + 1
					transaction.ethCurrentBlock = block.number
					transaction.state = 30 + transaction.confirmations
					upsertTx(transaction)
				}
			})
	}
	await Promise.all([...mints, ...burns.map(t=>listenForBurn(t.id))])
}


export async function use3Box() {
	if(state.box !== null) return;
	state.box = await Box.openBox(contract.default_account, contract.web3.currentProvider)
	state.space = await state.box.openSpace('curvebtc')
	loadTransactions();
	await state.space.syncDone
}

export async function setItem(key, item) {
	if(state.space !== null) {
		return await state.space.private.set(key, JSON.stringify(item))
	}
	return localStorage.setItem(key, JSON.stringify(item))
}

export async function removeItem(key) {
	if(state.space !== null) {
		return await state.space.private.remove(key)
	}
	return localStorage.removeItem(key)	
}

export async function getItem(key) {
	if(state.space !== null) return await state.space.private.get(key)
	return localStorage.getItem(key)
}

export async function getAllItems() {
	let storage = localStorage
	if(state.space !== null) {
		storage = await state.space.private.all();
	}
	return Object.keys(storage).filter(key => key.startsWith('curvebtc_')).map(k => JSON.parse(storage[k]))
}

export function removeTx(transaction) {
	state.transactions = state.transactions.filter(t => t.id != transaction.id)
	removeItem('curvebtc_' + transaction.id)
}

export function postTxNotification(txHash) {
	let subscription = subscriptionStore.subscription
	console.log(subscription)
	fetch('https://f9dfeb7663cb.ngrok.io/addtx', 
		{
		    method: 'POST', 
		    headers: {
		      'Content-Type': 'application/json'
		      // 'Content-Type': 'application/x-www-form-urlencoded',
		    },
		    body: JSON.stringify({ subscription, txHash: txHash})
		})
}


export function upsertTx(transaction) {
	let key = 'curvebtc_' + transaction.id
	transaction.web3Provider = null;
	if(transaction.params && transaction.params.web3Provider)
		transaction.params.web3Provider = null;
	transaction.box = null;
	transaction.space = null
	if(transaction.type == 0) postTxNotification(transaction.btcTxHash)
	if(transaction.type == 1) postTxNotification(transaction.ethTxHash)
	setItem(key, transaction)
}

export async function mint(data) {
	let mint = await initMint(null, data);
	let transaction = state.transactions[0]
	await sendMint(transaction, mint)
}

export async function initMint(transaction, data) {
	let _minWbtcAmount, _wbtcDestination;
	if(transaction) {
		var { id, amount, nonce, address } = transaction
		_minWbtcAmount = transaction.contractParams[0].value
	}
	else {
		amount = data.from_currency == 0 ? data.amountAfterBTC : data.fromInput;
		address = data.address
		_minWbtcAmount = BN(data.toInput).times(1e8).times(0.99).toFixed(0, 1)
	}
	
	let transfer = {
	    // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
	    sendToken: RenJS.Tokens.BTC.Btc2Eth,

	    // The contract we want to interact with
	    sendTo: adapterAddress,

	    suggestedAmount: RenJS.utils.value(amount, "btc").sats().toNumber(),

	    // The name of the function we want to call
	    contractFn: "mintThenSwap",
	    
	    nonce: nonce || RenJS.utils.randomNonce(),

	    // Arguments expected for calling `deposit`
	    contractParams: [
	        {
                name: "_minWbtcAmount",
                type: "uint256",
                value: _minWbtcAmount,
            },
            {
                name: "_wbtcDestination",
                type: "address",
                value: address,
            },
	    ],
	    
	    // Web3 provider for submitting mint to Ethereum
	    web3Provider: web3.currentProvider,
	}
	const mint = sdk.lockAndMint(transfer);
	if(!id) {
		transfer.id = helpers.generateID();
		transfer.timestamp = Date.now()
		transfer.type = 0
		transfer.amount = data.from_currency == 0 ? data.amountAfterBTC : data.fromInput;
		transfer.address = data.address;
		transfer.fromInput = data.fromInput;
		transfer.toInput = data.toInput;
		let tx = {...txObject(), ...transfer}
		upsertTx(tx)
		state.transactions.unshift(tx)
	}

	return mint;
}

export async function sendMint(transfer, mint) {

	let transaction = state.transactions.find(t => t.id == transfer.id)
	console.log(transaction)
	//transaction is ready to be sent to eth network
	if(transaction.renResponse && transaction.signature) {
		if(transaction.state == 12 || transaction.state == 14)
			transaction.state = 15
		transaction.confirmations = 'Confirmed'
		upsertTx(transaction)
		//await this.mintThenSwap(transfer)
	}
	else {
		console.log("SEND MINT")
		mint = mint || await initMint(transfer);

		//transaction initated, but didn't get an address, so updating
		if(!transaction.params) {
			transaction.params = mint.params;
			transaction.gatewayAddress = await mint.gatewayAddress()
			transaction.state = 1
			upsertTx(transaction)
		}

		let deposit
		//transaction was submitted to btc network
		if(transaction.btcTxHash && String(transaction.btcTxVOut) !== 'undefined') {
			deposit = await mint.wait(state.confirmations, {
				txHash: transaction.btcTxHash,
				vOut: +transaction.btcTxVOut,
			})
			.on('deposit', deposit => {
				console.log('DEPOSIT SUBMITTED', deposit)
				if(deposit.utxo) {
					let confirmations = deposit.utxo.confirmations
					if(transaction.state == 2) {
						transaction.state = 3;
					}
					else
						transaction.state = 3 + confirmations

					transaction.confirmations = confirmations
					transaction.btcTxHash = deposit.utxo.txHash
					transaction.btcTxVOut = deposit.utxo.vOut
					upsertTx(transaction)
				}
			})
		}
		//trasaction not submitted to btc network
		else {
			deposit = await mint.wait(state.confirmations)
							.on('deposit', deposit => {
								console.log("DEPOSIT", deposit)
								if(deposit.utxo) {
									if(transaction.state == 1) {
										transaction.state = 2
									}
									transaction.confirmations = deposit.utxo.confirmations
									transaction.btcTxHash = deposit.utxo.txHash
									transaction.btcTxVOut = deposit.utxo.vOut
									upsertTx(transaction)
								}
							})
		}

		transaction.state = 10

		let signature = await deposit.submit()
		transaction.state = 11
		transaction.renResponse = signature.renVMResponse;
		transaction.signature = signature.signature
		transaction.utxoAmount = transaction.renResponse.autogen.amount
		upsertTx(transaction)
		mintThenSwap(transaction)
	}
}

export async function mintThenSwap({ id, amount, params, utxoAmount, renResponse, signature }) {
	let transaction = state.transactions.find(t => t.id == id);
	let min_amount = params.contractCalls[0].contractParams[0].value
	
	let get_dy = await contract.swap.methods.get_dy(0, 1, BN(amount).times(1e8).toFixed(0, 1)).call()

	await new Promise((resolve, reject) => {
		return state.adapterContract.methods.mintThenSwap(
			params.contractCalls[0].contractParams[0].value,
			params.contractCalls[0].contractParams[1].value,
			utxoAmount,
			renResponse.autogen.nhash,
			signature,
		).send({
			from: state.default_account
		})
		.once('transactionHash', resolve)
		.once('receipt', () => {
			//this.transactions = this.transactions.filter(t => t.id != id)
			transaction.state = 14
			transaction.ethTxHash = receipt.transactionHash
			upsertTx(transaction)
		})
		.on('error', err => {
			transaction.state = 16;
			upsertTx(transaction)
		})
		.catch(err => reject(err))
	})

	transaction.state = 12

	if(get_dy < min_amount) transaction.state = 13
	upsertTx(transaction)
	
}


export async function burn(data) {
	await common.approveAmount(contract.coins[1], 
		BN(data.fromInput).times(1e8), 
		state.default_account, adapterAddress)
	let id = helpers.generateID();
	let txhash = await new Promise((resolve, reject) => {
		return state.adapterContract.methods.swapThenBurn(
			RenJS.utils.BTC.addressToHex(this.address),
			BN(this.fromInput).times(1e8).toFixed(0, 1),
			BN(this.toInputOriginal).times(0.97).toFixed(0, 1),
		).send({
			from: state.default_account,
			gas: 600000,
		})
		.once('transactionHash', resolve)
		.once('receipt', receipt => {
			let transaction = state.transactions.find(t => t.id == id)
			listenForBurn(transaction.id)
			let startBlockNumber = receipt.blockNumber
			transaction.confirmations = 1
			transaction.state = 31;
			transaction.ethStartBlock = startBlockNumber
			upsertTx(transaction)
			let subscription = web3.eth.subscribe('newBlockHeaders')
				.on('data', block => {
					if(transaction.confirmations >= 30) subscription.unsubcribe()
					transaction.confirmations = block.number - transaction.ethStartBlock + 1
					transaction.ethCurrentBlock = block.number
					transaction.state = 30 + transaction.confirmations
					console.log("NEW TX RECEIPT", transaction)
					upsertTx(transaction)
				})
		})
		.on('error', (err, receipt) => {
			console.log(err, receipt, "ERR RECEIPT")
		})
		.catch(err => reject(err))
	})
	state.transactions.unshift({
		id: id,
		timestamp: Date.now(),
		type: 1,
		gatewayAddress: this.address,
		confirmations: 'Started',
		state: 30,
		ethTxHash: txhash,
	})
	let tx = state.transactions[0]
	upsertTx(tx)
	

}

export async function listenForBurn(id) {

	let tx = state.transactions.find(t => t.id == id)
	console.log(tx.ethTxHash, "TX HASH")
	let burn = await sdk.burnAndRelease({
	 	sendToken: RenJS.Tokens.BTC.Eth2Btc,

	    // The web3 provider to talk to Ethereum
	    web3Provider: web3.currentProvider,

	    // The transaction hash of our contract call
	    ethereumTxHash: tx.ethTxHash,
	}).readFromEthereum()
	let promiEvent = await burn.submit()
	.on('txHash', hash => {
		let tx = state.transactions.find(t => t.id == id)
		console.log(hash)
		tx.renVMHash = hash
		//tx.state = 31
		upsertTx(tx)
	})
	.on('status', status => {
		let tx = state.transactions.find(t => t.id == id)
		if(status == 'confirming' && tx.state >= 62) {
			tx.confirmations = "Confirming"
			tx.state = 62
			upsertTx(tx)
		}
		if(status == 'pending') {
			tx.confirmations = "Pending"
			tx.state = 63
			upsertTx(tx)
		}
		if(status == 'executing') {
			tx.confirmations = "Executing"
			tx.state = 64
			upsertTx(tx)
		}
		console.log(status)
	})
	tx.state = 65
	tx.confirmations = "Done"
	upsertTx(tx)

	// setInterval(async () => {
	// 	console.log("BURN LOG")
	// 	let res = await burn.queryTx()
	// 	console.log(res, "BURN RES")
	// 	if(res.txStatus.toLowerCase() == 'confirming') tx.state = 12
	// 	if(res.txStatus.toLowerCase() == 'done' || res.txStatus.toLowerCase() == 'confirmed') tx.state = 13
	// 	tx.confirmations = res.txStatus
	// 	this.upsertTx(tx)
	// }, 1000)
}