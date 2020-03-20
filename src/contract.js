import Vue from "vue";
import * as cBN from 'bignumber.js'
import * as abis from './abis'
import allabis from './allabis'
import web3Init from './init'

var N_COINS = 2;
var coin_precisions = [1e18, 1e6];
var old_swap_address = '0x2e60CF74d81ac34eB21eEff58Db4D385920ef419';
var swap_address = '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56';
var token_address = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
var old_token_address = '0x3740fb63ab7a09891d7c0d4299442A551D06F5fD';

var migration_address = '0x54Ee22d5593FC76fB20EafAb66C45aAb3268B800';
var infura_url = 'https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b';

const currencies = {
	compound: {
		dai: 'cDAI',
		usdc: 'cUSDC'
	},
	usdt: {
		dai: 'cDAI',
		usdc: 'cUSDC',
		usdt: 'USDT'
	},
	iearn: {
		dai: 'yDAI',
		usdc: 'yUSDC',
		usdt: 'yUSDT',
		tusd: 'yTUSD'
	},
	busd: {
		dai: 'yDAI',
		usdc: 'yUSDC',
		usdt: 'yUSDT',
		busd: 'ybUSD'
	},
}

export const allCurrencies = currencies

export const poolMenu = {
	compound: 'Compound',
	usdt: 'USDT',
	iearn: 'Y',
	busd: 'bUSD'
}

export const gas = {
	swap: {
		compound: 1200000,
		usdt: 1200000,
		iearn: 1600000,
		busd: 1600000,
	}
}

const state = Vue.observable({
	currentContract: 'compound',
	currencies: currencies.compound,
	N_COINS: N_COINS,
	coin_precisions: coin_precisions,
	swap_address: swap_address,
	old_swap_address: old_swap_address,
	token_address: token_address,
	old_token_address: old_token_address,
	migration_address: migration_address,
	infura_url: infura_url,

	coins: new Array(N_COINS),
	underlying_coins: new Array(N_COINS),
	swap: null,
	old_swap: null,
	swap_token: null,
	old_swap_token: null,
	ERC20Contract: null,
	balances: new Array(N_COINS),
	wallet_balances: new Array(N_COINS),
	c_rates: new Array(N_COINS),
	fee: 0,
	admin_fee: 0,
	trade_timeout: 1800,
	max_allowance: cBN(2).pow(cBN(256)).minus(cBN(1)),
	coins: [],
	underlying_coins: [],
	c_rates: [],
	bal_info: [],
	total: 0,
	l_info: [],
	totalShare: 0,

	slippage: 0,
	showSlippage: false,
	showNoBalance: false,
	showNoBalanceCoin: '',

	initializedContracts: false,

	default_account: '',

	error: false,

})

export let contract = state

export const getters = {
	currentPool: () => state.currentContract,
	bal_info: () => state.bal_info,
	balTotal: () => state.total,
	l_info: () => state.l_info,
	totalShare: () => state.totalShare,
	totalShare: () => state.totalShare,
	currencies: () => state.currencies,
	fee: () => state.fee * 100,
	admin_fee: () => state.admin_fee * 100,
	initializedContracts: () => state.initializedContracts,
	showSlippage: () => state.showSlippage,
	slippage: () => state.slippage,
	N_COINS: () => state.N_COINS,
	error: () => state.error
}


export async function init() {
	try {
        let networkId = await web3.eth.net.getId();
        if(networkId != 1) {
            this.error = 'Error: wrong network type. Please switch to mainnet';
        }
    }
    catch(err) {
        console.error(err);
        this.error = 'There was an error connecting. Please refresh page';
    }
    if(state.currentContract == 'compound') {
	    state.old_swap = new web3.eth.Contract(allabis[state.currentContract].old_swap_abi, old_swap_address);
	    state.old_swap_token = new web3.eth.Contract(allabis[state.currentContract].ERC20_abi, old_token_address);
    }

    state.swap = new web3.eth.Contract(allabis[state.currentContract].swap_abi, state.swap_address);
    state.swap_token = new web3.eth.Contract(allabis[state.currentContract].ERC20_abi, state.token_address);

    state.coins = []
    state.underlying_coins = []
    for (let i = 0; i < state.N_COINS; i++) {
        var addr = await state.swap.methods.coins(i).call();
        let coin_abi = allabis[state.currentContract].cERC20_abi
        if(['iearn', 'busd'].includes(state.currentContract)) coin_abi = allabis[state.currentContract].yERC20_abi
        state.coins.push(new web3.eth.Contract(coin_abi, addr));
        var underlying_addr = await state.swap.methods.underlying_coins(i).call();
        state.underlying_coins.push(new web3.eth.Contract(allabis[state.currentContract].ERC20_abi, underlying_addr));
    }
}

export async function changeContract(pool) {
	//re-init contract with different pool
	if(!(pool in allabis)) return;
	state.initializedContracts = false;
	state.currentContract = pool;
	state.currencies = currencies[pool]
	state.N_COINS = allabis[pool].N_COINS;
	state.coin_precisions = allabis[pool].coin_precisions;
	state.swap_address = allabis[pool].swap_address;
	state.old_swap_address = allabis[pool].old_swap_address;
	state.token_address = allabis[pool].token_address;
	state.old_token_address = allabis[pool].old_token_address;
	state.migration_address = allabis[pool].migration_address;
	state.coins = new Array(allabis[pool].coins);
	state.underlying_coins = new Array(allabis[pool].underlying_coins);
	state.balances = new Array(allabis[pool].balances);
	state.wallet_balances = new Array(allabis[pool].wallet_balances);
	state.bal_info = []
	state.l_info = []
	state.total = 0
	state.totalShare = 0
	web3Init();
}

export function setCurrencies(pool) {
	contract.currencies = currencies[pool]
}