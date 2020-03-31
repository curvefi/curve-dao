<template>
    <div class="window white">
        <fieldset>
			<legend>Total pool deposits and daily volume</legend>
				<div :class="{'loading line': !total}" id='total-balances'>
					Deposits: <span v-show='total'>{{total | formatNumber}}$</span>
				</div>
				<div :class="{'loading line': !volume}" >
					Daily volume: <span v-show='volume'>{{(volume | 0) | formatNumber}}$</span>
				</div>
        </fieldset>
    </div>
</template>

<script>
	import Web3 from 'web3'
	import * as abis from '../../allabis'
	import helpers from '../../utils/helpers'
	import BigNumber from 'bignumber.js'
    var cBN = (val) => new BigNumber(val);

	export default {
		props: ['volume'],
		data: () => ({
			total: '',
		}),
		async created() {
			this.totalBalances()
		},
		methods: {
			async totalBalances() {
			    let total = cBN(0);
			    let tokenContracts = {}
			    let swapContracts = {}
			    let promises = []
			    let infuraProvider = new Web3(abis.infura_url)
			    let pools = Object.assign({},abis.default)
			    delete pools.susd
			    for(let [key, contract] of Object.entries(pools)) {
			        tokenContracts[key] = new infuraProvider.eth.Contract(contract.ERC20_abi, contract.token_address);
			        swapContracts[key] = new infuraProvider.eth.Contract(contract.swap_abi, contract.swap_address);
			        let totalSupply = cBN(await tokenContracts[key].methods.totalSupply().call())
			        let price = cBN(await swapContracts[key].methods.get_virtual_price().call())
			        total = total.plus(totalSupply.multipliedBy(price).div(1e36))
			    }
			    this.total = total.toFixed(0);
			},
		}

	}
</script>

<style scoped>
	fieldset div {
		display: block;
	}
	fieldset div:nth-of-type(2) {
		margin-top: 1em;
	}
</style>