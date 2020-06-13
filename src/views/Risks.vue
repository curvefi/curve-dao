<template>
	<div class="window white">
        <h2>
            Risks of using 
            <img :src="publicPath + 'logo.png'" class='icon'> Curve Finance
        </h2>

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

        <h3>Admin keys</h3>

        <p>
            Admin key allows to pause the contract in an emergency, but only during first 2 months in existence. Also it allows to change amplification coefficient (curve parameter), admin fee (not more than half of fee which LPs take) and the fee. All the changes are timelocked for 3 days before being applied for enough notice.

            <p>Smart contracts <b>CANNOT</b> be upgraded with admin key. This limits actions in a case of emergency, but leaves users fully in control of their funds.</p>
        </p>

    </div>
</template>

<script>
    export default {
        computed: {
            publicPath() {
            return process.env.BASE_URL
          },
        },
    }
</script>

<style>
    h2 {
        display: flex;
        align-items: center;
    }

    h2 img {
        margin-left: 0.7em;
        margin-right: 0.3em;
    }
</style>