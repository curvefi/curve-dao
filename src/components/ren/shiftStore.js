import Vue from 'vue'
import RenSDK from '@renproject/ren'
import BlocknativeSdk from 'bnc-sdk'
import Web3 from 'web3'
const blocknative = new BlocknativeSdk({
	dappId: 'c68d8ec3-9b9a-4ba5-a3eb-6232eff79030',       // [String] The API key created by step one above
	networkId: 1,
})
const sdk = new RenSDK('mainnet', {
	//logLevel: 'trace'
})
let Box
import BN from 'bignumber.js'
import { getters, allCurrencies, contract } from '../../contract'
import allabis, { ERC20_abi, adapterABI, adapterAddress } from '../../allabis'
import * as common from '../../utils/common'
import * as helpers from '../../utils/helpers'
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
	minExchangeRate: 0,
	newMinExchangeRate: 0,
	slippage: 0,
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

	min_amount: 0,
	amounts: 0,
})

state.adapterContract = new contract.web3.eth.Contract(adapterABI, adapterAddress)
state.address = state.default_account =  contract.default_account
state.sdk = sdk

async function init() {
	let fees = await sdk.getFees()
	state.minersLockFee = fees.btc.lock
	state.minersReleaseFee = fees.btc.release
	state.mintFee = fees.btc.ethereum.mint
	state.burnFee = fees.btc.ethereum.burn
	loadTransactions()
}

init()

export async function loadTransactions() {
	let items = await getAllItems()
	state.transactions = Object.values(items).filter(t=>t.state).sort((a, b) => b.timestamp - a.timestamp)
	let mints = state.transactions.filter(t => t.btcTxHash && ![14,15].includes(t.state)).map(t=>sendMint(t))
	console.log(mints, "MINTS")
	let burns = state.transactions.filter(t => !t.btcTxHash && t.ethTxHash && t.state && t.state != 65)
	console.log(burns, "THE BURNS")
	web3.eth.subscribe('newBlockHeaders')
		.on('data', block => {
			console.log("NEW BLOCK")
			for(let transaction of state.transactions.filter(t => !t.btcTxHash && t.ethTxHash && t.state && t.state != 65)) {
				console.log(transaction, "TRANSACTION")
				if(transaction.state > 63 || transaction.confirmations >= 30) continue;
				transaction.confirmations = block.number - transaction.ethStartBlock + 1
				transaction.ethCurrentBlock = block.number
				transaction.state = 30 + transaction.confirmations
				//upsertTx(transaction)
			}
		})
	await Promise.all([...mints, ...burns.map(t=>listenForBurn(t.id))])
}


export async function use3Box() {
	Box = require('3box')
	if(state.box !== null) return;
	state.box = await Box.openBox(contract.default_account, contract.web3.currentProvider)
	state.space = await state.box.openSpace('curvebtc')
	loadTransactions();
	await state.space.syncDone
}

