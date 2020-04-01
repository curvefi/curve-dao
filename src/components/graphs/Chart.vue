<template>
	<div class = 'tradeview window white'>
 		<select-pool id='select_pool'/>
 		<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
		<depth id='depth_chart' />
		<fieldset id='onesplit'>
			<legend class='text-center'>Swap using all Curve pools</legend>
			<one-split />
		</fieldset>
	</div>
</template>

<script>
	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)

	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'
	import Depth from './Depth.vue'
	import SelectPool from './SelectPool.vue'
	import EventBus from './EventBus'
	import tradeStore from './tradeStore'
	import stableswap_fns from '../../utils/stableswap_fns'
	import OneSplit from './OneSplit.vue'

	import Decimal from 'break_infinity.js'

	let BN = val => new Decimal(val)

	import * as Comlink from 'comlink'

	import Worker from 'worker-loader!./worker.js';
	const worker = new Worker();
	const calcWorker = Comlink.wrap(worker);


/*	Highcharts.seriesTypes.column.prototype.pointAttribs = (function(func) {
	    return function(point, state) {
	      var attribs = func.apply(this, arguments);
	      
	      var candleSeries = this.chart.series[0]; // Probably you'll need to change the index
	      var candlePoint = candleSeries.points.filter(function(p) { return p.index == point.index; })[0];

	      var color = (candlePoint.open < candlePoint.close) ? '#007A00' : '#B70000'; // Replace with your colors
	      attribs.fill = state == 'hover' ? Highcharts.Color(color).brighten(0.3).get() : color;
	      
	      return attribs;
	    };
	}(Highcharts.seriesTypes.column.prototype.pointAttribs));*/

	Highcharts.setOptions({
		lang: {
			loading: '',
			rangeSelectorZoom: '',
		}
	})

	import { contract, allCurrencies, LENDING_PRECISION, PRECISION, changeContract } from '../../contract'

	import abis from '../../allabis'

	stockInit(Highcharts)

	export default {
		components: {
			highcharts: Chart,
			Depth,
			SelectPool,
			OneSplit,
		},
		data() {
			return {
				loading: true,	
					chartdata: {
						plotOptions: {
							candlestick: {
								color: '#B70000',
								upColor: '#007A00',
							},
							series: {
								point: {
									events: {
										click: (function(self) {
											return function() {
												let index = this.dataGroup ? this.dataGroup.start : this.index
												EventBus.$emit('changeTime', self.data[this.index])
											}
										})(this)
									}
								}
							}
						},
						navigator: {
							series: {
								lineColor: '#a6cdf1',
								color: '#f8fbfe'
							}
						},
						exporting: {
							buttons: {
								contextButton: {
									menuItems: ["printChart",
							                    "separator",
							                    "downloadPNG",
							                    "downloadJPEG",
							                    "downloadPDF",
							                    "downloadSVG",
							                    "separator",
							                    "downloadCSV",
							                    "downloadXLS",
							                    //"viewData",
							                    "openInCloud"]
								}
							}
						},
						rangeSelector: {
							selected: 4,
							allButtonsEnabled: true,
							buttonTheme: {
						        visibility: 'hidden',
						    },
						    labelStyle: {
						        //visibility: 'hidden'
						    },
				            inputPosition: {
				            	x: 0,
								align:'left',
					        },
						 	buttons: [{
		                        type: 'minute',
		                        count: 100,
		                        text: '1m',
		                        dataGrouping: {
				                    forced: true,
				                    units: [['minute', [1]]]
				                }
		                    }, 
		                    {
		                        type: 'minute',
		                        count: 500,
		                        text: '5m',
		                        dataGrouping: {
			                 	   forced: true,
				                    units: [['minute', [5]]]
				                }
		                    },
		                    {
		                    	type: 'minute',
		                    	count: 1500,
		                    	text: '15m',
		                        dataGrouping: {
			                 	   forced: true,
				                    units: [['minute', [15]]]
				                }
		                    },
		                    {
		                        type: 'minute',
		                        count: 3000,
		                        text: '30m',
		                        dataGrouping: {
			                 	   forced: true,
				                    units: [['minute', [30]]]
				                }
		                    }, 
		                    {
		                        type: 'hour',
		                        count: 500,
		                        text: '1h',
		                        dataGrouping: {
			                 	   forced: true,
				                    units: [['hour', [1]]]
				                }
		                    }, 
		                    {
		                        type: 'hour',
		                        count: 1000,
		                        text: '2h',
		                        dataGrouping: {
				                    forced: true,
				                    units: [['hour', [2]]]
				                }
		                    },
		                    {
		                        type: 'hour',
		                        count: 2000,
		                        text: '4h',
		                        dataGrouping: {
			                 	   forced: true,
				                    units: [['hour', [4]]]
				                }
		                    },
		                    {
		                        type: 'hour',
		                        count: 3000,
		                        text: '6h',
		                        dataGrouping: {
			                 	   forced: true,
				                    units: [['hour', [6]]]
				                }
		                    },
		                    {
		                        type: 'day',
		                        count: 30,
		                        text: '1d',
		                        dataGrouping: {
			                 	   forced: true,
				                    units: [['day', [1]]]
				                }
		                    },
		                    {
		                        type: 'day',
		                        count: 90,
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
					        panKey: 'ctrl',
					        events: {
					        	click: (function(self) {
					        		return function(e) {
					        			let nearest = self.chart.pointer.findNearestKDPoint(self.chart.series, false, e)
					        			//console.log(nearest)
					        			let index = nearest.dataGroup ? nearest.dataGroup.start : nearest.index
					        			//console.log(self.data[nearest.index])
										let calc = stableswap_fns({
											...self.data[index],
											...self.poolConfig,
										});
										let get_dy_underlying = calc.get_dy_underlying(self.fromCurrency, self.toCurrency, abis[self.pool].coin_precisions[self.fromCurrency])
										//console.log(+get_dy_underlying, "price at point", index)
										//console.log(self.data[index].prices["0-1"])
										EventBus.$emit('changeTime', self.data[index])
					        		}
					        	})(this),
					        	load() {
					        		this.redraw();
					        	},
					        	render() {
					        		if(this.plotWidth < 480) {
					        			this.rangeSelector.maxLabel.translate(0, 25)
					        			this.rangeSelector.maxDateBox.translate(37, 25)
					        		}
					        		else {
					        			this.rangeSelector.maxLabel.translate(141, 0)
					        			this.rangeSelector.maxDateBox.translate(164, 0)
					        		}
					        	}
					        }
						},
						title: {
							text: '',
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
					  		borderColor: '#a6cdf1',
					  	},
					  	series: [
						  	{
						  		type: 'candlestick',
					            name: this.pairVal,
					            data: [],
						  	},
						  	{
						  		type: 'column',
					            name: 'Volume',
					            data: [],
					            yAxis: 1,
						  	}
					  	],
			    	},
				  	pair: {
				  		
				  	},
				  	pool: '',
				  	pools: [],
				  	interval: null,
				  	chart: null,
				  	data: [],
				  	poolConfigs: null,
				  	fromCurrency: null,
				  	toCurrency: null,
		  }
		},
		created() {
			//EventBus.$on('selected', this.selectPool);
		},
		watch: {
			selectChange() {
				console.log("CHANGE")
				this.mounted()
			}
		},
		mounted() {
			this.chart = this.$refs.highcharts.chart;
/*			this.$watch(()=>contract.initializedContracts, val => {
                if(val) this.mounted();
            })*/
            this.mounted()
		},
		beforeDestroy() {
			EventBus.$off('selected', this.selectPool)
		},
		computed: {
			selectChange() {
				return tradeStore.pairIdx, tradeStore.pools.join(), tradeStore.interval, Date.now();
			}
		},
		methods: {
			async mounted() {

				this.chart.showLoading();
				this.pools = tradeStore.pools;
				this.pairIdx = tradeStore.pairIdx
				this.pairVal = tradeStore.pairVal
				this.interval = tradeStore.interval;
/*				while(this.chart.series.length) {
					this.chart.series[0].remove()
				}*/

				//return;
				//move this to selectPool method
				let jsonInterval = this.interval;
				if(tradeStore.intervals.indexOf(jsonInterval) > 3) jsonInterval = '30m'
				let urls = tradeStore.pools.map(pool=>fetch(`https://beta.curve.fi/raw-stats/${pool == 'iearn' ? 'y' : pool}-${jsonInterval}.json`));
				let requests = await Promise.all(urls)
				let data = this.data = await Promise.all(requests.map(r=>r.json()))
				//tradeStore.data = data;
				let pools = tradeStore.pools.map(p=>p == 'y' ? 'iearn' : p)
				let poolConfigs = this.poolConfigs = pools.map(pool => {
					console.log(abis[pool])
					return {
						N_COINS: abis[pool].N_COINS,
						PRECISION_MUL: abis[pool].coin_precisions.map(p=>1e18/p),
						USE_LENDING: abis[pool].USE_LENDING,
						LENDING_PRECISION,
						PRECISION,
					}
				})

				let fromCurrency = this.fromCurrency = this.pairIdx.split('-')[0]
				let toCurrency = this.toCurrency = this.pairIdx.split('-')[1]
				let inverse = false;
				if(fromCurrency > toCurrency) {
					inverse = true;
					[fromCurrency, toCurrency] = [toCurrency, fromCurrency]
					this.pairIdx = `${fromCurrency}-${toCurrency}`
				}


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
				//data = JSON.parse(JSON.stringify(data))
				console.log("TUK I TUK I TAM")
				let ohlcData = []
				try {
					for(let i = 0; i < data[0].length; i++) {
						ohlcData[i] = {}
						ohlcData[i].timestamp = data[0][i].timestamp
						ohlcData[i].prices = {}
						ohlcData[i].prices[this.pairIdx] = []
						ohlcData[i].volume = {}
						ohlcData[i].volume[this.pairIdx] = []
						for(let j = 0; j < data.length; j++) {
							let v = data[j][i]
							console.log(this.pools[j], "POOLS")
							let get_dy_underlying = await calcWorker.calcPrice(
								{...v, ...poolConfigs[j]}, fromCurrency, toCurrency, abis[pools[j]].coin_precisions[fromCurrency])
							let calcprice = +(BN(get_dy_underlying).div(abis[pools[j]].coin_precisions[toCurrency]))
							if(inverse) calcprice = 1 / calcprice
							if(v.prices[this.pairIdx]) {
								if(!inverse) v.prices[this.pairIdx] = v.prices[this.pairIdx].map(price => 1/price)
								v.prices[this.pairIdx].push(calcprice)
							}
							else {
								v.prices[this.pairIdx] = [calcprice]
								v.volume[this.pairIdx] = [0]
							}
							ohlcData[i].prices[this.pairIdx].push(...v.prices[this.pairIdx])
							ohlcData[i].volume[this.pairIdx].push(...v.volume[this.pairIdx].map((v,k)=>v / abis[pools[j]].coin_precisions[k]))
						}
					}
				}
				catch(err) {
					console.error(err)
				}
				console.log(ohlcData)


			    // split the data set into ohlc and volume
			    var ohlc = [],
			        volume = [],
			        dataLength = ohlcData.length
			        // set the allowed units for data grouping



			    for (let i = 0; i < dataLength; i ++) {
			    	let len = ohlcData[i].prices[this.pairIdx].length
/*			    	console.log(ohlcData[i].timestamp*1000, // the date
			            ohlcData[i].prices[this.pairIdx][0], // open
			            Math.max(...ohlcData[i].prices[this.pairIdx]), // high
			            Math.min(...ohlcData[i].prices[this.pairIdx]), // low
			            ohlcData[i].prices[this.pairIdx][len-1] // close
			        )*/
			        ohlc.push([
			            ohlcData[i].timestamp*1000, // the date
			            ohlcData[i].prices[this.pairIdx][0], // open
			            Math.max(...ohlcData[i].prices[this.pairIdx]), // high
			            Math.min(...ohlcData[i].prices[this.pairIdx]), // low
			            ohlcData[i].prices[this.pairIdx][len-1] // close
			        ]);
			        let volumeData = ohlcData[i].volume[this.pairIdx][0]
			        if(inverse) volumeData = ohlcData[i].volume[this.pairIdx][1]
			        volume.push([
			            ohlcData[i].timestamp*1000, // the date
			            volumeData // the volume
			        ]);
/*
			        if(inverse) {
			        	ohlc = ohlc.map(p => p.map((v, i) => i > 0 ? 1/v : v))
			        	volume = volume.map((p, i) => {
			        		p[1] = data[i].volume[this.pairIdx][1] / abis[this.pool].coin_precisions[toCurrency]
			        		return p;
			        	})
			        }*/
			        if(i == dataLength/20 || i == dataLength/10 || i == dataLength/5 || i == dataLength/2 || i == dataLength-1) {
					    this.$refs.highcharts.chart.series[0].setData(ohlc)
					    this.$refs.highcharts.chart.series[1].setData(volume)
			        }
			    }
		        console.log(this.$refs.highcharts.chart)
		        this.chart.setTitle({text: this.pairVal.toUpperCase()})
/*		        this.chart.update({
		        	rangeSelector: {
		        		buttons: this.chartdata.rangeSelector.buttons.map(b=> {
		        			let cb = {...b}
		        			cb.count /= jsonInterval.slice(0,-1) / 2
		        			return cb;
		        		})
		        	}
		        })*/
		        //highcharts doesn't select the defined range, doing it again manually
		        this.chart.rangeSelector.clickButton(tradeStore.intervals.indexOf(this.interval), true)
		        this.chart.redraw();
		        this.chart.hideLoading();
			    this.loading = false;
			}
		}
	}
</script>

<style scoped>
	.tradeview {
		width: 70%;
		max-width: 1280px;
	}
	#select_pool {
		margin-bottom: 10px;
	}
	#onesplit {
		margin-top: 30px;
	}
</style>