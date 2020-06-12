<template>
	<div class="window white">
	        <fieldset class='poolsdialog donations'>
	            <legend>Integrations</legend>
	            <div>
	                <a href='https://1inch.exchange/'>
	                	<div class='index'>0.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/1inch.svg'" alt="1inch exchange">
					</div>
            		<span class='text'>1inch exchange</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	DEX Aggregator with the best prices on the market. Achieving best rates by splitting orders among multiple DEXes in one single transaction.
	                </div>
	            </div>
	            </div>
	            <div>
	                <a href='https://paraswap.io'>
	                	<div class='index'>1.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/paraswap.png'" alt="Paraswap exchange">
					</div>
            		<span class='text'>Paraswap exchange</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	The Fastest Liquidity Aggregator. Cheaper & Safer thanks to Gas Token & 1k ETH cover
	                </div>
	            </div>
	            </div>
	            <div>
	                <a href='https://swap.totle.com/'>
	                	<div class='index'>2.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/totle.svg'" alt="Totle exhange">
					</div>
            		<span class='text'>Totle swap</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	Reliable DeFi Aggregation
						<div>
							Totle aggregates DeFi services and automatically finds you the best price.
						</div>
	                </div>
	            </div>
	            </div>
	            <div>
	                <a href='https://dex.ag'>
	                	<div class='index'>3.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/dexag.png'" alt="DEX.ag exchange">
					</div>
            		<span class='text'>DEX.ag exchange</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
						DEX.AG is a DEX aggregator that gets you the best price for your trade across multiple DEXes.
	                </div>
	            </div>
	            </div>
	            <div>
	                <a href='https://debank.com/projects/curve'>
	                	<div class='index'>4.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/debank.svg'" alt="DeBank">
					</div>
            		<span class='text'>Debank DeFi wallet</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	DeBank is an all-in-one DeFi wallet, from where you can track DeFi portfolio, explore DeFi projects, compare DeFi rates.
	                </div>
	            </div>
	            </div>
	            <div>
	                <a href='https://docs.instadapp.io/connectors/curve'>
	                	<div class='index'>5.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/instadapp.webp'" alt="InstaDApp">
					</div>
            		<span class='text'>InstaDApp DSA</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	DSA platform is designed to allow developers to build extensible products and business models on top of DeFi with maximum security and composability.
	                </div>
	            </div>
	            </div>
	            <div>
	                <a href='https://www.coingecko.com/en/exchanges/curve'>
	                	<div class='index'>6.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/coingecko.webp'" alt="CoinGecko">
					</div>
            		<span class='text'>CoinGecko</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	Cryptocurrency Prices &amp; Market Capitalization
	                </div>
	            </div>
	            </div>
				<div>
	                <a href='https://www.zapper.fi/dashboard'>
	                	<div class='index'>7.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/zapper.svg'" alt="Zapper">
					</div>
            		<span class='text'>Zapper.fi</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	A simple dashboard for DeFi. Easily track and visualize all your DeFi assets and liabilities in one simple interface.
	                </div>
	            </div>
	            </div>
	            <div>
	                <a href='https://zerion.io/'>
	                	<div class='index'>8.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/zerion.png'" alt="Zerion">
					</div>
            		<span class='text'>Zerion</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
	                	A simple interface to access decentralized finance to invest, earn interest and borrow crypto assets.
	                </div>
	            </div>
	            </div>

	            <div>
	                <a href='https://pools.fyi/'>
	                	<div class='index'>9.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/poolsfyi.png'" alt="pools.fyi">
					</div>
            		<span class='text'>Pools.fyi</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
		                	Find the best liquidity pools
		                </div>
	            	</div>
	            </div>

	            <div>
	                <a href='https://spells.fyi/'>
	                	<div class='index'>10.</div>
	                	<div class='icon-container'>
	                		<img class='icon' :src="publicPath + 'icons/integrations/spellsfyi.png'" alt="spells.fyi">
					</div>
            		<span class='text'>Spells.fyi</span></a>

	                <div class='descriptionscontainer'>
	                	<div class='descriptions'>
		                	Review upcoming admin changes
		                </div>
	            	</div>
	            </div>

	        </fieldset>
	    </div>
</template>

<script>
	export default {
		metaInfo: {
	      title: 'Curve.fi :: Donate',
	      meta: [
	        {'property': 'og:title', 'content': 'curve.fi/donate'},
	        {'property': 'og:url', 'content': 'https://curve.fi/donate'},
	        {'property': 'og:type', 'content': 'website'},
	        {'property': 'og:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
	        {'property': 'og:image', 'content': '/curve.png'},
	        {'name': 'twitter:card', 'content': 'summary_large_image'},
	        {'name': 'twitter:title', 'content': 'curve.fi/donate'},
	        {'name': 'twitter:site', 'content': '@CurveFinance'},
	        {'name': 'twitter:creator', 'content': '@CurveFinance'},
	        {'name': 'twitter:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
	        {'name': 'twitter:url', 'content': 'https://curve.fi/donate'},
	        {'name': 'twitter:image', 'content': '/curve.png/donate'},
	      ]
	    },

	    computed: {
	    	publicPath() {
	    		return process.env.BASE_URL
	    	},
	    }
	}
</script>

<style scoped>
	.descriptionscontainer {
		
	}

	.descriptions {
		height: 0;
		overflow: hidden;
		transition: all 0.5s;
		margin-top: 0.4em;
		margin-left: 2.2em;
	}

	fieldset > div:hover .descriptions {
		padding-top: 0.6em;
		height: 30px;
	}

	.poolsdialog div:hover {
		background: transparent;
		color: black;
	}

	fieldset > div > a {
		display: flex;
	}

	fieldset > div > a .index {
		flex: 0.1;
	}

	fieldset > div > a .icon-container {
		flex: 0.15;
	}

	fieldset > div > a .text {
		flex: 3;
	}

</style>