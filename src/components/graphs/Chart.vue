<template>
	<div class = 'tradeview'>
		<select-pool />
 		<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
		<depth/>
	</div>
</template>

<script>
	import Highcharts from 'highcharts'
	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'
	import Depth from './Depth.vue'
	import SelectPool from './SelectPool.vue'
	import EventBus from './EventBus'
	import stableswap_fns from '../../utils/stableswap_fns'

	import { contract, allCurrencies, LENDING_PRECISION, PRECISION } from '../../contract'

	import abis from '../../allabis'

	stockInit(Highcharts)

	export default {
		components: {
			highcharts: Chart,
			Depth,
			SelectPool,
		},
		data: () => ({
		loading: true,	
			chartdata: {
				plotOptions: {
					series: {
						point: {
							events: {
								click: function() {
									EventBus.$emit('changeTime', this.index)
								}
							}
						}
					}
				},
				rangeSelector: {
					selected: 4,
					allButtonsEnabled: true,
					 buttons: [{
                        type: 'minute',
                        count: 10,
                        text: '1m',
                        dataGrouping: {
		                    forced: true,
		                    units: [['minute', [1]]]
		                }
                    }, 
                    {
                        type: 'minute',
                        count: 50,
                        text: '5m',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['minute', [5]]]
		                }
                    },
                    {
                    	type: 'minute',
                    	count: 150,
                    	text: '15m',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['minute', [15]]]
		                }
                    },
                    {
                        type: 'minute',
                        count: 300,
                        text: '30m',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['minute', [30]]]
		                }
                    }, 
                    {
                        type: 'hour',
                        count: 10,
                        text: '1h',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['hour', [1]]]
		                }
                    }, 
                    {
                        type: 'hour',
                        count: 20,
                        text: '2h',
                        dataGrouping: {
		                    forced: true,
		                    units: [['hour', [2]]]
		                }
                    },
                    {
                        type: 'hour',
                        count: 40,
                        text: '4h',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['hour', [4]]]
		                }
                    },
                    {
                        type: 'hour',
                        count: 60,
                        text: '6h',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['hour', [6]]]
		                }
                    },
                    {
                        type: 'day',
                        count: 10,
                        text: '1d',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['day', [1]]]
		                }
                    },
                    {
                        type: 'day',
                        count: 30,
                        text: '3d',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['day', [3]]]
		                }
                    },
                    {
                    	type: 'week',
                    	count: 10,
                    	text: '1w',
                        dataGrouping: {
	                 	   forced: true,
		                    units: [['week', [1]]]
		                }
                    }
                    ]
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
			  	series: [],
	    	},
		  	pair: {
		  		idx: '0-1',
		  		val: 'DAI-USDC'
		  	},
		  	pool: 'compound',
		  	interval: 5,
		  	chart: null,
		}),
		created() {
			EventBus.$on('selected', this.selectPool);
		},
		mounted() {
			console.log(this.pool)
			this.chart = this.$refs.highcharts.chart;
			this.$watch(()=>contract.initializedContracts, val => {
                if(val) this.mounted();
            })
		},
		beforeDestroy() {
			EventBus.$off('selected', this.selectPool)
		},
		methods: {

			selectPool(pool, pair, interval) {
				console.log("SELECT POOL")
				this.pool = pool;
				this.pair = pair;
				this.interval = interval;
				console.log(pool, pair, interval)
				console.log(this.chart.series)
				if(this.chart.series.length) {
					//calling remove changes indexes of chart series, we have two series, so removing them both with index 0
					this.chart.series[0].remove()
					this.chart.series[0].remove()
				}
				this.mounted();
			},

			async mounted() {

				let data = require(`../../jsons/${this.pool}-${this.interval}m.json`);

				let poolConfig = {
					N_COINS: abis[this.pool].N_COINS,
					PRECISION_MUL: abis[this.pool].coin_precisions.map(p=>1e18/p),
					USE_LENDING: abis[this.pool].USE_LENDING,
					LENDING_PRECISION,
					PRECISION,
				}

				let fromCurrency = this.pair.idx.split('-')[0]
				let toCurrency = this.pair.idx.split('0')[1]


/*				let A = await contract.swap.methods.A().call();
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
				*/
				data = data.map(v=> {
					if(v.prices[this.pair.idx]) {
						return v
					}
					else {
						let calc = stableswap_fns({
							...v,
							...poolConfig,
						});
						let get_dy_underlying = calc.get_dy_underlying(0, 1, abis[this.pool].coin_precisions[fromCurrency])
						let calcprice = get_dy_underlying
						v.prices[this.pair.idx] = [+(calcprice.div(abis[this.pool].coin_precisions[toCurrency]))]
						v.volume[this.pair.idx] = [0]
						//if(calcprice > 1.1 || calcprice < 0.9) console.log(v)
						return v;
					}
				})



			    // split the data set into ohlc and volume
			    var ohlc = [],
			        volume = [],
			        dataLength = data.length
			        // set the allowed units for data grouping


			    let len = data[0].prices[this.pair.idx].length

			    for (let i = 1; i < dataLength; i ++) {
			        ohlc.push([
			            data[i].timestamp*1000, // the date
			            data[i].prices[this.pair.idx][0], // open
			            Math.max(...data[i].prices[this.pair.idx]), // high
			            Math.min(...data[i].prices[this.pair.idx]), // low
			            data[i].prices[this.pair.idx][len-1] // close
			        ]);
			        volume.push([
			            data[i].timestamp*1000, // the date
			            data[i].volume[this.pair.idx][0]/abis[this.pool].coin_precisions[fromCurrency] // the volume
			        ]);
			    }

			    this.$refs.highcharts.chart.addSeries({
		            type: 'candlestick',
		            name: this.pair.val,
		            data: ohlc,
		            dataGrouping: {
		                units: [
		                	['hour', [1]],

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
		                	['hour', [1]],

			        	]
		            }
		        })
		        this.$refs.highcharts.chart.redraw()
		        console.log(this.$refs.highcharts.chart)
		        this.$refs.highcharts.chart.setTitle({title: this.pair.val})
			    this.loading = false;
			}
		}
	}
</script>

<style scoped>
	.tradeview {
		width: 90%;
		margin: 0 auto;
	}
</style>