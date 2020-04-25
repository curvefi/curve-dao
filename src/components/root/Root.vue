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
	                    <span class='apr'><span class='tooltip'>APY:<span class='tooltiptext long'>Daily Pool APY + Lending APY (annualized)</span></span> <span :class="{'loading line': !apy[0]}">{{apy[0]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.compound < 0}">
	                    	<span v-show='volumes.compound >= 0'>{{(volumes.compound | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 1}">
	                <router-link to = '/usdt'>
	                	<span class='index'>1.</span>  
	                    <span class='pooltext'>USDT</span>
	                    <span class='pools'>[(c)DAI, (c)USDC, USDT]</span>  
	                    <span class='apr'><span class='tooltip'>APY:<span class='tooltiptext long'>Daily Pool APY + Lending APY (annualized)</span></span> <span :class="{'loading line': !apy[1]}">{{apy[1]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.usdt < 0}">
	                    	<span v-show='volumes.usdt >= 0'>{{(volumes.usdt | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 2}">
	                <router-link to = '/y'>
	                	<span class='index'>2.</span>  
	                    <span class='pooltext'>Y</span>
	                    <span class='pools'>[(y)DAI, (y)USDC, (y)USDT, (y)TUSD]</span>  
	                    <span class='apr'><span class='tooltip'>APY:<span class='tooltiptext long'>Daily Pool APY + Lending APY (annualized)</span></span> <span :class="{'loading line': !apy[2]}">{{apy[2]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.y < 0}">
	                    	<span v-show='volumes.y >= 0'>{{(volumes.y | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 3}">
	                <router-link to = '/busd'>
	                	<span class='index'>3.</span>  
	                    <span class='pooltext'>BUSD</span>
	                    <span class='pools'>[(y)DAI, (y)USDC, (y)USDT, (y)BUSD]</span>  
	                    <span class='apr'><span class='tooltip'>APY:<span class='tooltiptext long'>Daily Pool APY + Lending APY (annualized)</span></span> <span :class="{'loading line': !apy[3]}">{{apy[3]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.busd < 0}">
	                    	<span v-show='volumes.busd >= 0'>{{(volumes.busd | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	            <!-- <div :class="{selected: activePoolLink == 4}">
	                <router-link to = '/susd/withdraw'>
	                	<span class='index'>4.</span>  
	                    <span class='pooltext'>sUSD</span>
	                    <span class='pools'>[(y)sUSD, yCurve]</span>  
	                    <span class='apr'>APY: <span :class="{'loading line': !apy[4]}">{{apy[4]}}</span>%</span>
	                    <span class='volume'>
	                    	Vol: <span :class="{'loading line': volumesData.busd < 0}">
	                    	<span v-show='volumesData.busd >= 0'>{{(volumesData.busd | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div> -->
	            <div :class="{selected: activePoolLink == 4}">
	                <router-link to = '/susdv2'>
	                	<span class='index'>4.</span>  
	                    <span class='pooltext'>sUSD</span>
	                    <span class='pools'>[DAI, USDC, USDT, sUSD]</span>  
	                    <span class='apr'>
	                    	<span>
	                    		<span class='tooltip'>APY:<span class='tooltiptext long'>Daily Pool APY + Lending APY (annualized)</span></span> <span :class="{'loading line': !apy[4]}">{{apy[4]}}</span>
	                    		<span :class="{'loading line': snxRewards === null}">% (+{{snxRewards | toFixed2}}%
	                    			<span class='tooltip'>SNX
		                                <span class='tooltiptext'>
		                                    SNX LP reward annualized
		                                </span>
		                            </span>)
	                    		</span>
	                    	</span>
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.susd < 0}">
	                    	<span v-show='volumes.susd >= 0'>{{(volumes.susd | 0) | formatNumber}}$</span>
               	 		</span></span>
	                </router-link>
	            </div>
	        </fieldset>
	    </div>

	    <total-balances :total-volume='totalVolume'/>

	</div>
</template>

<script>
	import TotalBalances from './TotalBalances.vue'
	import BasicTrade from '../graphs/BasicTrade.vue'
	import allabis, { ERC20_abi, sCurveRewards_abi, sCurveRewards_address } from '../../allabis'
	import * as volumeStore from '@/components/common/volumeStore'

	import * as helpers from '../../utils/helpers'

	import { contract } from '../../contract'

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
			volumes: [],
			snxRewards: null,
		}),
		created() {
			var start = new Date();
			start.setHours(0,0,0,0);
			this.start = start.getTime() / 1000

			var end = new Date();
			end.setHours(23,59,59,999);
			this.end = end.getTime() / 1000
			this.$watch(() => contract.web3 && contract.multicall, val => {
				if(!val) return;
				this.getCurveRewards()
			})
		},
		mounted() {
			this.keydownListener = document.addEventListener('keydown', this.handle_pool_change)
			contract.web3 && contract.multicall && this.getCurveRewards();
	        this.getAPY()
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.handle_pool_change);
		},
		computed: {
			totalVolume() {
				return Object.values(this.volumes).reduce((a, b) => a + b, 0)
			},
		},
		methods: {
			async getCurveRewards() {
				console.log(contract.web3, "WEB333")
				let curveRewards = new contract.web3.eth.Contract(sCurveRewards_abi, sCurveRewards_address)
				let sCurve = new contract.web3.eth.Contract(allabis.susdv2.swap_abi, allabis.susdv2.swap_address)
				let calls = [
					[curveRewards._address, curveRewards.methods.totalSupply().encodeABI()],
					[sCurve._address, sCurve.methods.get_virtual_price().encodeABI()],
				]
				let aggcalls = await contract.multicall.methods.aggregate(calls).call();
				let decoded = aggcalls[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
				let request = await fetch('https://api.coinpaprika.com/v1/tickers/hav-havven')
				let snxPrice = await request.json();
				snxPrice = snxPrice.quotes.USD.price;
				this.snxRewards = 365 * 64000/7*snxPrice/((+decoded[0]) * (+decoded[1])/1e36) * 100
			},
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
				let pools = ['compound', 'usdt', 'y', 'busd', 'susd']
	            let stats = await fetch(`https://beta.curve.fi/raw-stats/apys.json`)
	            stats = await stats.json()
                this.volumes = stats.volume;
                volumeStore.state.volumes = stats.volume
	            for(let [i, pool] of pools.entries()) {
	                var daily_apy = stats.apy.day[pool];
	                this.apy.push((daily_apy*100).toFixed(2))
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
		flex: 0.5;
	}
	.pools {
		flex: 1.8;
	}
	.apr {
		flex: 0.8;
	}
	.volume {
		flex: 0.7;
	}
</style>