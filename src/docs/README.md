# Calculating volume and prices

## Getting from on-chain data

###### Calculating c-rates for Exchange events
- For plain coins: ```c-rate = 1 / coin precisions```
- For compounded coins: ```c-rate = exchangeRateStored() * (1 + supplyRatePerBlock() * (currentBlock - accrualBlockNumber()) / 1e18)```
- For y coins: ```c-rate = getPricePerFullShare() / 1e18 / coin precisions```

Then you can convert from wrapped coin amount to plain coins: ```plainAmount = wrappedAmount * coins```

## Getting from json files

https://beta.curve.fi/raw-stats/{**compound, usdt, y, busd, susd**}-{**1, 5, 10, 30, 1440**}m.json
for example https://beta.curve.fi/raw-stats/compound-5m.json

You can get historical data for a pool's state - virtual_price, rates, prices, volumes

- Rates should be divided by coin precisions

 - Prices are an object with entries "**fromCurrency**-**toCurrency**" and values of [Open, High, Low, Close] prices for the pair

 - Volumes are an object with entries "**fromCurrency** - **toCurrency**" and values of [Tokens Sold , Tokens Bought] which should be divided by coin precisions
