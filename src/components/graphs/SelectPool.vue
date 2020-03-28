<template>
	<div>
		<select class='tvision' v-model='pool'>
			<option value='compound'>Compound</option>
			<option value='usdt'>usdt</option>
			<option value='iearn'>Y</option>
			<option value='busd'>busd</option>
		</select>
		<select class='tvision' v-model='pair'>
			<option v-for = 'v in pairs' :value='v'>{{v.val | toUpper}}</option>
		</select>
		<select class='tvision' v-model='interval'>
			<option v-for = 'v in intervals' :value='v'>{{v}}m</option>
		</select>
		<button @click="emitSelect">Select</button>
	</div>
</template>

<script>
	import { contract, allCurrencies } from '../../contract'
	import EventBus from './EventBus'
	import tradeStore from './tradeStore'
	import * as helpers from '../../utils/helpers'

	export default {
		data: () => ({
			pool: 'compound',
			pair: '',
			interval: 5,
			intervals: [1, 5, 10, 30]
		}),
		mounted() {
			this.pair = this.pairs[0];
			//this.$emit('selected', this.pool, this.pair, this.interval)
		},
		methods: {
			emitSelect() {
				tradeStore.pool = this.pool
				tradeStore.pairIdx = this.pair.idx
				tradeStore.pairVal = this.pair.val
				tradeStore.interval = this.interval
				//EventBus.$emit('selected', this.pool, this.pair, this.interval)
			}
		},
		computed: {
			pairs() {
				var pairs = []
				for(let [i, val] of Object.keys(allCurrencies[this.pool]).entries()) {
					for(let [j, val1] of Object.keys(allCurrencies[this.pool]).entries()) {
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
</style>