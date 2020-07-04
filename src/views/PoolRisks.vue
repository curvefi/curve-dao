<template>
	<div class="window white">
        <h2>
            Risks of using 
            <img :src="publicPath + 'logo.png'" class='icon'> {{ currentPool }} pool
        </h2>
        
        <p>
            Providing liquidity on Curve doesn't come without risks. Before making a deposit, it is best to research and understand the risks involved.
        </p>

        <a href='https://www.curve.fi/stableswap-paper.pdf'>Whitepaper</a>

        <h3>Audits</h3>

        <p>
            <p>Curve smart contracts were <router-link to="/audits">Audited</router-link> by
            Trail of Bits.</p>

            <p>However, security audits don't eliminate risks completely.
            Please don’t supply your life savings, or assets you
            can’t afford to lose, to Curve, especially as a liquidity
            provider.</p>

            <p>Using Curve as an exchange user should be significantly less
            risky, but this is not advice.</p>

        </p>

        <h3>Risks</h3>
        <ul class='poolrisks' v-show="['compound', 'pax', 'iearn', 'y', 'busd'].includes(currentPool)">
        	<li>Smart contract issues with lending protocols</li>
			<li>Smart contract issues with Curve</li>
			<li>Smart contract issues with iEarn</li>
			<li>Systemic issues with the stable coins in those pools</li>
        </ul>
        <ul class='poolrisks' v-show="['compound', 'pax', 'iearn', 'y', 'busd'].includes(currentPool)">
        	<li>Smart contract issues with lending protocols</li>
			<li>Smart contract issues with Curve</li>
			<li>Smart contract issues with iEarn</li>
			<li>Systemic issues with the stable coins in those pools</li>
        </ul>
        <ul class='poolrisks' v-show="['susdv2'].includes(currentPool)">
			<li>Smart contract issues with Curve</li>
			<li>Systemic issues with the stable coins in those pools</li>
			<li>Systemic issues with Synthetix(when staking)</li>
        </ul>
        <ul class='poolrisks' v-show="['susdv2'].includes(currentPool)">
			<li>Smart contract issues with Curve</li>
			<li>Systemic issues with the stable coins in those pools</li>
			<li>Systemic issues with Synthetix</li>
        </ul>
        <ul class='poolrisks' v-show="['ren'].includes(currentPool)">
			<li>Smart contract issues with Curve</li>
			<li>Systemic issues with renBTC or wBTC</li>
        </ul>
        <ul class='poolrisks' v-show="['sbtc'].includes(currentPool)">
			<li>Smart contract issues with Curve</li>
			<li>Systemic issues with renBTC, wBTC or sBTC</li>
			<li>Systemic issues with Synthetix(when staking)</li>
        </ul>

    </div>
</template>

<script>
	import { getters } from '../contract'

    export default {
        computed: {
          publicPath() {
            return process.env.BASE_URL
          },
          currentPool() {
          	return getters.currentPool()
          },
        },
    }
</script>

<style scoped>
    h2 {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
    }

    h2 img {
        margin-left: 0.7em;
        margin-right: 0.3em;
    }

    @media only screen and (max-device-width: 470px) {
        h2 img {
            margin-left: 0;
        }
    }
    .window.white a {
        border-bottom: 1px dashed gray;
    }
    .window.white a:hover {
        border-bottom: none;
    }
    .poolrisks li {
    	margin-top: 0.4em;
    }
</style>