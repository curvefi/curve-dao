import Vue from 'vue'


export default Vue.observable({
  	pairIdx: '0-1',
  	pairVal: 'dai-usdc',
  	pool: 'compound',
  	pools: ['compound'],
  	interval: '30m',
	intervals: ['1m', '5m', '10m', '30m', '1h', '2h', '4h', '6h', '1d', '3d', '1w'],
  	data: [],
})