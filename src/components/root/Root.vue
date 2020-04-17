<template>
	<div>
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

	    <div class="window white">
	        <h2>Curve FAQ</h2>
	        <h3>What is Curve?</h3>
	        <a href='https://www.curve.fi/stableswap-paper.pdf'>Whitepaper</a>
	        <p>Curve is an exchange liquidity pool on Ethereum (like <a
	         href="https://uniswap.exchange/">Uniswap</a>)
	        designed for (1) extremely efficient stablecoin trading (2) low
	        risk, supplemental fee income for liquidity providers, without an
	        opportunity cost.</p>

	        <p>Curve allows users (and smart contracts like
	        <a href="http://1inch.exchange/">1inch</a>,
	        <a href="https://paraswap.io/">Paraswap</a>, <a href="https://swap.totle.com/">Totle</a> and <a href="https://dex.ag/">Dex.ag</a>)
	        to trade between DAI and USDC with a bespoke low slippage, low fee algorithm
	        designed specifically for stablecoins and earn fees. Behind the scenes, the
	        liquidity pool is also supplied to the <a href="https://compound.finance/">Compound</a> protocol
	        or <a href="https://iearn.finance/">iearn.finance</a>
	        where it generates even more income for liquidity providers.</p>

	        <h3>Has Curve been audited?</h3>
	        <p>Curve smart contracts were <a href="https://www.curve.fi/audits/01-ToB.pdf">Audited</a> by
	        Trail of Bits.</p>
	        <p>However, security audits don't eliminate risks completely.
	        Please don’t supply your life savings, or assets you
	        can’t afford to lose, to Curve, especially as a liquidity
	        provider.</p>

	        <p>Using Curve as an exchange user should be significantly less
	        risky, but this is not advice.</p>

	        <h3>How do I trade on Curve?</h3>
	        <p>Before trading, you’ll have to approve Curve to interact with
	        your stablecoin balance, similar to most DeFi applications.</p>

	        <p>On the exchange page, select the asset you would like to convert (e.g.
	        USDC), and the quantity (e.g. 1,000) - the exchange rate, and
	        quantity that you will receive (including and all slippage and fees)
	        will be displayed. The exchange rate might surprise you - that’s the
	        power of Curve.</p>

	        <h3>Source code git</h3>
	        <p>
      			<a href="https://github.com/curvefi/curve-contract">Smart contracts</a>
	        </p>
	        <p>
 			 	<a href="https://github.com/pengiundev/curve-vue">Frontend</a>
 			</p>

	        <h3>How do I provide liquidity to Curve?</h3>

	        <p>Curve uses <a href="https://compound.finance/ctokens">cTokens</a>,
	        or <a href="https://docs.iearn.finance/curve">Ytokens</a>
	        assets for lending while market making, as the
	        liquidity pool - this ensures that assets are always being put to
	        work. You will need to acquire cTokens or YTokens if you want to
	        provide liquidity (you can read the instuctions in each pool's FAQ).</p>

	        <h3>What's "Use maximum amount of coins available"?</h3>
	        <p>This means using all USDC and DAI in your wallet. This way is
	        recommended only if you have much less coins than currently in
	        liquidity pool.</p>

	        <h3>What's "Infinite approval - trust this contract forever"?</h3>
	        <p>This means that you preapprove the contract to to be able to spend any amount of your coins when you interact with it.
	        This means that you won't be asked every time to appove the amount of coins you want to transfer to the contract.
	        </p>

	        <h3>How to withdraw liquidity I provided?</h3>
	        <p>Go to the withdraw page. If you want
	        to withdraw some percentage of your liquidity (the preferred way),
	        type that percentage in the top field.
	        You can, however, withdraw in a form of individual coins (USDC,
	        DAI, ...), having the exchange happening for you, if you type amounts in
	        lower fields. You'll get charge with the exchange fee in the latter
	        case.</p>
	    </div>
	</div>
</template>

<script>
	import TotalBalances from './TotalBalances.vue'
	import abis from '../../allabis'
	import * as volumeStore from '@/components/common/volumeStore'

	import * as helpers from '../../utils/helpers'

	export default {
		components: {
			TotalBalances
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