<template>
	<div>

	    <basic-trade />

		<div class="window white">
	        <fieldset class='poolsdialog'>
	            <legend>Curve pools</legend>
	            <div :class="{selected: activePoolLink == 0}">
	                <router-link to = '/compound'>
	                	<span class='index'>0.</span>  
	                    <span class='pooltext'>Compound</span> 
	                    <span class='pools'>[(c)DAI, (c)USDC]</span>  
	                    <span class='apr'>APY: <span :class="{'loading line': !apy[0]}">{{apy[0]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumesData.compound < 0}">
	                    	<span v-show='volumesData.compound >= 0'>{{(volumesData.compound | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 1}">
	                <router-link to = '/usdt'>
	                	<span class='index'>1.</span>  
	                    <span class='pooltext'>USDT</span>
	                    <span class='pools'>[(c)DAI, (c)USDC, USDT]</span>  
	                    <span class='apr'>APY: <span :class="{'loading line': !apy[1]}">{{apy[1]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumesData.usdt < 0}">
	                    	<span v-show='volumesData.usdt >= 0'>{{(volumesData.usdt | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 2}">
	                <router-link to = '/y'>
	                	<span class='index'>2.</span>  
	                    <span class='pooltext'>Y</span>
	                    <span class='pools'>[(y)DAI, (y)USDC, (y)USDT, (y)TUSD]</span>  
	                    <span class='apr'>APY: <span :class="{'loading line': !apy[2]}">{{apy[2]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumesData.iearn < 0}">
	                    	<span v-show='volumesData.iearn >= 0'>{{(volumesData.iearn | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 3}">
	                <router-link to = '/busd'>
	                	<span class='index'>3.</span>  
	                    <span class='pooltext'>BUSD</span>
	                    <span class='pools'>[(y)DAI, (y)USDC, (y)USDT, (y)BUSD]</span>  
	                    <span class='apr'>APY: <span :class="{'loading line': !apy[3]}">{{apy[3]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumesData.busd < 0}">
	                    	<span v-show='volumesData.busd >= 0'>{{(volumesData.busd | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 4}">
	                <a href = 'https://iearn.finance/pool'>
	                	<span class='index'>4.</span>  
	                    <span class='pooltext'>sUSD</span>
	                    <span class='pools'>[(y)sUSD, yCurve]</span>  
	                    <span class='apr'>APY: <span :class="{'loading line': !apy[4]}">{{apy[4]}}</span>%</span>
	                    <span class='volume'>
	                    	<!-- Vol: <span :class="{'loading line': volumesData.busd < 0}">
	                    	<span v-show='volumesData.busd >= 0'>{{(volumesData.busd | 0) | formatNumber}}$</span> -->
               	 		</span></span>
	                </a>
	            </div>
	        </fieldset>
	    </div>

	    <total-balances />

	</div>
</template>

<script>
	import TotalBalances from './TotalBalances.vue'
	import BasicTrade from '../graphs/BasicTrade.vue'
	import abis from '../../allabis'
	import * as volumeStore from '@/components/common/volumeStore'

	import * as helpers from '../../utils/helpers'

	export default {
		components: {
			TotalBalances,
			BasicTrade,
		},
		data: () => ({
			activePoolLink: 0,
			pools: ['compound','usdt','y','busd'],
			apy: [],
			start: 0,
			end: 0,
		}),
		created() {
			var start = new Date();
			start.setHours(0,0,0,0);
			this.start = start.getTime() / 1000

			var end = new Date();
			end.setHours(23,59,59,999);
			this.end = end.getTime() / 1000
		},
		mounted() {
			this.keydownListener = document.addEventListener('keydown', this.handle_pool_change)
	        this.getAPY()
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.handle_pool_change);
		},
		computed: {
			totalVolume() {
				return volumeStore.totalVolume();
			},
			volumesData() {
				return volumeStore.state.volumes;
			}
		},
		methods: {
			handle_pool_change(e) {
				if(document.querySelector('#from_currency') == document.activeElement) return;
	            if(e.code == 'ArrowUp' && this.activePoolLink != 0) {
	                e.preventDefault();
	                this.activePoolLink--;
	            }
	            if(e.code == 'ArrowDown' && this.activePoolLink < 4) {
	                e.preventDefault();
	                this.activePoolLink++;
	            }
	            if(e.code.includes('Digit')) {
	                e.preventDefault();
	                var digit = e.code.slice(-1);
	                if(digit > 4) return;
	                this.activePoolLink = digit
	            }
	            if(e.code == 'Enter') {
	                e.preventDefault();
	                this.$router.push('/'+pools[this.activePoolLink])
	            }
			},
			async getAPY() {
	            var urls = ['https://compound.curve.fi', 'https://usdt.curve.fi', 'https://y.curve.fi', 'https://busd.curve.fi', 'https://synthetix.curve.fi']       
	            let stats = await Promise.all(urls.map(url=>fetch(url+'/stats.json')))
	            stats = await Promise.all(stats.map(stat=>stat.json()))
	            for(let i = 0; i < stats.length; i++) {
	                var weekly_apr = stats[i]['daily_apr'];
	                this.apy.push((weekly_apr*100).toFixed(2))
	            }
			}
		}
	}
</script>

<style scoped>
	@media only screen and (min-device-width : 320px) and (max-device-width : 730px) {
		.poolsdialog.poolsdialog > div a {
			display: block;
		  text-align: center;
		}
		.poolsdialog.poolsdialog > div a > span {
			display: block;
			text-align: center;
		}
		.poolsdialog.poolsdialog > div span.pooltext, .poolsdialog.poolsdialog > div span.index {
			display: inline;
		}
		.pools {
		  width: 100%;
		}
	}
	.poolsdialog > div a {
		display: flex;
		justify-content: space-between;
	}
	.poolsdialog > div a span {
		text-align: left;
	}
	.index {
		flex: 0.1;
	}
	.pooltext {
		flex: 0.6;
	}
	.pools {
		flex: 2.2;
	}
	.apr {
		flex: 0.8;
	}
	.volume {
		flex: 1;
	}
</style>