<template>
	<div class='bigdiv'>
		<div @mousemove = 'move' ref='chartcontainer'>
			<highcharts :options='depthchart' ref='highcharts' class='depthchart'></highcharts>
		</div>
	</div>
</template>

<script>
	import Highcharts from 'highcharts'
	console.log(Highcharts.PlotLineOrBand)
	Highcharts.PlotLineOrBand.prototype.update = function (newOptions){
        var plotBand = this;
        Highcharts.extend(plotBand.options, newOptions);
        if (plotBand.svgElem) {
            plotBand.svgElem.destroy();
            plotBand.svgElem = undefined;
            plotBand.render();
        }
    }


	import {Chart} from 'highcharts-vue'
	import EventBus from './EventBus'
	import stableswap_fns from '../../utils/stableswap_fns'
	import { contract, LENDING_PRECISION, PRECISION, changeContract } from '../../contract'
	import abis from '../../allabis'
	import BN from 'bignumber.js'

	export default {
		components: {
			highcharts: Chart,
		},
		data: () => ({
		loading: true,
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
	    			type: 'logarithmic',
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
		}),
		async created() {
			EventBus.$on('selected', this.selectPool)
			EventBus.$on('changeTime', this.changeTime)
			this.$watch(()=>contract.initializedContracts, async (val) => {
                if(val) {
                	await this.updatePoolInfo();
                	this.mounted();
                }
            })
		},
		mounted() {
			this.chart = this.$refs.highcharts.chart
		},
		beforeDestroy() {
			EventBus.$off('selected', this.selectPool)
			EventBus.$off('changeTime', this.changeTime)
		},
		methods: {
			async updatePoolInfo() {
				console.log("CONTRACT", contract.balances)
				this.poolInfo.A = await contract.swap.methods.A().call();
				this.poolInfo.fee = contract.fee
				this.poolInfo.admin_fee = contract.admin_fee
				this.poolInfo.supply = await contract.swap_token.methods.totalSupply().call()
				this.poolInfo.virtual_price = await contract.swap.methods.get_virtual_price().call()
				this.poolInfo.balances = contract.balances;
				this.poolInfo.rates = contract.c_rates.map((r,i)=>BN(r).times(PRECISION).times(contract.coin_precisions[i]))
				this.poolInfo.timestamp = (Date.now() / 1000) | 0;
			},

			async selectPool(pool, pair, interval) {
				this.pool = pool
				this.pair = pair
				this.interval = interval
				this.data = require(`../../jsons/${this.pool == 'iearn' ? 'y' : this.pool}-${this.interval}m.json`);
			},
			//we can go back in time! Time travelling!
			changeTime(index) {
				this.data = require(`../../jsons/${this.pool == 'iearn' ? 'y' : this.pool}-${this.interval}m.json`);
				this.poolInfo = this.data[index]

				this.mounted()
			},
			async mounted() {

				while(this.chart.series.length) {
					this.chart.series[0].remove()
				}


/*				if(contract.currentContract != this.pool) {
					await changeContract(this.pool)
					this.poolInfo = {}
				}*/

				let poolConfig = {
					N_COINS: abis[this.pool].N_COINS,
					PRECISION_MUL: abis[this.pool].coin_precisions.map(p=>1e18/p),
					USE_LENDING: abis[this.pool].USE_LENDING,
					LENDING_PRECISION,
					PRECISION,
				}

				/*console.log(contract.bal_info.map((b,i)=>b/contract.c_rates[i]))
				console.log(contract.c_rates)*/


				let fromCurrency = this.pair.idx.split('-')[0]
				let toCurrency = this.pair.idx.split('-')[1]

				let dx1 = 100 * contract.coin_precisions[fromCurrency]
				let dy1 = 100 * contract.coin_precisions[toCurrency]
				

				let asks = []
				let bids = []
				let calc = stableswap_fns({
					...this.poolInfo,
					...poolConfig,
				});

				for(let i = 1; i < 100; i++) {
					let volume = i;

					let dy = +(calc.get_dy_underlying(fromCurrency, toCurrency, BN(dx1).times(i).toFixed(0), true)) / (contract.coin_precisions[toCurrency])
					let dx = +(calc.get_dy_underlying(toCurrency, fromCurrency, BN(dy1).times(i).toFixed(0), true)) / (contract.coin_precisions[fromCurrency])
					//console.log(+dy)
					let bidrate = dy / (dx1 * i) * contract.coin_precisions[fromCurrency]
					let askrate = (dy1 * i) / contract.coin_precisions[toCurrency] / dx
					//console.log(+bidrate)
					//console.log(+askrate)
					bids.push([+bidrate, i])
					asks.push([+askrate, i])
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
		        let currentValue = +((calc.get_dy_underlying(fromCurrency, toCurrency, BN(contract.coin_precisions[fromCurrency]).toFixed(0), true))
	        														.div(BN(contract.coin_precisions[toCurrency])))
				this.$refs.highcharts.chart.series[0].xAxis.plotLinesAndBands[0]
							.update({
								value: currentValue,
								label: {
									text: 'Actual price ' + currentValue.toFixed(4)
								}
							})

		        this.$refs.highcharts.chart.redraw()
            	this.bbrect = this.$refs.highcharts.$el.getBoundingClientRect();
            	this.bbrect._top = this.bbrect.top + window.scrollY;
			    this.loading = false;
			},
			move(event) {
				if(!this.chart) return;
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

						if(document.querySelector('.highcharts-series.highcharts-series-0').getAttribute('opacity') == 1)
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

</style>