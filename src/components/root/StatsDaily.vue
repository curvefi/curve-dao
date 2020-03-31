<template>
	<div>
		<div class='window white' v-for='(currency, i) in Object.keys(pools)'>
			<p class='text-center'>
		      	<router-link :to="currency" v-show="currency != 'susd'">{{currency == 'iearn' ? 'y' : currency}}.curve.fi</router-link>
		      	<a href='https://iearn.finance/pool' v-show="currency == 'susd'">susd</a>
	      	</p>
			<daily-chart :data = 'poolData[i]' :volume = 'volumesData[i]' />
		</div>
	</div>
</template>

<script>
	import DailyChart from '../common/DailyAPYChart.vue'
	import TotalBalances from './TotalBalances.vue'
    import { allCurrencies } from '../../contract'

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
			volumesData: [0,0,0,0],
			start: 0,
			end: 0,
		}),
		async created() {
			var start = new Date(2020, 2, 30);
			start.setHours(0,0,0,0);
			this.start = start.getTime() / 1000

			var end = new Date(2020, 2, 30);
			end.setHours(23,59,59,999);
			this.end = end.getTime() / 1000
			
			let requests = Object.values(this.pools).map(p => fetch(`https://${p}.curve.fi/stats.json`))
			let data = await Promise.all(requests)
			for(let res of data) {
				let json = await res.json();
				this.poolData.push(json.data);
			}

			var pools = ['compound', 'usdt', 'y', 'busd']
            let volumes = pools.map(p=>fetch(`https://beta.curve.fi/raw-stats/${p}-5m.json`))
            volumes = await Promise.all(volumes)
            for(let i = 0; i < volumes.length; i++) {
            	console.log("HERE")
            	let json = await volumes[i].json();
            	for(let data of json.slice(helpers.findClosestIndex(this.start, json), helpers.findClosestIndex(this.end, json))) {
            		this.$set(this.volumesData, i,  this.volumesData[i]+= Object.entries(data.volume).map(([k, v]) => {
            			let pool = pools[i] == 'y' ? 'iearn' : pools[i]
            			let precisions = abis[pool].coin_precisions[k.split('-')[0]]
            			console.log(precisions)
            			return v[0] / precisions
            		}).reduce((a, b) => a + b, 0));
            	}
            }
		},
	}
</script>