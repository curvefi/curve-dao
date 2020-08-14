<template>
	<div class="window white">
	        <fieldset class=''>
	            <legend>DAO Audits</legend>
	            <div id='auditcontainer'>
		            <div>
		            	<fieldset>
		                <a href='https://www.curve.fi/curve_audits/curve-dao-ToB-final.pdf'>
		                	<img class='icon' src="../../assets/trail-of-bits.jpeg?rev=98185d4fe81a0ff9206e8b34c66e2be5">
		                	<span class='text'>Audit ToB</span>
		                </a>
		            </fieldset>
		            </div>
		            <div>
		            	<fieldset>
		                <a href='https://www.curve.fi/curve_audits/curve-dao-quantstamp.pdf'>
		                	<img class='icon' :src="publicPath + 'quantstamp.svg'" />
		                	<span class='text'>Audit QuantStamp with fixes from ToB Audit</span>
		                </a>
		            </fieldset>
		            </div>
		            <div>
		            	<fieldset>
		                <a href='https://www.curve.fi/curve_audits/curve-voting-aragon-mixbytes.pdf'>
		                	<img class='icon' :src="publicPath + 'mixBytes.png'" />
		                	<span class='text'>Audit mixBytes Curve Aragon Voting fork</span>
		                </a>
		            </fieldset>
		            </div>
	       		</div>
	        </fieldset>
	    </div>
</template>

<script>
	export default {
		metaInfo: {
	      title: 'Curve.fi :: DAO Audits',
	      meta: [
	        {'property': 'og:title', 'content': 'curve.fi/curve_audits'},
	        {'property': 'og:url', 'content': 'https://curve.fi/curve_audits'},
	        {'property': 'og:type', 'content': 'website'},
	        {'property': 'og:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
	        {'property': 'og:image', 'content': '/curve.png'},
	        {'name': 'twitter:card', 'content': 'summary_large_image'},
	        {'name': 'twitter:title', 'content': 'curve.fi/curve_audits'},
	        {'name': 'twitter:site', 'content': '@CurveFinance'},
	        {'name': 'twitter:creator', 'content': '@CurveFinance'},
	        {'name': 'twitter:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
	        {'name': 'twitter:url', 'content': 'https://curve.fi/curve_audits'},
	        {'name': 'twitter:image', 'content': '/curve.png'},
	      ]
	    },

	    computed: {
	    	publicPath() {
                return process.env.BASE_URL
            },
	    },
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	#auditcontainer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		margin-top: -10px;
	}
	#auditcontainer > div {
		width: 320px;
		height: 330px;
		margin-top: 10px;
	}
	#auditcontainer div > fieldset {
		height: 300px;
	}
	#auditcontainer a {
		padding: 1em;
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
		text-align: center;
	}
	#auditcontainer a span {
		margin-top: 10px;
	}
	#auditcontainer .icon {
		width: 240px;
		height: 240px;
	}
</style>