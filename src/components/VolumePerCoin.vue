<template>
	<div>
		<div v-for='(currency, n) in currencies'>
			<volume-per-coin-stats :data = 'volumes[n]' :currency = 'currency'></volume-per-coin-stats>
		</div>
	</div>
</template>

<script>
	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)

	import {Chart} from 'highcharts-vue'

	import * as volumeStore from './common/volumeStore'
	import allabis from '../allabis'

	import VolumePerCoinStats from './VolumePerCoinStats.vue'

	import * as Comlink from 'comlink'

	import Worker from 'worker-loader!./graphs/worker.js';
	const worker = new Worker();
	const volumeWorker = Comlink.wrap(worker);

	export default {
		components: {
			highcharts: Chart,
			VolumePerCoinStats,
		},
		data: () => ({
			currencies: ['DAI', 'USDC', 'USDT', 'TUSD', 'BUSD', 'sUSD'],
			volumes: [],
		}),
		async created() {
			let pools = Object.keys(allabis).filter(pool => pool != 'susd' && pool != 'y')
			await volumeStore.fetchVolumeData(pools, false, 30)
			let data = volumeStore.state.volumeData[30]
			data.susd = (new Array(1000-data.susd.length).fill({})).concat(data.susd)
			pools = Object.entries(data)

			this.volumes = await volumeWorker.getVolumePerCoin(data, pools, allabis)
		},
	}
</script>