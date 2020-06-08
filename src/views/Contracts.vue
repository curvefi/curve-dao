<template>
	<div class="window white">
	        <fieldset class='contractsdialog'>
	            <legend>Contracts</legend>
	            <fieldset v-for = '(addresses, i) in contractAddresses'>
	            	<legend>{{allPools[i]}}</legend>
	                	<a :href = "'https://etherscan.io/address/' + addresses.swap">
	                		<img class='icon' :src="getTokenUrl(i)"> <span class='text'>swap address</span>
	                	</a>
	                	<a :href = "'https://etherscan.io/address/' + addresses.token">
	                		<img class='icon' :src="getTokenUrl(i)"> 
	                		<span class='text'>[{{tokenNames[i].ticker}}] {{tokenNames[i].name}} token address</span>
	                	</a>
	                	<a :href = "'https://etherscan.io/address/' + depositZaps[i].deposit" v-show="allPools[i] != 'ren'">
	                		<img class='icon' :src="getTokenUrl(i)"> <span class='text'>deposit address</span>
	                	</a>
	            </fieldset>
	        </fieldset>
	    </div>
</template>

<script>
	import allabis from '../allabis'

	export default {
		data: () => ({
			allPools: ['compound', 'usdt', 'y', 'busd', 'susdv2', 'pax', 'ren'],
			tokenNames: [
				{ name: 'cCurve', ticker: 'cCrv' },
				{ name: 'tCurve', ticker: 'tCrv' },
				{ name: 'yCurve', ticker: 'yCrv' },
				{ name: 'bCurve', ticker: 'bCrv' },
				{ name: 'sCurve', ticker: 'sCrv' },
				{ name: 'pCurve', ticker: 'pCrv' },
				// { name: 'tbtcCurve', ticker: 'tbtcCrv' },
				{ name: 'renCurve', ticker: 'renCrv' },
			]
		}),
		computed: {
			contractAddresses() {
				return Object.keys(allabis).filter(pool => !['y', 'susd', 'tbtc'].includes(pool)).map(pool => 
					({swap: allabis[pool].swap_address, token: allabis[pool].token_address})
				)
			},
			depositZaps() {
				return Object.keys(allabis).filter(pool => !['y', 'susd', 'tbtc'].includes(pool)).map(pool => 
					({deposit: allabis[pool].deposit_address, token: allabis[pool].token_address})
				)
			}
		},
		methods: {
			getTokenUrl(i) {
				let publicPath = process.env.BASE_URL
				return publicPath + 'curveIcons/' + this.tokenNames[i].ticker + '.png'
			}
		},
		metaInfo: {
	      title: 'Curve.fi :: Contracts',
	      meta: [
	        {'property': 'og:title', 'content': 'beta.curve.fi/contracts'},
	        {'property': 'og:url', 'content': 'https://curve.fi/contracts'},
	        {'property': 'og:type', 'content': 'website'},
	        {'property': 'og:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
	        {'property': 'og:image', 'content': '/curve.png'},
	        {'name': 'twitter:card', 'content': 'summary_large_image'},
	        {'name': 'twitter:title', 'content': 'beta.curve.fi/contracts'},
	        {'name': 'twitter:site', 'content': '@CurveFinance'},
	        {'name': 'twitter:creator', 'content': '@CurveFinance'},
	        {'name': 'twitter:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
	        {'name': 'twitter:url', 'content': 'https://curve.fi/contracts'},
	        {'name': 'twitter:image', 'content': '/curve.png'},
	      ]
	    },
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	.contractsdialog a {
		display: flex;
		padding: 0.1em;
	}
	.contractsdialog a img {
		margin-right: 10px;
	}
	.contractsdialog div {
		display: block;
		margin-top: 10px;
	}
	.contractsdialog a:hover {
	    background-color: blue;
    	color: white;
	}
</style>