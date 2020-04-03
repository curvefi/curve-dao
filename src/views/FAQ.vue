<template>
	<div class="window white">
        <h2>Curve FAQ</h2>
        <h3>What is Curve?</h3>

        <p>Curve is an exchange liquidity pool on Ethereum (like <a
         href="https://uniswap.exchange/">Uniswap</a>)
        designed for (1) extremely efficient stablecoin trading (2) low
        risk, supplemental fee income for liquidity providers, without an
        opportunity cost.</p>

        <p>Curve allows users (and smart contracts like <a href="https://1inch.exchange/">1inch</a>, <a href="https://paraswap.io">Paraswap</a>,
        <a href="https://swap.totle.com/">Totle</a> and <a href="https://dex.ag/">Dex.ag</a>) to trade
        between DAI and USDC with a bespoke low slippage, low fee algorithm
        designed specifically for stablecoins. Behind the scenes, the
        liquidity pool is supplied to the <a href="https://compound.finance/">Compound</a> protocol, where it
        generates income for liquidity providers.</p>

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
        your DAI or USDC balance, similar to most DeFi applications.</p>

        <p>On the <a href="/">exchange</a>, select the asset you would like to convert (e.g.
        USDC), and the quantity (e.g. 1,000) - the exchange rate, and
        quantity that you will receive (including and all slippage and fees)
        will be displayed. The exchange rate might surprise you - that’s the
        power of Curve.</p>

        <h3>How do I provide liquidity to Curve?</h3>

        <p>Curve uses <a href="https://compound.finance/ctokens">cTokens</a>,
        assets inside the Compound protocol, as the
        liquidity pool - this ensures that assets are always being put to
        work. You can acquire cDAI or cUSDC by supplying DAI or USDC to
        <a href="https://app.compound.finance/">Compound</a>, or by
        acquiring cTokens on <a href="https://1inch.exchange/">1inch</a>,
        <a href="https://paraswap.io/">Paraswap</a>, <a href="https://swap.totle.com/">Totle</a> or <a href="https://dex.ag/">Dex.ag</a>.</p>

        <p>Before providing liquidity, you’ll have to approve Curve to
        interact with your cDAI or cUSDC balances.</p>

        <p>Visit the <a href="/deposit.html">Curve deposit page</a>, and your available balances should
        appear. If you <b>add all coins in a balanced proportion</b>, you will
        provide cTokens at the current exchange Curve rate; this requires
        you to have both assets in your wallet. You can uncheck this feature
        to supply one side of the market, or a different ratio of assets,
        and Curve will automatically exchange them into the proper quantity
        (with the same low slippage & fees of the Curve exchange) -
        magic!</p>

        <h3>What's "Use maximum amount of coins available"?</h3>
        <p>This means using all USDC and DAI in your wallet. This way is
        recommended only if you have much less coins than currently in
        liquidity pool.</p>

        <h3>What's "Infinite approval - trust this contract forever"?</h3>
        <p>This means that you preapprove the contract to to be able to spend any amount of your coins when you interact with it.
        This means that you won't be asked every time to appove the amount of coins you want to transfer to the contract.
        </p>

        <h3>How to withdraw liquidity I provided?</h3>
        <p>Go to <a href="/withdraw.html">the withdraw page</a>. If you want
        to withdraw some percentage of your liquidity (the preferred way),
        type that percentage in the top field.
        You can, however, withdraw in a form of individual coins (USDC,
        DAI), having the exchange happening for you, if you type amounts in
        lower fields. You'll get charged with the exchange fee in the latter
        case.</p>
    </div>
</template>