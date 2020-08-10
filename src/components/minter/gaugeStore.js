import Vue from 'vue'
import { contract, getters } from '../../contract'
import allabis, { ERC20_abi } from '../../allabis'
import daoabis from '../dao/allabis'

import helpers from '../../utils/helpers'

export let state = Vue.observable({
	gaugeController: null,
	n_gauges: 0,
	pools: [],
	mypools: [],

	votingEscrow: null,
	minter: null,

	totalClaimableCRV: null,
})

export async function getState() {
	state.pools = {
		curvepool1: {
			swap: '0xbbe6874b45eFd4E44396F6aE619663067424b218',
			swap_token: '0x1796E153ce80fCf2015E19035DcecFb005bc017D',
			name: 'curvepool1'
		},
		// curvepool2: {
		// 	swap: '0x755eAb732bF116b38e73b88DACf58c5E7001c2Cb',
		// 	swap_token: '0x5c9aE8d5D6e55ECDbc627dA9959A2a285860d3BF',
		// 	name: 'curvepool2'
		// },
		// curvepool3: {
		// 	swap: '0x787A2950251E6513AA73EdF8646A656cF2d04168',
		// 	swap_token: '0x06Ec5D01d7A0245A7ABdC01aB1d21b801a43a554',
		// 	name: 'curvepool3'
		// },
	}

	state.gaugeController = new contract.web3.eth.Contract(daoabis.gaugecontroller_abi, '0xb1226B7bF0eB746cCC22960F3292410C3b04ef4e')
	state.n_gauges = +(await state.gaugeController.methods.n_gauges().call())
	console.log(state.n_gauges, "N GAUGES")

	let swap_token = new contract.web3.eth.Contract(ERC20_abi, state.pools.curvepool1.swap_token)

	let calls = Array.from(Array(state.n_gauges), (_, i) => [state.gaugeController._address, state.gaugeController.methods.gauges(i).encodeABI()])
	console.log(Object.values(state.pools).map(v => v.swap_token))
	calls = calls.concat(Object.values(state.pools).map(v => v.swap_token).map(v => [v, swap_token.methods.balanceOf(contract.default_account).encodeABI()]))

	let aggcalls = await contract.multicall.methods.aggregate(calls).call()
	let decodedGauges = aggcalls[1].slice(0, state.n_gauges).map(hex => web3.eth.abi.decodeParameter('address', hex))
	let decodedBalances = aggcalls[1].slice(state.n_gauges).map((hex, i) => ({swap_token: calls[state.n_gauges + i][0], balance: web3.eth.abi.decodeParameter('uint256', hex)}))

	let example_gauge = new contract.web3.eth.Contract(daoabis.liquiditygauge_abi, decodedGauges[0])

	let calls1 = decodedGauges.flatMap(gauge => [
		[gauge, example_gauge.methods.lp_token().encodeABI()],
		[state.gaugeController._address, state.gaugeController.methods.gauge_types(gauge).encodeABI()],
		[gauge, example_gauge.methods.balanceOf(contract.default_account).encodeABI()],
	])
	let aggcalls1 = await contract.multicall.methods.aggregate(calls1).call()

	console.log(aggcalls1[1])

	let gaugeTypes = aggcalls1[1].filter((_, i) => i % 3 == 1).map(hex => +web3.eth.abi.decodeParameter('uint256', hex))
	gaugeTypes = [...new Set(gaugeTypes)]
	
	calls = gaugeTypes.map(type => [state.gaugeController._address, state.gaugeController.methods.gauge_type_names(type).encodeABI()])
	aggcalls = await contract.multicall.methods.aggregate(calls).call()
	let gaugeTypesNames = aggcalls[1].map((hex, i) => ({type: gaugeTypes[i], name: web3.eth.abi.decodeParameter('string', hex)}))
	console.log(...gaugeTypesNames, "HERE")

	let decodedGaugeLP = aggcalls1[1].filter((_, i) => i % 3 == 0).map((hex, i) => ({
		gauge: decodedGauges[i], 
		swap_token: web3.eth.abi.decodeParameter('address', hex), 
		type: web3.eth.abi.decodeParameter('uint256', aggcalls1[1][i*3+1]),
		typeName: Object.values(gaugeTypesNames).find(v => v.type == +web3.eth.abi.decodeParameter('uint256', aggcalls1[1][i*3+1])).name
	}))
	console.log(decodedGaugeLP, "decoded GAUGE LP")
	Object.values(decodedGaugeLP).forEach((gauge, i) => {
		let poolgauge = Object.values(state.pools).find(pool => pool.swap_token.toLowerCase() == gauge.swap_token.toLowerCase())
		poolgauge.gauge = gauge.gauge
		poolgauge.type = gauge.type
		poolgauge.typeName = gauge.typeName
	})

	console.log(decodedBalances)

	let gaugeBalances = aggcalls1[1].filter((_, i) => i % 3 == 2).map((hex, i) => ({
		gauge: calls1[i*3+2][0],
		balance: web3.eth.abi.decodeParameter('uint256', hex),
	}))

	console.log(gaugeBalances, "GAUGE BALANCES")


	state.mypools = decodedBalances.map(v => {
		console.log(v.swap_token, "THE SWAP TOKEN")
		let poolInfo = Object.values(state.pools).find(pool => pool.swap_token.toLowerCase() == v.swap_token.toLowerCase())
		console.log(poolInfo, "THE POOL INFO")
		return {
			...poolInfo, 
			balance: v.balance,
			gaugeBalance: gaugeBalances.find(pool => pool.gauge.toLowerCase() == poolInfo.gauge.toLowerCase()).balance
		}
	})
	
	console.log(state.mypools)

	state.votingEscrow = new contract.web3.eth.Contract(daoabis.votingescrow_abi, '0x7477FFEc941d1b8251Ef2d0216AfE7daf2Cf74Ab')
	state.minter = new contract.web3.eth.Contract(daoabis.minter_abi, '0xbE45e0E4a72aEbF9D08F93E64701964d2CC4cF96')
}