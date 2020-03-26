<template>
	<div class='window white'>
		<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
		<depth/>
	</div>
</template>

<script>
	import Highcharts from 'highcharts'
	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'
	import Depth from './Depth.vue'

	import stableswap_fns from '../../utils/stableswap_fns'

	import { contract } from '../../contract'

	stockInit(Highcharts)

	export default {
		components: {
			highcharts: Chart,
			Depth,
		},
		data: () => ({
		loading: true,	
			chartdata: {
				rangeSelector: {
					selected: 1,
				},
				chart: {
					height: 600,
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl'
				},
				title: {
					text: 'Price',
				},
				rangeSelector: {
				    selected: 1
				},
				yAxis: [{
						labels: {
		                align: 'right',
			                x: -3
			            },
			            title: {
			                text: 'OHLC'
			            },
			            height: '60%',
			            lineWidth: 2,
			            resize: {
			                enabled: true
			            }
			        }, 
			        {
			            labels: {
			                align: 'right',
			                x: -3
			            },
			            title: {
			                text: 'Volume'
			            },
			            top: '65%',
			            height: '35%',
			            offset: 0,
			            lineWidth: 2
			        }],
			  	tooltip: {
			  		split: true,
			  	},
			  	series: []
	    	},
		}),
		created() {
			this.$watch(()=>contract.initializedContracts, val => {
                if(val) this.mounted();
            })
		},
		methods: {

			async mounted() {
				let data = require('../../jsons/compound-30m.json');
				let N_COINS = 2;
				let PRECISION_MUL = [1, 1000000000000]
				let COIN_PRECISIONS = [1e18, 1e6]
				let USE_LENDING = [true, true]
				let LENDING_PRECISION = 10 ** 18
				const PRECISION = 10 ** 18

				let compound = {
					N_COINS,
					PRECISION_MUL,
					USE_LENDING,
					LENDING_PRECISION,
					PRECISION,
				}

				let pair = "0-1" //DAI -> USDC

				let A = await contract.swap.methods.A().call();
				let fee = await contract.swap.methods.fee().call()
				let admin_fee = await contract.swap.methods.fee().call()
				let supply = await contract.swap_token.methods.totalSupply().call()
				let virtual_price = await contract.swap.methods.get_virtual_price().call()
				let balances = []
				let rates = []
				for(let i = 0; i < 2; i++) {
					balances[i] = await contract.swap.methods.balances(i).call();
					balances[i] = await contract.swap.methods.balances(i).call();
					var rate = parseInt(await contract.coins[i].methods.exchangeRateStored().call()) / 1e18 / contract.coin_precisions[i];
		            var supply_rate = parseInt(await contract.coins[i].methods.supplyRatePerBlock().call());
		            var old_block = parseInt(await contract.coins[i].methods.accrualBlockNumber().call());
		            var block = await web3.eth.getBlockNumber();
		            rates[i] = rate * (1 + supply_rate * (block - old_block) / 1e18);
				}
				rates[0] = rates[0] * 1e36
				rates[1] = rates[1] * 1e24;
				let timestamp = (Date.now() / 1000) | 0;

				let now = {
					A,
					fee,
					admin_fee,
					supply,
					virtual_price,
					balances,
					rates,
					timestamp,
				}

				let backthen = {
				    "A": 900,
				    "fee": 4000000,
				    "admin_fee": 4000000,
				    "supply": 7.267255607935256e+23,
				    "virtual_price": 1006852215150595300,
				    "timestamp": 1584291599,
				    "balances": [
				      196432500571782,
				      3300071302423743
				    ],
				    "rates": [
				      2.037255586806981e+26,
				      210068692819438
				    ],
				    "volume": {
				      "0-1": [
				        7.457819316127888e+21,
				        7813068889
				      ]
				    },
				    "prices": {
				      "0-1": [
				        0.9502120652613583,
				        0.9553191996987546,
				        0.9558984125801876,
				        0.9561538089038809,
				        0.9560588329908627
				      ]
				    }
				  }

				let calc = stableswap_fns({
					...data[619],
					...compound,
				});

				let get_dy_underlying = calc.get_dy_underlying(0, 1, 1 * 1e18)
				console.log(+get_dy_underlying, "get_dy_underlying")
				data = data.map(v=> {
					if(v.prices[pair]) {
						return v
					}
					else {
						let calc = stableswap_fns({
							...v,
							...compound,
						});
						let get_dy_underlying = calc.get_dy_underlying(0, 1, 1 * 1e18)
						let calcprice = get_dy_underlying
						console.log(+calcprice)
						v.prices[pair] = [+(calcprice.div(1e6))]
						v.volume[pair] = [0]
						if(calcprice > 1.1 || calcprice < 0.9) console.log(v)
						return v;
					}
				})



			    // split the data set into ohlc and volume
			    var ohlc = [],
			        volume = [],
			        dataLength = data.length,
			        // set the allowed units for data grouping

			        i = 0;

			    let len = data[0].prices[pair].length

			    for (i; i < dataLength; i += 1) {
			    	console.log(data[i].prices[pair])
			        ohlc.push([
			            data[i].timestamp*1000, // the date
			            data[i].prices[pair][0], // open
			            Math.max(...data[i].prices[pair]), // high
			            Math.min(...data[i].prices[pair]), // low
			            data[i].prices[pair][len-1] // close
			        ]);

			        volume.push([
			            data[i].timestamp*1000, // the date
			            data[i].volume[pair][0]/1e18 // the volume
			        ]);
			    }

			    this.$refs.highcharts.chart.addSeries({
		            type: 'candlestick',
		            name: 'DAI/USDC',
		            data: ohlc,
		            dataGrouping: {
		                units: [
		                	['minute', [120]],

			        	]
		            }
	        	})
			    this.$refs.highcharts.chart.addSeries({
		            type: 'column',
		            name: 'Volume',
		            data: volume,
		            yAxis: 1,
		            dataGrouping: {
		                units: [
		                	['minute', [120]],

			        	]
		            }
		        })
		        this.$refs.highcharts.chart.redraw()
			    this.loading = false;
			}
		}
	}
</script>

<style>
	
</style>