<template>
	<div>
		<div id='poolselect'>
			<input id='compoundpool' type='checkbox' value='compound' v-model='pools'/>
			<label for='compoundpool'>Compound</label>

			<input id='usdtpool' type='checkbox' value='usdt' v-model='pools'/>
			<label for='usdtpool'>usdt</label>

			<input id='ypool' type='checkbox' value='y' v-model='pools'/>
			<label for='ypool'>Y</label>

			<input id='busdpool' type='checkbox' value='busd' v-model='pools'/>
			<label for='busdpool'>bUSD</label>
		</div>

		<select class='tvision' v-model='pair'>
			<option v-for = 'v in pairs' :value='v'>{{v.val | toUpper}}</option>
		</select>
		<select class='tvision' v-model='interval'>
			<option v-for = 'v in intervals' :value='v'>{{v}}</option>
		</select>
		<button @click="emitSelect">Select</button>
	</div>
</template>

<script>
	import { contract, allCurrencies } from '../../contract'
	import EventBus from './EventBus'
	import tradeStore from './tradeStore'
	import * as helpers from '../../utils/helpers'

	import SelectPool from '../common/SelectPool.vue'

	export default {
		components: {
			SelectPool
		},
		data: () => ({
			pools: tradeStore.pools,
			pool: tradeStore.pool,
			pair: '',
			interval: tradeStore.interval,
			intervals: tradeStore.intervals
		}),
		mounted() {
			this.pair = this.pairs[0];
			//this.$emit('selected', this.pool, this.pair, this.interval)
		},
		methods: {
			emitSelect() {
				tradeStore.pools = this.pools
				tradeStore.pairIdx = this.pair.idx
				tradeStore.pairVal = this.pair.val
				tradeStore.interval = this.interval
				//EventBus.$emit('selected', this.pool, this.pair, this.interval)
			}
		},
		computed: {
			pairs() {
				//this.pools.map(p=>Object.entriesallCurrencies[this.pool])
				if(!this.pools.length) return []
				let pools = this.pools.map(p=>p == 'y' ? 'iearn' : p)
				let duplicates
				if(pools.length > 1) {
					let filteredCurrencies = Object.keys(allCurrencies).filter(p => pools.includes(p))
					duplicates = filteredCurrencies
										.flatMap(f=>Object.keys(allCurrencies[f]))
										.filter((k, i, all)=>all.indexOf(k) === i && all.lastIndexOf(k) !== i)
				}
				else {
					duplicates = Object.keys(allCurrencies[this.pools])
				}
				var pairs = []
				for(let [i, val] of duplicates.entries()) {
					for(let [j, val1] of duplicates.entries()) {
						if(i != j) pairs.push({
							idx: `${i}-${j}`,
							val: `${val}-${val1}`
						})
					}
				}
				return pairs
			}
		}
	}
</script>

<style scoped>
	button {
		box-shadow: none;
		margin-left: 10px;
	}
	select {
		margin-left: 10px;
		box-shadow: none;
	}
	select:nth-of-type(1) {
		margin-left: 0;
	}
	option {
		color: black;
		background: #d7d5d5;
	}
	#poolselect {
		margin-bottom: 1em;
	}
	#poolselect > label:nth-of-type(1) {
		margin-left: 0;
	}
	#poolselect > label {
		margin-left: 1em;
	}
	@media only screen and (min-device-width : 320px) and (max-device-width : 730px) {
		select, button {
			display: block;
		}
		select, button {
			margin-left: 0;
			margin-top: 10px;
		}
	}
</style>