<template>
	<div class='bigdiv'>
		<div id='zoomSelect'>
			<label for='zoom'>Zoom {{zoom}}%</label>
			<input type='range' min='0' max='140' id='zoom' v-model='zoom'/>
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

	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})


	import {Chart} from 'highcharts-vue'
	import EventBus from './EventBus'
	import tradeStore from './tradeStore'
	import stableswap_fns from '../../utils/stableswap_fns'
	import { contract, LENDING_PRECISION, PRECISION, changeContract } from '../../contract'
	import abis from '../../allabis'
	import BN from 'bignumber.js'

	import * as Comlink from 'comlink'

	const worker = new Worker('worker.js');
	const calcWorker = Comlink.wrap(worker);

	export default {
		components: {
			highcharts: Chart,
		},
		data: () => ({
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
		  	poolInfo: {},
		  	interval: 5,
	    	bbrect: null,
	    	data: [],
	    	currentValue: 1,
	    	imax: 100,
	    	inverse: false,
		}),
		async created() {
			//EventBus.$on('selected', this.selectPool)
			EventBus.$on('changeTime', this.changeTime)
			this.$watch(()=>contract.initializedContracts, async (val) => {
                if(val) {
                	this.chart.showLoading()
                	await this.updatePoolInfo();
                	this.mounted();
                }
            })
		},
		watch:{
			selectChange(val, oldval) {
				//don't call mount when pools are changed, it's called when contacts are re-initialized
				if(val[1] == oldval[1]) this.mounted()
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
		mounted() {
			this.chart = this.$refs.highcharts.chart
			this.chart.showLoading();
		},
		beforeDestroy() {
			//EventBus.$off('selected', this.selectPool)
			EventBus.$off('changeTime', this.changeTime)
		},
		computed: {
			selectChange() {
				return [tradeStore.pairIdx, tradeStore.pool, tradeStore.interval]
			}
		},
		methods: {
			setZoom() {
				let ind1 = 1;
				let ind2 = 0;
				if(this.inverse) {
					ind1 = 0;
					ind2 = 1;
				}
				let min_price = Math.min(this.chart.series[ind1].xData[0], this.chart.series[ind1].xData[100-1])
				let max_price = Math.max(this.chart.series[ind2].xData[0], this.chart.series[ind2].xData[100-1])
				let p = (this.chart.series[0].xData[0] + this.chart.series[1].xData[0]) / 2
				let priceLeft = Math.max(min_price, p - (max_price - p))
				let priceRight = Math.min(max_price, p + (p - min_price))

				//console.log(min_price, max_price, p, priceLeft, priceRight, "prices")

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
				this.poolInfo.A = await contract.swap.methods.A().call();
				this.poolInfo.fee = contract.fee * 1e10
				this.poolInfo.admin_fee = contract.admin_fee * 1e10
				this.poolInfo.supply = await contract.swap_token.methods.totalSupply().call()
				this.poolInfo.virtual_price = await contract.swap.methods.get_virtual_price().call()
				this.poolInfo.balances = contract.balances;
				this.poolInfo.rates = contract.c_rates.map((r,i)=>+(BN(r).times(PRECISION).times(contract.coin_precisions[i])))
				this.poolInfo.timestamp = (Date.now() / 1000) | 0;
			},

			//we can go back in time! Time travelling!
			changeTime(poolInfo) {
				this.poolInfo = poolInfo

				this.mounted()
			},
			async mounted() {
				this.chart.showLoading()
				this.pool = tradeStore.pool
				this.pairIdx = tradeStore.pairIdx
				this.pairVal = tradeStore.pairVal
				this.interval = tradeStore.interval

				//return;
				this.loading = true;

				while(this.chart.series.length) {
					this.chart.series[0].remove()
				}

/*				if(contract.currentContract != this.pool) {
					await changeContract(this.pool)
					this.poolInfo = {}
				}*/

				let poolConfig = {
					N_COINS: abis[tradeStore.pool].N_COINS,
					PRECISION_MUL: abis[tradeStore.pool].coin_precisions.map(p=>1e18/p),
					USE_LENDING: abis[tradeStore.pool].USE_LENDING,
					LENDING_PRECISION,
					PRECISION,
				}

				/*console.log(contract.bal_info.map((b,i)=>b/contract.c_rates[i]))
				console.log(contract.c_rates)*/


				let fromCurrency = this.pairIdx.split('-')[0]
				let toCurrency = this.pairIdx.split('-')[1]
				if(fromCurrency > toCurrency) {
					this.inverse = true;
					[fromCurrency, toCurrency] = [toCurrency, fromCurrency]
					this.pairIdx = `${fromCurrency}-${toCurrency}`
				}
				else {
					this.inverse = false;
				}

				/*let dx1 = 1000 * contract.coin_precisions[fromCurrency]
				let dy1 = 1000 * contract.coin_precisions[toCurrency]*/
				

				let asks = []
				let bids = []
				let calc = stableswap_fns({
					...this.poolInfo,
					...poolConfig,
				});

				//console.log(poolConfig, "config", this.poolInfo)

				let balanceSum = contract.bal_info[fromCurrency] + contract.bal_info[toCurrency]
				let imax = Math.floor(100 * (1 + Math.log10(10) / Math.log10(balanceSum)))
				this.imax = imax
				for(let i = 1; i <= imax; i++) {
					let volume = i;
					let exp = Math.pow(balanceSum, i / 100)
					let dx1 = exp * contract.coin_precisions[fromCurrency]
					let dy1 = exp * contract.coin_precisions[toCurrency]
					let dy = await calcWorker.calcPrice({...this.poolInfo, ...poolConfig}, fromCurrency, toCurrency, BN(dx1).toFixed(0), true)
					dy = +(BN(dy).div(contract.coin_precisions[toCurrency]))
					let dx = await calcWorker.calcPrice({...this.poolInfo, ...poolConfig}, toCurrency, fromCurrency, BN(dy1).toFixed(0), true)
					dx = +(BN(dx).div(contract.coin_precisions[fromCurrency]))
					/*let dy = +(calc.get_dy_underlying(fromCurrency, toCurrency, BN(dx1).toFixed(0), true)) / (contract.coin_precisions[toCurrency])
					let dx = +(calc.get_dy_underlying(toCurrency, fromCurrency, BN(dy1).toFixed(0), true)) / (contract.coin_precisions[fromCurrency])*/
					//console.log(+dy)
					let bidrate = dy / (dx1) * contract.coin_precisions[fromCurrency]
					let askrate = (dy1) / contract.coin_precisions[toCurrency] / dx
					if(this.inverse) {
						bidrate = 1/bidrate;
						askrate = 1/askrate;
					}
					//console.log(dy, dx)
					bids.push([+bidrate, exp])
					asks.push([+askrate, exp])
				}
				//console.log(asks, bids)
			    this.$refs.highcharts.chart.addSeries({
		            name: 'Asks',
		            data: asks,
		            color: '#B70000',
		        })
			    this.$refs.highcharts.chart.addSeries({
		            name: 'Bids',
		            data: bids,
		            color: '#007A00',
		        })

			    //maybe not right - get from web3 when no this.poolInfo but this should be the same because calc is initialized with now
			    // - get from clicked point value otherwise

			    //currentValue without fees
		        this.currentValue = +((calc.get_dy_underlying(fromCurrency, toCurrency, BN(contract.coin_precisions[fromCurrency]).toFixed(0)))
	        														.div(BN(contract.coin_precisions[toCurrency])))
		        if(this.inverse) this.currentValue = 1 / this.currentValue
		    	console.log(this.chart)
		    	this.chart.xAxis[0].options.plotLines[0].value = this.currentValue
		    	this.chart.xAxis[0].options.plotLines[0].label.text = 'Actual price ' + this.currentValue.toFixed(4)
		    	this.chart.xAxis[0].update()
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
	            var path = ['M', this.chart.plotLeft, y,
	                'L', this.chart.plotLeft + this.chart.plotWidth, y,
	                'M', x, this.chart.plotTop,
	                'L', x, this.chart.plotTop + this.chart.plotHeight];
	            var isOnPlot = function(x, y, chart) {
	            		return (
	                	x > chart.plotLeft &&
	                  x < chart.plotLeft + chart.plotWidth &&
	                  y > chart.plotTop &&
	                  y < chart.plotTop + chart.plotHeight
	                ) ? true : false
	            }
	            //console.log(this.chart.hoverPoint)
				if (this.chart.crossLabel) {
		    		if(isOnPlot(x, y, this.chart)) {
						// update label
						this.chart.crossLabel.attr({
							x: x - 15,
							text: this.chart.xAxis[0].toValue(x).toFixed(4)
						});

						this.chart.hoverPoint && this.chart.crossYLabelLeft.attr({
							y: this.chart.hoverPoint.plotY + this.chart.plotTop,
							text: this.chart.yAxis[0].toValue(this.chart.hoverPoint.plotY + this.chart.plotTop).toFixed(4)
						});

						this.chart.hoverPoint && this.chart.crossYLabelRight.attr({
							y: this.chart.hoverPoint.plotY + this.chart.plotTop,
							text: this.chart.yAxis[0].toValue(this.chart.hoverPoint.plotY + this.chart.plotTop).toFixed(4)
						});

						if(!document.querySelector('#depth_chart .highcharts-series.highcharts-series-1').classList.contains('highcharts-series-hover'))
							this.chart.crossYLabelLeft.attr('y', -9999)
						else
							this.chart.crossYLabelRight.attr('y', -9999)
						

					} 
					else {
						this.chart.crossLabel.attr('x', -9999)
						this.chart.crossYLabelLeft.attr('y', -9999)
						this.chart.crossYLabelRight.attr('y', -9999)
					}
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
		width: 300px;
		display: flex;
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