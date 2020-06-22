<template>
	<div class="window white">
	        <fieldset class='contractsdialog'>
	            <legend>Contracts</legend>
	            <fieldset>
	            	<legend>Curve Pool Registry</legend>
	                	<a href = "https://etherscan.io/address/0x7002B727Ef8F5571Cb5F9D70D13DBEEb4dFAe9d1">
	                		<img class='icon' :src="publicPath + 'curveIcons/curve-registry.svg'"> <span class='text'>Curve Registry address</span>
	                	</a>
	                	<a href = "https://etherscan.io/address/0xc1DB00a8E5Ef7bfa476395cdbcc98235477cDE4E">
	                		<img class='icon' :src="publicPath + 'curveIcons/curve-registry.svg'"> <span class='text'>Curve calc address</span>
	                	</a>
	                	<a href = "https://github.com/curvefi/curve-pool-registry/blob/b17/doc/notebook/playbook.ipynb">
	                		<img class='icon' :src="publicPath + 'curveIcons/curve-registry.svg'"> 
	                		<span class='text'>Curve Registry docs</span>
	                	</a>
	            </fieldset>
	            <fieldset v-for = '(addresses, i) in contractAddresses'>
	            	<legend>{{allPools[i]}}</legend>
	                	<a :href = "'https://etherscan.io/address/' + addresses.swap">
	                		<img class='icon' :src="getTokenUrl(i)"> <span class='text'>swap address</span>
	                	</a>
	                	<a :href = "'https://etherscan.io/address/' + addresses.token">
	                		<img class='icon' :src="getTokenUrl(i)"> 
	                		<span class='text'>[{{tokenNames[i].ticker}}] {{tokenNames[i].name}} token address</span>
	                	</a>
	                	<a :href = "'https://etherscan.io/address/' + depositZaps[i].deposit" v-show="!['ren', 'sbtc'].includes(allPools[i])">
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
			allPools: ['compound', 'usdt', 'y', 'busd', 'susdv2', 'pax', 'ren', 'sbtc'],
			tokenNames: [
				{ name: 'cCurve', ticker: 'cCrv' },
				{ name: 'tCurve', ticker: 'tCrv' },
				{ name: 'yCurve', ticker: 'yCrv' },
				{ name: 'bCurve', ticker: 'bCrv' },
				{ name: 'sCurve', ticker: 'sCrv' },
				{ name: 'pCurve', ticker: 'pCrv' },
				// { name: 'tbtcCurve', ticker: 'tbtcCrv' },
				{ name: 'renCurve', ticker: 'renCrv' },
				{ name: 'sbtcCurve', ticker: 'sbtcCrv' },
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
			},
			publicPath() {
				return process.env.BASE_URL
			},
		},
		methods: {
			getTokenUrl(i) {
				let publicPath = process.env.BASE_URL
				return publicPath + 'curveIcons/' + this.tokenNames[i].ticker + '.png'
			},
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