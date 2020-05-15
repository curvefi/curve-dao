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
	                    <span class='apr'>
	                    	<span class='tooltip'>APY:
		                    	<span class='tooltiptext long'>
		                    		<div>Pool APY + Lending APY (annualized)</div>
		                    		<div>Daily APY: {{daily_apy[0]}}%</div>
		                    		<div>Weekly APY: {{weekly_apy[0]}}%</div>
		                    		<div>Monthly APY: {{monthly_apy[0]}}%</div>
		                    		<div>Total APY: {{apy[0]}}%</div>
		                    	</span>
		                    </span>
                    	<span :class="{'loading line': !daily_apy[0]}">{{daily_apy[0]}}</span>%</span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.compound < 0}">
	                    	<span v-show='volumes.compound >= 0'>${{(volumes.compound | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[0]'>Balance: ${{balances[0] && balances[0].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[0]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[0] && balances[0].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div>
	            <!-- <div :class="{selected: activePoolLink == 1}">
	                <router-link to = '/usdt'>
	                	<span class='index'>1.</span>  
	                    <span class='pooltext'>USDT</span>
	                    <span class='pools'>[(c)DAI, (c)USDC, USDT]</span>  
	                    <span class='apr'>
	                    	<span class='tooltip'>APY:
	                    		<span class='tooltiptext long'>
		                    		<div>Pool APY + Lending APY (annualized)</div>
		                    		<div>Daily APY: {{daily_apy[1]}}%</div>
		                    		<div>Weekly APY: {{weekly_apy[1]}}%</div>
		                    		<div>Monthly APY: {{monthly_apy[1]}}%</div>
		                    		<div>Total APY: {{apy[1]}}%</div>
		                    	</span>
	                    	</span> 
	                    	<span :class="{'loading line': !daily_apy[1]}">{{daily_apy[1]}}</span>%
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.usdt < 0}">
	                    	<span v-show='volumes.usdt >= 0'>${{(volumes.usdt | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[1]'>Balance: ${{balances[1] && balances[1].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[1]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[1] && balances[1].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div> -->
	            <div :class="{selected: activePoolLink == 1}">
	                <router-link to = '/pax'>
	                	<span class='index'>1.</span>  
	                    <span class='pooltext'>PAX</span>
	                    <span class='pools'>
	                    	[<span class='tooltip'>(yc)DAI
								<span class='tooltiptext long'>
								<router-link to='/yctokens'>ycTokens</router-link> are forked yTokens without owner and Compound lending available for ycUSDT
							</span>
							 </span>,
                    		 <span class='tooltip'>(yc)USDC
                    		 	<span class='tooltiptext long'>
                    		 	<router-link to='/yctokens'>ycTokens</router-link> are forked yTokens without owner and Compound lending available for ycUSDT
                    		 </span>
                    		 </span>,
                    		 <span class='tooltip'>(yc)USDT
                    		 	<span class='tooltiptext long'>
                    		 	<router-link to='/yctokens'>ycTokens</router-link> are forked yTokens without owner and Compound lending available for ycUSDT
                    		 </span>
                    		 </span>, 
                    		 PAX]
	                	</span>  
	                    <span class='apr'>
	                    	<span class='tooltip'>APY:
	                    		<span class='tooltiptext long'>
		                    		<div>Pool APY + Lending APY (annualized)</div>
		                    		<div>Daily APY: {{daily_apy[5]}}%</div>
		                    		<div>Weekly APY: {{weekly_apy[5]}}%</div>
		                    		<div>Monthly APY: {{monthly_apy[5]}}%</div>
		                    		<div>Total APY: {{apy[5]}}%</div>
		                    	</span>
	                    	</span> 
	                    	<span :class="{'loading line': !daily_apy[5]}">{{daily_apy[5]}}</span>%
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.pax < 0}">
	                    	<span v-show='volumes.pax >= 0'>${{(volumes.pax | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[5]'>Balance: ${{balances[5] && balances[5].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[5]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[5] && balances[5].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 2}">
	                <router-link to = '/y'>
	                	<span class='index'>2.</span>  
	                    <span class='pooltext'>Y</span>
	                    <span class='pools'>[(y)DAI, (y)USDC, (y)USDT, (y)TUSD]</span>  
	                    <span class='apr'>
	                    	<span class='tooltip'>APY:
	                    		<span class='tooltiptext long'>
		                    		<div>Pool APY + Lending APY (annualized)</div>
		                    		<div>Daily APY: {{daily_apy[2]}}%</div>
		                    		<div>Weekly APY: {{weekly_apy[2]}}%</div>
		                    		<div>Monthly APY: {{monthly_apy[2]}}%</div>
		                    		<div>Total APY: {{apy[2]}}%</div>
		                    	</span>
	                    	</span> 
	                    	<span :class="{'loading line': !daily_apy[2]}">{{daily_apy[2]}}</span>%
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.y < 0}">
	                    	<span v-show='volumes.y >= 0'>${{(volumes.y | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[2]'>Balance: ${{balances[2] && balances[2].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[2]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[2] && balances[2].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 3}">
	                <router-link to = '/busd'>
	                	<span class='index'>3.</span>  
	                    <span class='pooltext'>BUSD</span>
	                    <span class='pools'>[(y)DAI, (y)USDC, (y)USDT, (y)BUSD]</span>  
	                    <span class='apr'>
	                    	<span class='tooltip'>APY:
	                    		<span class='tooltiptext long'>
		                    		<div>Pool APY + Lending APY (annualized)</div>
		                    		<div>Daily APY: {{daily_apy[3]}}%</div>
		                    		<div>Weekly APY: {{weekly_apy[3]}}%</div>
		                    		<div>Monthly APY: {{monthly_apy[3]}}%</div>
		                    		<div>Total APY: {{apy[3]}}%</div>
		                    	</span>
	                    	</span> 
	                    	<span :class="{'loading line': !daily_apy[3]}">{{daily_apy[3]}}</span>%
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.busd < 0}">
	                    	<span v-show='volumes.busd >= 0'>${{(volumes.busd | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[3]'>Balance: ${{balances[3] && balances[3].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[3]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[3] && balances[3].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div>
	            <!-- <div :class="{selected: activePoolLink == 4}">
	                <router-link to = '/susd/withdraw'>
	                	<span class='index'>4.</span>  
	                    <span class='pooltext'>sUSD</span>
	                    <span class='pools'>[(y)sUSD, yCurve]</span>  
	                    <span class='apr'>APY: <span :class="{'loading line': !daily_apy[4]}">{{daily_apy[4]}}</span>%</span>
	                    <span class='volume'>
	                    	Vol: <span :class="{'loading line': volumesData.busd < 0}">
	                    	<span v-show='volumesData.busd >= 0'>${{(volumesData.busd | 0) | formatNumber}}</span>
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
	                    		<span class='tooltip'>APY:
	                    			<span class='tooltiptext long'>
			                    		<div>Pool APY + Lending APY (annualized)</div>
			                    		<div>Daily APY: {{daily_apy[4]}}%</div>
			                    		<div>Weekly APY: {{weekly_apy[4]}}%</div>
			                    		<div>Monthly APY: {{+monthly_apy[4] == 0 ? 'N/A' : monthly_apy[4]}}%</div>
			                    		<div>Total APY: {{apy[4]}}%</div>
			                    	</span>
	                    		</span> 
	                    		<span :class="{'loading line': !daily_apy[4]}">{{daily_apy[4]}}</span>
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
	                    	<span v-show='volumes.susd >= 0'>${{(volumes.susd | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[4]'>Balance: ${{balances[4] && balances[4].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[4]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[4] && balances[4].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div>
	            <!-- <div :class="{selected: activePoolLink == 5}">
	                <router-link to = '/tbtc'>
	                	<span class='index'>5.</span>  
	                    <span class='pooltext'>tBTC</span>
	                    <span class='pools'>[tBTC, hBTC, wBTC]</span>  
	                    <span class='apr'>
	                    	<span class='tooltip'>APY:
	                    		<span class='tooltiptext long'>
		                    		<div>Pool APY + Lending APY (annualized)</div>
		                    		<div>Daily APY: {{daily_apy[6]}}%</div>
		                    		<div>Weekly APY: {{weekly_apy[6]}}%</div>
		                    		<div>Monthly APY: {{monthly_apy[6]}}%</div>
		                    		<div>Total APY: {{apy[6]}}%</div>
		                    	</span>
	                    	</span> 
	                    	<span :class="{'loading line': !daily_apy[6]}">{{daily_apy[6]}}</span>%
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.tbtc < 0}">
	                    	<span v-show='volumes.tbtc >= 0'>${{(volumes.tbtc | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[6]'>Balance: ${{balances[6] && balances[6].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[6]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[6] && balances[6].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div>
	            <div :class="{selected: activePoolLink == 6}">
	                <router-link to = '/ren'>
	                	<span class='index'>5.</span>  
	                    <span class='pooltext'>ren</span>
	                    <span class='pools'>[renBTC, wBTC]</span>  
	                    <span class='apr'>
	                    	<span class='tooltip'>APY:
	                    		<span class='tooltiptext long'>
		                    		<div>Pool APY + Lending APY (annualized)</div>
		                    		<div>Daily APY: {{daily_apy[7]}}%</div>
		                    		<div>Weekly APY: {{weekly_apy[7]}}%</div>
		                    		<div>Monthly APY: {{monthly_apy[7]}}%</div>
		                    		<div>Total APY: {{apy[7]}}%</div>
		                    	</span>
	                    	</span> 
	                    	<span :class="{'loading line': !daily_apy[7]}">{{daily_apy[7]}}</span>%
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.ren < 0}">
	                    	<span v-show='volumes.ren >= 0'>${{(volumes.ren | 0) | formatNumber}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances[7]'>Balance: ${{balances[7] && balances[7].toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances[7]'>
               	 				<img src='../../assets/dollar-sign-solid.svg'>
               	 				<span class='tooltiptext'>Balance: ${{balances[7] && balances[7].toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div> -->
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
			activePoolLink: -1,
			pools: ['compound','usdt','y','busd','susdv2','pax','tbtc','ren'],
			daily_apy: [],
			weekly_apy: [],
			monthly_apy: [],
			apy: [],
			start: 0,
			end: 0,
			volumes: [],
			balances: [],
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
				this.getBalances()
			})
		},
		mounted() {
			this.keydownListener = document.addEventListener('keydown', this.handle_pool_change)
			contract.web3 && contract.multicall && this.getCurveRewards() && this.getBalances();
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
			async getBalances() {
				if(!contract.default_account) return;
				contract.contracts.compound = contract;
				let calls = Object.entries(contract.contracts).flatMap(([k, v]) => {
					if(['tbtc', 'ren', 'renbtc'].includes(k)) return []
					return [
						//balanceOf(address)
						[allabis[k].token_address, '0x70a08231000000000000000000000000' + contract.default_account.slice(2)],
						//get_virtual_price
						[allabis[k].swap_address, "0xbb7b8b80"]
					]})
				calls.push([sCurveRewards_address, '0x70a08231000000000000000000000000' + contract.default_account.slice(2)])
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				this.balances = []
				helpers.chunkArr(decoded, 2).slice(0,6).map(v => {
					this.balances.push(+v[0] * (+v[1]) / 1e36);
				})
				this.balances[4] += (+decoded[10] * decoded[9]) / 1e36
			},
			handle_pool_change(e) {
				if(document.querySelector('#from_currency') == document.activeElement 
					|| document.querySelector('#custom_slippage_input') == document.activeElement) return;
				if(this.activePoolLink == -1) return this.activePoolLink = 0
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
				let pools = ['compound', 'usdt', 'y', 'busd', 'susd', 'pax', 'tbtc','ren']
	            let stats = await fetch(`${window.domain}/raw-stats/apys.json`)
	            stats = await stats.json()
                this.volumes = stats.volume;
                volumeStore.state.volumes = stats.volume
	            for(let [i, pool] of pools.entries()) {
	                var daily_apy = stats.apy.day[pool];
	                var weekly_apy = stats.apy.week[pool];
	                var monthly_apy = stats.apy.month[pool];
	                var apy = stats.apy.total[pool];
	                this.daily_apy.push((daily_apy*100).toFixed(2))
	                this.weekly_apy.push((weekly_apy*100).toFixed(2))
	                this.monthly_apy.push((monthly_apy*100).toFixed(2))
	                this.apy.push((apy*100).toFixed(2))
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
		.poolsdialog .balance {
			width: 100%;
		}
		.poolsdialog .balance .showmobile {
			display: block;
			text-align: center;
		}
		.poolsdialog .balance .tooltip {
			display: none;
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
	.poolsdialog > div > a:hover .tooltip {
 		border-bottom: 1px dotted white;
	}
	.poolsdialog > div > a:hover img {
		filter: invert(1);
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
		flex: 0.62;
	}
	.volume {
		flex: 0.7;
	}
	.balance {
		width: 12px;
	}
	.pools .tooltip {
		vertical-align: bottom;
		overflow: hidden;
	}
	.tooltip {
		position: relative;
		margin-left: 0;
	}
	.tooltiptext.long {
		max-width: 250px;
		position: absolute;
		margin-left: 0;
		transform: translateX(-50%) translateX(6px);
	}
	.tooltiptext.long a {
		display: inline-block;
		background: transparent;
		text-decoration: underline;
	}
	.tooltiptext.long > div {
		padding-left: 1em;
		text-align: left;
	}
	.tooltiptext.long > div:hover {
		background: none;
	}
	.balance img {
		height: 12px;
	}
</style>