export async function setItem(key, item) {
	item.web3Provider = null
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

export async function removeTx(transaction) {
	state.transactions = state.transactions.filter(t => t.id != transaction.id)
	await removeItem('curvebtc_' + transaction.id)
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

function newTx() {
	let transaction = {...txObject()}
	transaction.id = helpers.generateID()
	transaction.timestamp = Date.now()
	return transaction
}

export async function mint(data) {
	let transaction = {...newTx()}
	transaction.type = 0
	transaction.amount = data.from_currency == 0 ? data.amountAfterBTC : data.fromInput;
	transaction.address = data.address;
	transaction.fromInput = data.fromInput;
	transaction.toInput = data.toInput;
	transaction.minExchangeRate = BN(data.toInput).times(1e8).div(data.amountAfterBTC).toFixed(0,1)
	transaction.newMinExchangeRate = BN(transaction.minExchangeRate).times(BN((1000-data.slippage)/1000)).toFixed(0,1)
	//slippage is in BPS
	transaction.slippage = data.slippage
	upsertTx(transaction)
	state.transactions.unshift(transaction)

	await sendMint(transaction)
}

function initSwapMint(transaction) {
	console.log(transaction, "THE TRANSACTION")
	var { id, amount, nonce, address, toInput, params, minExchangeRate, slippage } = transaction
	// let _minWbtcAmount = BN(toInput).times(1e8).times(0.99).toFixed(0, 1)
	console.log(amount, "AMOUNT", nonce, "NONCE", address, "ADDRESS", minExchangeRate, "MIN EXCHANGE RATE", slippage, "SLIPPAGE")
	
	let transfer = {
	    // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
	    sendToken: RenJS.Tokens.BTC.Btc2Eth,

	    // The contract we want to interact with
	    sendTo: adapterAddress,

	    suggestedAmount: RenJS.utils.value(amount, "btc").sats().toNumber(),

	    // The name of the function we want to call
	    contractFn: "mintThenSwap",
	    
	    nonce: params && params.nonce || RenJS.utils.randomNonce(),

	    // Arguments expected for calling `deposit`
	    contractParams: [
	        {
                name: "_minExchangeRate",
                type: "uint256",
                value: minExchangeRate,
            },
            {
            	name: "slippage",
            	type: 'uint256',
            	value: slippage,
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

	return transfer
}

export async function deposit(data) {
	let transaction = {...newTx()}
	//type 3 is deposit
	transaction.type = 3
	transaction.amount = data.btcAmount
	transaction.address = data.address
	transaction.amounts = data.amounts.map(amount => BN(amount).toFixed(0,1))
	transaction.min_amount = data.min_amount
	transaction.new_min_amount = data.min_amount
	upsertTx(transaction)
	state.transactions.unshift(transaction)

	await sendMint(transaction)
}

function initDepositMint(transaction) {
	var { id, amount, amounts, min_amount, nonce, address, params } = transaction

	let transfer = {
	    // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
	    sendToken: RenJS.Tokens.BTC.Btc2Eth,

	    // The contract we want to interact with
	    sendTo: adapterAddress,

	    suggestedAmount: RenJS.utils.value(amount, "btc").sats().toNumber(),

	    // The name of the function we want to call
	    contractFn: "mintThenDeposit",
	    
	    nonce: params && params.nonce || RenJS.utils.randomNonce(),

	    // Arguments expected for calling `deposit`
	    contractParams: [
            {
                name: "_wbtcDestination",
                type: "address",
                value: contract.default_account,
            },
	        {
                name: "amounts",
                type: "uint256[2]",
                value: amounts,
            },
            {
                name: "min_mint_amount",
                type: "uint256",
                value: min_amount,
            },
	    ],
	    
	    // Web3 provider for submitting mint to Ethereum
	    web3Provider: web3.currentProvider,
	}

	return transfer
}

export async function initMint(transaction) {
	let transfer;
	if(transaction.type == 0) transfer = initSwapMint(transaction)
	if(transaction.type == 3) transfer = initDepositMint(transaction)
	upsertTx(transfer)
	const mint = sdk.lockAndMint(transfer);
	return mint;
}

export async function sendMint(transfer) {

	let transaction = state.transactions.find(t => t.id == transfer.id)
	console.log(transaction, "TRANSACTION")
	//transaction is ready to be sent to eth network
	if(transaction.renResponse && transaction.signature) {
		if(transaction.state == 12 || transaction.state == 14)
			transaction.state = 15
		transaction.confirmations = 'Confirmed'
		upsertTx(transaction)
		if(transaction.type == 0) await mintThenSwap(transfer)
		if(transaction.type == 3) await mintThenDeposit(transaction)
	}
	else {
		let mint = await initMint(transfer);


		//transaction initated, but didn't get an address, so updating
		if(!transaction.gatewayAddress) {
			transaction.params = mint.params;
			try {
				transaction.gatewayAddress = await mint.gatewayAddress()
			}
			catch(err) {
				console.error(err)
			}
			console.log("GATEWAY ADDRESS")
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
									if(transaction.confirmations) transaction.state = 3 + deposit.utxo.confirmations
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
		if(transaction.type == 0) mintThenSwap(transaction)
		if(transaction.type == 3) mintThenDeposit(transaction)
	}
}

export async function swapNow(transaction) {
	mintThenSwap(transaction, true)
}

export async function receiveRen(transaction) {
	mintThenSwap(transaction, false, true)
}

export async function mintThenSwap({ id, amount, params, utxoAmount, renResponse, signature }, swapNow = false, receiveRen = false) {
	let transaction = state.transactions.find(t => t.id == id);
	let get_dy = BN(await contract.swap.methods.get_dy(0, 1, BN(utxoAmount).toFixed(0, 1)).call())
	let exchangeRateNow = get_dy.times(1e8).div(utxoAmount)
	//rates changed, ask user if they still want to swap
		//handle the case where they only want to mint
	if(exchangeRateNow.lt(BN(transaction.newMinExchangeRate)) && !swapNow && !receiveRen) {
		transaction.state = 13
		return;
	}
	if(swapNow) {
		transaction.newMinExchangeRate = BN(exchangeRateNow).times(BN((1000-data.slippage)/1000)).toFixed(0,1)
	}
	if(receiveRen) {
		//make the rate impossibly high so the check for exchange always fails
		transaction.newMinExchangeRate = BN(10000).toFixed(0,1)
	}
	//set new min exchange rate when user clicks on "exchange rates expired, want to swap again? and not popup automatically on that case"
	await new Promise((resolve, reject) => {
		return state.adapterContract.methods.mintThenSwap(
			params.contractCalls[0].contractParams[0].value,
			transaction.newMinExchangeRate,
			params.contractCalls[0].contractParams[1].value,
			params.contractCalls[0].contractParams[2].value,
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

	upsertTx(transaction)
}

export async function depositNow(transaction) {
	mintThenDeposit(transaction, true)
}

export async function receiveRenDeposit(transaction) {
	mintThenDeposit(transaction, false, true)
}

function calcFee() {
	let N_COINS = 2
	return getters.fee() * N_COINS / (4 * (N_COINS -1))
}

export async function mintThenDeposit({ id, amounts, min_amount, params, utxoAmount, renResponse, signature }, depositNow = false, receiveRen = false) {
	//handle change calc_token_amount like in mintThenSwap
	let transaction = state.transactions.find(t => t.id == id);
	let calc_token_amount = await contract.swap.methods.calc_token_amount(transaction.amounts, true)
	if(calc_token_amount  < transaction.new_min_amount && !depositNow && !receiveRen) {
		transaction.state = 15
		return;
	}
	if(depositNow) {
		calc_token_amount = BN(calc_token_amount).times(BN(1).minus(BN(this.calcFee)))
		calc_token_amount = calc_token_amount.times(0.99).toFixed(0,1)
		transaction.new_min_amount = calc_token_amount
	}
	if(receiveRen) {
		//make the new_min_mint_amount parameter in contract 0 so it always fails and mints renBTC
		transaction.new_min_amount = 0
	}
	await new Promise((resolve, reject) => {
		return state.adapterContract.methods.mintThenDeposit(
			params.contractCalls[0].contractParams[0].value,
			utxoAmount,
			params.contractCalls[0].contractParams[1].value,
			params.contractCalls[0].contractParams[2].value,
			transaction.new_min_amount,
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

	upsertTx(transaction)
}

export async function burnSwap(data) {
	await common.approveAmount(contract.coins[1], 
		BN(data.fromInput).times(1e8), 
		state.default_account, adapterAddress)

	let tx = state.adapterContract.methods.swapThenBurn(
			RenJS.utils.BTC.addressToHex(data.address),
			BN(data.fromInput).times(1e8).toFixed(0, 1),
			BN(data.toInputOriginal).times(0.97).toFixed(0, 1),
		).send({
			from: state.default_account,
			gas: 600000,
		})
	burn(tx, data.address)
}

export async function removeLiquidityThenBurn(data) {
	await common.ensure_allowance_zap_out(data.amount, undefined, adapterAddress)
	let tx = state.adapterContract.methods.removeLiquidityThenBurn(
		RenJS.utils.BTC.addressToHex(data.address),
		BN(data.amount).toFixed(0, 1),
		data.min_amounts,
	).send({
		from: state.default_account,
		gas: 600000,
	})

	burn(tx, data.address)
}


export async function removeLiquidityImbalanceThenBurn(data) {
	await common.ensure_allowance_zap_out(data.max_burn_amount, undefined, adapterAddress)

	let tx = state.adapterContract.methods.removeLiquidityImbalanceThenBurn(
		RenJS.utils.BTC.addressToHex(data.address),
		data.amounts.map(amount => BN(amount).toFixed(0,1)),
		BN(data.max_burn_amount).toFixed(0, 1),
	).send({
		from: state.default_account,
		gas: 600000,
	})

	burn(tx, data.address)
}

export async function removeLiquidityOneCoinThenBurn(data) {
	await common.ensure_allowance_zap_out(data.token_amounts, undefined, adapterAddress)

	let tx = state.adapterContract.methods.removeLiquidityOneCoinThenBurn(
		RenJS.utils.BTC.addressToHex(data.address),
		BN(data.token_amounts).toFixed(0,1),
		BN(data.min_amount).toFixed(0, 1),
	).send({
		from: state.default_account,
		gas: 600000,
	})

	burn(tx, data.address)
}


export async function burn(burn, address) {
	let id = helpers.generateID();
	let txhash = await new Promise(async (resolve, reject) => {
		await burn
		.once('transactionHash', resolve)
		.once('receipt', receipt => {
			let transaction = state.transactions.find(t => t.id == id)
			listenForBurn(transaction.id)
			let startBlockNumber = receipt.blockNumber
			transaction.confirmations = 1
			transaction.state = 31;
			transaction.ethStartBlock = startBlockNumber
			upsertTx(transaction)
			// let subscription = web3.eth.subscribe('newBlockHeaders')
			// 	.on('data', block => {
			// 		if(transaction.confirmations >= 30) {
			// 			return
			// 			//subscription.unsubcribe()
			// 		}
			// 		transaction.confirmations = block.number - transaction.ethStartBlock + 1
			// 		transaction.ethCurrentBlock = block.number
			// 		transaction.state = 30 + transaction.confirmations
			// 		console.log("NEW TX RECEIPT", transaction)
			// 		upsertTx(transaction)
			// 	})
		})
		.on('error', (err, receipt) => {
			console.log(err, receipt, "ERR RECEIPT")
		})
		.catch(err => reject(err))
	})
	let { emitter } = blocknative.transaction(txhash)
	emitter.on('txSpeedUp', async transaction => {
		console.log("SPEED UP")
		console.log(transaction.originalHash, "ORIGINAL HASH", transaction.hash, "NEW HASH")
		let tx = state.transactions.find(t => t.ethTxHash == transaction.originalHash)
		await removeTx(tx)
		tx.ethTxHash = transaction.hash
		tx.ethStartBlock = transaction.blockNumber
		tx.state = 30
		tx.confirmations = 0
		setTimeout(() => upsertTx(tx), 1000)
	})
	state.transactions.unshift({
		id: id,
		timestamp: Date.now(),
		type: 1,
		gatewayAddress: address,
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
		console.log(hash, 'txHash event from ren')
		tx.renVMHash = hash
		//tx.state = 31
		upsertTx(tx)
	})
	.on('status', status => {
		console.log(status, "NEW STATUS")
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
	console.log("BURN SUBMITTED")
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