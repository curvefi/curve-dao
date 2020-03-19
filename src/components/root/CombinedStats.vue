<template>
	<div>
		<div class="window white" v-for='(currency, i) in Object.keys(currencies)'>
		      <p class='text-center'><a href='https://compound.curve.fi'>{{currency}}.curve.fi</a></p>

		      <stats :pool= 'currency'/>
		      <balances-info :pool = 'currency'/>
	  	</div>
	</div>
</template>

<script>
	import Stats from '../Stats.vue'
	import BalancesInfo from '../BalancesInfo.vue'
    import { getters, contract as currentContract, allCurrencies } from '../../contract'

	export default {
		components: {
			Stats,
			BalancesInfo
		},
		computed: {
			currencies() {
				return allCurrencies
			}
		}
	}
</script>