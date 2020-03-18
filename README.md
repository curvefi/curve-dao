# Curve Finance UI

<p align="center">
  <img src="https://raw.githubusercontent.com/curvefi/curve-ui/feature/add-info/assets/curve-image.jpeg" />
</p>

# Curve FAQ

## What is Curve?
Curve is an exchange liquidity pool on Ethereum (like Uniswap) designed for (1) extremely efficient stablecoin trading (2) low risk, supplemental fee income for liquidity providers, without an opportunity cost.

Curve allows users (and smart contracts like 1inch) to trade between DAI and USDC with a bespoke low slippage, low fee algorithm designed specifically for stablecoins. Behind the scenes, the liquidity pool is supplied to the Compound protocol, where it generates income for liquidity providers.

## Has Curve been audited?
Curve is currently in alpha - the codebase can be found on GitHub. Please don’t supply your life savings, or assets you can’t afford to lose, to Curve, especially as a liquidity provider.

Using Curve as an exchange user should be significantly less risky, but this is not advice.

## How do I trade on Curve?
Before trading, you’ll have to approve Curve to interact with your DAI or USDC balance, similar to most DeFi applications.

On the exchange, select the asset you would like to convert (e.g. USDC), and the quantity (e.g. 1,000) - the exchange rate, and quantity that you will receive (including and all slippage and fees) will be displayed. The exchange rate might surprise you - that’s the power of Curve.

## How do I provide liquidity to Curve?
Curve uses cTokens, assets inside the Compound protocol, as the liquidity pool - this ensures that assets are always being put to work. You can acquire cDAI or cUSDC by supplying DAI or USDC to Compound, or by acquiring cTokens on 1inch.

Before providing liquidity, you’ll have to approve Curve to interact with your cDAI or cUSDC balances.

Visit the Curve deposit page, and your available balances should appear. If you add all coins in a balanced proportion, you will provide cTokens at the current exchange Curve rate; this requires you to have both assets in your wallet. You can uncheck this feature to supply one side of the market, or a different ratio of assets, and Curve will automatically exchange them into the proper quantity (with the same low slippage & fees of the Curve exchange) - magic!

## What's "Use maximum amount of coins available"?
This means using all USDC and DAI in your wallet. This way is recommended only if you have much less coins than currently in liquidity pool.

## How to withdraw liquidity I provided?
Go to the withdraw page. If you want to withdraw some percentage of your liquidity (the preferred way), type that percentage in the top field. You can, however, withdraw in a form of individual coins (USDC, DAI), having the exchange happening for you, if you type amounts in lower fields. You'll get charge with the exchange fee in the latter case.



# curve-vue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).