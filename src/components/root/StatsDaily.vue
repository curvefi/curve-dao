<template>
	<div>
		<div class='window white' v-for='(currency, i) in Object.keys(pools)'>
			<p class='text-center'>
		      	<router-link :to="currency" v-show="currency != 'susd'">{{currency == 'iearn' ? 'y' : currency}}.curve.fi</router-link>
		      	<a href='https://iearn.finance/pool' v-show="currency == 'susd'">susd</a>
	      	</p>
			<daily-chart :data = 'poolData[i]' :pool='currency' :volume = 'volumesData[currency]' />
		</div>
	</div>
</template>

<script>
	import DailyChart from '../common/DailyAPYChart.vue'
	import TotalBalances from './TotalBalances.vue'
    import { allCurrencies } from '../../contract'
	import * as volumeStore from '@/components/common/volumeStore'

	import abis from '../../allabis'

	import * as helpers from '../../utils/helpers'

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
			start: 0,
			end: 0,
		}),
		computed: {
			volumesData() {
				return volumeStore.state.volumes;
			}
		},
		async created() {
			var start = new Date();
			start.setHours(0,0,0,0);
			this.start = start.getTime() / 1000

			var end = new Date();
			end.setHours(23,59,59,999);
			this.end = end.getTime() / 1000

			let requests = Object.values(this.pools).map(p => fetch(`https://${p}.curve.fi/stats.json`))
			let data = await Promise.all(requests)
			for(let res of data) {
				let json = await res.json();
				this.poolData.push(json.data);
			}
			var pools = ['compound', 'usdt', 'y', 'busd']
            volumeStore.getVolumes(pools);
		},
	}
</script>