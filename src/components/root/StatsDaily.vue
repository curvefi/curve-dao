<template>
	<div>
		<div class='window white' v-for='(currency, i) in Object.keys(pools)'>
			<p class='text-center'>
		      	<router-link :to="currency" v-show="currency != 'susd'">{{currency == 'iearn' ? 'y' : currency}}.curve.fi</router-link>
		      	<a href='https://iearn.finance/pool' v-show="currency == 'susd'">susd</a>
	      	</p>
			<daily-chart :data = 'poolData[i]' />
		</div>
	</div>
</template>

<script>
	import DailyChart from '../common/DailyAPYChart.vue'
	import TotalBalances from './TotalBalances.vue'
    import { allCurrencies } from '../../contract'

	export default {
		components: {
			DailyChart,
		},
		data: () => ({
			pools: {
				compound: 'compound',
				usdt: 'usdt',
				iearn: 'y',
				busd: 'busd',
				susd: 'synthetix',
			},
			poolData: [],
		}),
		async created() {
			let requests = Object.values(this.pools).map(p => fetch(`https://${p}.curve.fi/stats.json`))
			let data = await Promise.all(requests)
			for(let res of data) {
				let json = await res.json();
				this.poolData.push(json.data);
			}
		},
	}
</script>