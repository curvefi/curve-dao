<template>
	<div class='bigdiv'>
		<div id='zoomSelect'>
			<label for='zoom'>Zoom {{zoom}}%</label>
			<input type='range' min='0' max='300' id='zoom' v-model='zoom'/>
<!-- 			<input type='range' min='0' max='110' id='volzoom' v-model='volZoom'/>
 -->		</div>
<!-- 		<button @click='setExtremes'>Look at actual price * +-0.01</button>
 -->		<div @mousemove = 'move' ref='chartcontainer'>
			<highcharts :options='depthchart' ref='highcharts' class='depthchart'></highcharts>
		</div>
	</div>
</template>

<script>
	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)

	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})


	import {Chart} from 'highcharts-vue'
	import EventBus from './EventBus'
	import tradeStore from './tradeStore'
	import stableswap_fns from '../../utils/stableswap_fns'
	import { getters, contract, LENDING_PRECISION, PRECISION, changeContract, init } from '../../contract'
	import abis from '../../allabis'
	import Decimal from 'break_infinity.js'
	import Spline from 'cubic-spline'
	import jsspline from 'js-spline';
	import { CurveInterpolator } from 'curve-interpolator';
	import interpolator from 'natural-spline-interpolator'


	let BN = val => new Decimal(val)

	import * as Comlink from 'comlink'

	import Worker from 'worker-loader!./worker.js';
	const worker = new Worker();
	const calcWorker = Comlink.wrap(worker);

	export default {
		components: {
			highcharts: Chart,
		},
		data() {
			return {
				loading: true,
				zoom: 100,
				volZoom: 100,
				chart: null,
			    	depthchart: {
			    		chart: {
			    			type: 'areaspline',
			    			zoomType: 'x',
			    			marginTop: 20,
			    			marginLeft: 20,
			    			marginRight: 20,
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
			    		title: {
			    			text: ''
			    		},
			    		xAxis: {
			    			//type: 'logarithmic',
			    			crosshair: {
			    				color: 'gray',
			    				width: 1.5,
			    			},
			    			minPadding: 0,
			    			maxPadding: 0,
			    			 plotLines: [{
			    			 	id: 1,
					            color: '#888',
					            value: 1,
					            width: 1,
					            label: {
					                text: 'Actual price',
					                rotation: 90
					            }
					        }],
			    			title: {
			    				text: 'Price'
			    			},
			    			events: {
			    				setExtremes: (function(self) {
				    				return function(e) {
				    					//on reset zoom button click
						                if(typeof e.min == 'undefined' && typeof e.max == 'undefined') {
						                	//setting zoom to 100 doesn't work?? so 99.99 is pretty close :D
						                	self.zoom = 99.99
						                }

				    				}
			    				})(this)
			    			}
			    		},
			    		yAxis: [{
			    			type: 'logarithmic',
			    			crosshair: {
			    				color: 'gray',
			    				width: 1.5,
			    			},
			    			min: 1,
					        lineWidth: 1,
					        gridLineWidth: 1,
					        title: null,
					        tickWidth: 1,
					        tickLength: 5,
					        tickPosition: 'inside',
					        labels: {
					            align: 'left',
					            x: 8
					        }
					    }, {
					    	type: 'logarithmic',
					    	crosshair: {
					    		color: 'gray',
					    		width: 1.5,
					    	},
					    	min: 1,
					        opposite: true,
					        linkedTo: 0,
					        lineWidth: 1,
					        gridLineWidth: 0,
					        title: null,
					        tickWidth: 1,
					        tickLength: 5,
					        tickPosition: 'inside',
					        labels: {
					            align: 'right',
					            x: -8
					        }
					    }],
					    legend: {
					        enabled: false
					    },
					    plotOptions: {
					        area: {
					            fillOpacity: 0.2,
					            step: 'center',
					        }
					    },
					    tooltip: {
					        headerFormat: '<span style="font-size=10px;">Price: {point.key}</span><br/>',
					        valueDecimals: 2
					    },
					    series: [],
			    	},
			    	pair: {
				  		idx: '0-1',
				  		val: 'DAI-USDC'
				  	},
				  	pool: 'compound',
				  	pools: [],
				  	poolInfo: {},
				  	interval: 5,
			    	bbrect: null,
			    	data: [],
			    	currentValue: 1,
			    	imax: 100,
			    	inverse: false,
			    	unwatch: null,
			}
		},
		async created() {
			//EventBus.$on('selected', this.selectPool)
			EventBus.$on('changeTime', this.changeTime)
			this.unwatch = this.$watch(()=>contract.initializedContracts, async (val) => {
				await this.updatePoolInfo()
                this.mounted()
                this.unwatch();
            })
		},
		watch:{
			async selectChange(val, oldval) {
				//don't call mount when pools are changed, it's called when contacts are re-initialized
				//pairIdx or interval are changed
				let arr = val[1].concat();
				let oldarr = oldval[1].concat();
				if(arr.sort().toString() == oldarr.sort.toString()) this.mounted()
				else {
					console.log(val[1], "VAL1")
					try {					
						let inits = await Promise.all(val[1].map(p=>{
							console.log(contract.contracts[p == 'y' ? 'iearn' : p])
							return init(contract.contracts[p == 'y' ? 'iearn' : p])
						}))
					}
					catch(err) {
						console.error(err)
					}
					this.chart.showLoading()
					this.chart.xAxis[0].removePlotLine(1)
                	await this.updatePoolInfo();
					this.mounted()
				}
			},
			zoom() {
				this.setZoom()
			},
/*			volZoom(val) {
				this.chart.yAxis[0].min = val*100+1
				this.chart.yAxis[1].min = val*100+1
				console.log(val*100+1)
				this.chart.yAxis[0].update();
				this.chart.yAxis[1].update()
			}*/
		},
		async mounted() {
			this.chart = this.$refs.highcharts.chart
			this.chart.showLoading();
/*			await Promise.all(tradeStore.pools.map(p=>{
				return init(contract.contracts[p == 'y' ? 'iearn' : p])
			}))
			await this.updatePoolInfo();*/
			//this.mounted();
		},
		beforeDestroy() {
			//EventBus.$off('selected', this.selectPool)
			EventBus.$off('changeTime', this.changeTime)
		},
		computed: {
			selectChange() {
				return [tradeStore.pairIdx, tradeStore.pools, tradeStore.interval]
			}
		},
		methods: {
			setZoom() {
				let ind1 = 1;
				let ind2 = 0;
				let min_price = Math.min(this.chart.series[ind1].xData[0], this.chart.series[ind1].xData[100-1])
				let max_price = Math.max(this.chart.series[ind2].xData[0], this.chart.series[ind2].xData[100-1])
				let p = (this.chart.series[0].xData[0] + this.chart.series[1].xData[0]) / 2
				let priceLeft = Math.max(min_price, p - (max_price - p))
				let priceRight = Math.min(max_price, p + (p - min_price))

				let zoom = +this.zoom
				priceLeft = p - (p - priceLeft) * Math.pow(10, 2 * (zoom / 100 - 1))
				priceRight = p + (priceRight - p) * Math.pow(10, 2 * (zoom / 100 - 1))
				this.chart.xAxis[0].setExtremes(priceLeft, priceRight, true, false);
			},
			setExtremes() {
				//console.log(this.chart.series[0].xData[0], this.chart.series[1].xData[0]);
            	this.chart.xAxis[0].setExtremes(this.chart.series[1].xData[0] - 0.001, this.chart.series[0].xData[0] + 0.001, true, true)
			},
			async updatePoolInfo() {
				this.poolInfo = []
				for(let [key, pool] of tradeStore.pools.entries()) {
					if(pool == 'y') pool = 'iearn'
					let cont = contract.contracts[pool]
					if(pool == contract.currentContract) cont = contract
					//console.log(contract.contracts[pool], "POOL")
					console.log(cont, "CONTRACT")
					this.poolInfo[key] = {}
					this.poolInfo[key].A = await cont.swap.methods.A().call();
					this.poolInfo[key].fee = cont.fee * 1e10
					this.poolInfo[key].admin_fee = cont.admin_fee * 1e10
					this.poolInfo[key].supply = await cont.swap_token.methods.totalSupply().call()
					this.poolInfo[key].virtual_price = await cont.swap.methods.get_virtual_price().call()
					this.poolInfo[key].balances = cont.balances;
					console.log(cont.c_rates, "C RATES", PRECISION, abis[pool].coin_precisions)
					this.poolInfo[key].rates = cont.c_rates.map((r,i)=>+(BN(r).times(PRECISION).times(abis[pool].coin_precisions[i])))
					this.poolInfo[key].timestamp = (Date.now() / 1000) | 0;
				}
			},

			//we can go back in time! Time travelling!
			changeTime(poolInfo) {
				this.poolInfo = poolInfo

				this.mounted()
			},
			async mounted() {
				this.chart.showLoading()
				this.chart.xAxis[0].removePlotLine(1)
				this.pools = tradeStore.pools
				this.pairIdx = tradeStore.pairIdx
				this.pairVal = tradeStore.pairVal
				this.interval = tradeStore.interval

				//return;
				this.loading = true;

				while(this.chart.series.length) {
					this.chart.series[0].remove()
				}

				let pools = tradeStore.pools.map(p=>p == 'y' ? 'iearn' : p)
				let poolConfigs = this.poolConfigs = pools.map(pool => {
					return {
						N_COINS: abis[pool].N_COINS,
						PRECISION_MUL: abis[pool].coin_precisions.map(p=>1e18/p),
						USE_LENDING: abis[pool].USE_LENDING,
						LENDING_PRECISION,
						PRECISION,
					}
				})

				/*console.log(contract.bal_info.map((b,i)=>b/contract.c_rates[i]))
				console.log(contract.c_rates)*/


				let fromCurrency = this.pairIdx.split('-')[0]
				let toCurrency = this.pairIdx.split('-')[1]

				if(fromCurrency > toCurrency) this.inverse = true

				/*let dx1 = 1000 * contract.coin_precisions[fromCurrency]
				let dy1 = 1000 * contract.coin_precisions[toCurrency]*/
				

				let asks = []
				let bids = []
				//console.log(poolConfig, "config", this.poolInfo)

				console.log(this.poolInfo, "POOL INFO")

				//let balanceSum = contract.bal_info[fromCurrency] + contract.bal_info[toCurrency]
				let balanceSum = 0;

				for(let [key, pool] of tradeStore.pools.entries()) {
					if(pool == 'y') pool = 'iearn'
					let cont = contract.contracts[pool]
					if(pool == contract.currentContract) cont = contract
					balanceSum += cont.bal_info[fromCurrency] + cont.bal_info[toCurrency]
				}

			 	let imax = Math.floor(100 * (1 + Math.log10(10) / Math.log10(balanceSum)))
				this.imax = imax

				console.log(balanceSum, "BALANCE SUM")

				let bxs = []
				let axs = []
				let ys = []

				for(let i = 0; i <= imax; i++) {
					let exp = Math.pow(balanceSum, i / 100)
					ys.push(exp)
					for(let j = 0; j < pools.length; j++) {
						let volume = i;
						console.log(pools[j])
						let dx1 = exp * abis[pools[j]].coin_precisions[fromCurrency]
						let dy1 = exp * abis[pools[j]].coin_precisions[toCurrency]
						console.log({...this.poolInfo[j], ...poolConfigs[j]})
						let dy = await calcWorker.calcPrice({...this.poolInfo[j], ...poolConfigs[j]}, fromCurrency, toCurrency, BN(dx1).toFixed(0), true)
						dy = +(BN(dy).div(abis[pools[j]].coin_precisions[toCurrency]))
						let dx = await calcWorker.calcPrice({...this.poolInfo[j], ...poolConfigs[j]}, toCurrency, fromCurrency, BN(dy1).toFixed(0), true)
						dx = +(BN(dx).div(abis[pools[j]].coin_precisions[fromCurrency]))
						/*let dy = +(calc.get_dy_underlying(fromCurrency, toCurrency, BN(dx1).toFixed(0), true)) / (contract.coin_precisions[toCurrency])
						let dx = +(calc.get_dy_underlying(toCurrency, fromCurrency, BN(dy1).toFixed(0), true)) / (contract.coin_precisions[fromCurrency])*/
						//console.log(+dy)
						let bidrate = dy / (dx1) * abis[pools[j]].coin_precisions[fromCurrency]
						let askrate = (dy1) / abis[pools[j]].coin_precisions[toCurrency] / dx

						//console.log(dy, dx)
						if(!bxs[j]) bxs[j] = []
						if(!axs[j]) axs[j] = []
						bxs[j].push(+bidrate)
						axs[j].push(+askrate)
					}
				}

				const bis = bxs.map(bx => interpolator(bx.map((x, i) => [x, ys[i]])))
				const ais = axs.map(ax => interpolator(ax.map((x,i) => [x, ys[i]])))

				console.log(bxs, axs, ys, "BXS AXS YS")
				for(let i = 0; i < bxs.length; i++) {
					for(let j = 0; j < bxs[0].length; j++) {

						console.log(bis.map(f => f(bxs[i][j])).reduce((a, b) => a + b, 0))
						console.log(ais.map(f => f(axs[i][j])).reduce((a, b) => a + b, 0))
						bids.push([
							+bxs[i][j],
							bis.map(f => f(bxs[i][j])).reduce((a, b) => a + b, 0) < 0 ? 0 : bis.map(f => f(bxs[i][j])).reduce((a, b) => a + b, 0)

						])
						asks.push([
							+axs[i][j],
							ais.map(f => f(axs[i][j])).reduce((a, b) => a + b, 0) < 0 ? 0 : ais.map(f => f(axs[i][j])).reduce((a, b) => a + b, 0)

						])
					}
				}

				bids.sort((a, b) => {
				  if(b[0] == a[0]) return b[1] - a[1]
				  else return b[0] - a[0]
				})
				asks.sort((a, b) => {
				  if(b[0] == a[0]) return a[1] - b[1]
				  else return a[0] - b[0]
				})

/*				bids = bids.filter(b => b[0] > 0.8)
				asks = asks.filter(b => b[0] < 1.2)*/

				console.log(bids, asks)

				this.chart.hideLoading()
			    this.$refs.highcharts.chart.addSeries({
		            name: 'Asks',
		            data: asks,
		            color: !this.inverse ? '#B70000' : '#007A00',
		        })
			    this.$refs.highcharts.chart.addSeries({
		            name: 'Bids',
		            data: bids,
		            color: !this.inverse ? '#007A00' : '#B70000',
		        })
				
			    //maybe not right - get from web3 when no this.poolInfo but this should be the same because calc is initialized with now
			    // - get from clicked point value otherwise

			    //currentValue without fees
				for(let [key, pool] of tradeStore.pools.entries()) {
					if(pool == 'y') pool = 'iearn'
					let cont = contract.contracts[pool]
					if(pool == contract.currentContract) cont = contract
		        	this.currentValue = +(BN(await calcWorker.calcPrice({...this.poolInfo[key], ...poolConfigs[key]}, fromCurrency, toCurrency, 
		        		BN(abis[pool].coin_precisions[fromCurrency]).toFixed(0))).div(BN(abis[pool].coin_precisions[toCurrency])))
				}
				this.currentValues /= tradeStore.pools.length
		    	console.log(this.chart)
		    	this.chart.xAxis[0].addPlotLine({
		    		id: 1,
		    		value: this.currentValue,
		    		label: {
		    			text: 'Actual price ' + this.currentValue.toFixed(4)
		    		}
		    	})
		    	/*this.chart.xAxis[0].options.plotLines[0].value = this.currentValue
		    	this.chart.xAxis[0].options.plotLines[0].label.text = 'Actual price ' + this.currentValue.toFixed(4)
		    	this.chart.xAxis[0].update()*/
		    	this.setZoom();
		        this.$refs.highcharts.chart.redraw()
            	this.bbrect = this.$refs.highcharts.$el.getBoundingClientRect();
            	this.bbrect._top = this.bbrect.top + window.scrollY;
            	this.chart.hideLoading();
			    this.loading = false;
			},
			move(event) {
				if(this.loading) return;
				let x = event.pageX;
	            let y = event.pageY;
	            x = x - this.bbrect.left;
	            y = y - this.bbrect._top;
	            
	            //console.log(this.chart.hoverPoint)
				if (this.chart.crossLabel) {
					// update label
					this.chart.crossLabel.attr({
						x: x - 15,
						text: this.chart.xAxis[0].toValue(x).toFixed(4)
					});

					this.chart.hoverPoint && this.chart.crossYLabelLeft.attr({
						y: this.chart.hoverPoint.plotY + this.chart.plotTop + 25,
						text: this.chart.yAxis[0].toValue(this.chart.hoverPoint.plotY + this.chart.plotTop).toFixed(4)
					});

					this.chart.hoverPoint && this.chart.crossYLabelRight.attr({
						y: this.chart.hoverPoint.plotY + this.chart.plotTop + 25,
						text: this.chart.yAxis[0].toValue(this.chart.hoverPoint.plotY + this.chart.plotTop).toFixed(4)
					});

					if(!document.querySelector('#depth_chart .highcharts-series.highcharts-series-1').classList.contains('highcharts-series-hover'))
						this.chart.crossYLabelLeft.attr('y', -9999)
					else
						this.chart.crossYLabelRight.attr('y', -9999)	
		        }
		        else {
		            // draw label
		            this.chart.crossLabel = this.chart.renderer.text(this.chart.xAxis[0].toValue(x).toFixed(4), x - 15, this.chart.plotTop - 5).add();
		            this.chart.crossYLabelLeft = this.chart.renderer.text(this.chart.yAxis[0].toValue(y).toFixed(4), this.chart.plotLeft - 5 , y - 5)
						.attr({
							rotation: -90
						})
						.add();
		            this.chart.crossYLabelRight = this.chart.renderer.text(this.chart.yAxis[0].toValue(y).toFixed(4), this.chart.plotLeft + this.chart.plotWidth + 15 , y )
						.attr({
							rotation: -90
						})
						.add();
		        }
	    	}
		}
	}
</script>

<style scoped>
	#zoomSelect {
		margin: 1em 0;
		max-width: 300px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}
	#zoomSelect label {
		flex: 0.5;
	}
	#zoomSelect input {
		flex: 1;
		display: inline-block;
	}
</style>