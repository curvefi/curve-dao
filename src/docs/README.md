# Curve pools
- compound(cDAI, cUSDC)
- usdt(cDAI, cUSDC, USDT)
- y(yDAI, yUSDC, yUSDT, yTUSD)
- busd(yDAI, yUSDC, yUSDT, yBUSD)
- susd(DAI, USDC, USDT, sUSD)

##### Compound pool
[Swap address](https://etherscan.io/address/0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56)
Underlying coins:
    1. [DAI](https://etherscan.io/address/0x6B175474E89094C44Da98b954EedeAC495271d0F)
    2. [USDC](https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
Coins: 
    1. [cDAI](https://etherscan.io/address/0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643)
    2. [cUSDC](https://etherscan.io/address/0x39AA39c021dfbaE8faC545936693aC917d5E7563)

##### USDT pool
[Swap address](https://etherscan.io/address/0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C)
Underlying coins:
    1. [DAI](https://etherscan.io/address/0x6B175474E89094C44Da98b954EedeAC495271d0F)
    2. [USDC](https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
    3. [USDT](https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7)
Coins: 
    1. [cDAI](https://etherscan.io/address/0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643)
    2. [cUSDC](https://etherscan.io/address/0x39AA39c021dfbaE8faC545936693aC917d5E7563)
    3. [USDT](https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7)

##### Y pool
**Notice that addresses of yTokens used are different for Y and BUSD pools**
[Swap address](https://etherscan.io/address/0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51)
Underlying coins:
    1. [DAI](https://etherscan.io/address/0x6B175474E89094C44Da98b954EedeAC495271d0F)
    2. [USDC](https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
    3. [USDT](https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7)
    4. [TUSD](https://etherscan.io/address/0x0000000000085d4780B73119b644AE5ecd22b376)
Coins: 
    1. [yDAI](https://etherscan.io/address/0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01)
    2. [yUSDC](https://etherscan.io/address/0xd6aD7a6750A7593E092a9B218d66C0A814a3436e)
    3. [yUSDT](https://etherscan.io/address/0x83f798e925BcD4017Eb265844FDDAbb448f1707D)
    4. [yTUSD](https://etherscan.io/address/0x73a052500105205d34Daf004eAb301916DA8190f)
    
##### BUSD pool
**Notice that addresses of yTokens used are different for Y and BUSD pools**
[Swap address](https://etherscan.io/address/0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27)
Underlying coins:
    1. [DAI](https://etherscan.io/address/0x6B175474E89094C44Da98b954EedeAC495271d0F)
    2. [USDC](https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
    3. [USDT](https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7)
    4. [BUSD](https://etherscan.io/address/0x4Fabb145d64652a948d72533023f6E7A623C7C53)
Coins: 
    1. [yDAI](https://etherscan.io/address/0xC2cB1040220768554cf699b0d863A3cd4324ce32)
    2. [yUSDC](https://etherscan.io/address/0x26EA744E5B887E5205727f55dFBE8685e3b21951)
    3. [yUSDT](https://etherscan.io/address/0xE6354ed5bC4b393a5Aad09f21c46E101e692d447)
    4. [yTUSD](https://etherscan.io/address/0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE)


# Calculating volume and prices

## Getting from on-chain data

###### Calculating wrapped rates for Exchange events
In order to convert from compounded coins to plain coins, you need to get the current exchange rate of the compounded coin, supply rate per block and accrual block number, then rate for converting from compounded coin to plain coin is calculated by: 
```c-rate = exchangeRateStored() * (1 + supplyRatePerBlock() * (currentBlock - accrualBlockNumber()) / 1e18)```

For plain coins the rate for conversion is: ```c-rate = 1 / coin precisions```

For y tokens you need to call getPricePerFullShare and then calculate the c-rate using: ```c-rate = getPricePerFullShare() / 1e18 / coin precisions```

Then you can convert from wrapped coin amount to plain coins: ```plainAmount = wrappedAmount * coins```

## Getting data from json files

URL: https://beta.curve.fi/raw-stats/{ **compound, usdt, y, busd, susd** }-{ **1, 5, 10, 30, 1440** }m.json
for example https://beta.curve.fi/raw-stats/compound-5m.json

You can get historical data for a pool's state - virtual_price, rates, prices, volumes

- Rates should be divided by coin precisions

 - Prices are an object with entries "**fromCurrency**-**toCurrency**" and values of [Open, Low, High, Close] prices for the pair.
    
    For example DAI-sUSD in susd json: 
    ```
    "prices": {
      "0-3": [
        1.004204388647264, //open
        1.0041887032914434,  //low
        1.004204388647264, //high
        1.0041887032914434  //close
      ]
    }
    ```
    
    If you want to get sUSD-DAI price then you can get the inverse price, open price for sUSD-DAI = 1/1.004204388647264
 
 - Volumes are an object with entries "**fromCurrency** - **toCurrency**" and values of [Tokens Sold , Tokens Bought] which should be divided by coin precisions
    
    For example:
    ```
    "volume": {
      "0-3": [
        1.22698147793369e+21, //tokens sold
        1.232139909338216e+21 //tokens bought
      ]
    }
    ```
    
    For DAI-sUSD pair in susd pool tokens sold = 1.22698147793369e+21 / 1e18 and for tokens bought = 1.232139909338216e+21 / 1e18

You can get the average USD value of tokens by multiplying them with virtual_price