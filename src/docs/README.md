# Calculating volume and prices

Compounded coins(cDAI, cUSDC) are used in:
- compound(cDAI, cUSDC) 
- usdt(cDAI, cUSDC, USDT)

Y coins(yDAI, yUSDC, yUSDT, yTUSD, yBUSD) are used in: 
- y(yDAI, yUSDC, yUSDT, yTUSD) 
- busd(yDAI, yUSDC, yUSDT, yBUSD)

## Getting from on-chain data

###### Calculating wrapped rates for Exchange events
- For plain coins: ```c-rate = 1 / coin precisions```
- For compounded coins: ```c-rate = exchangeRateStored() * (1 + supplyRatePerBlock() * (currentBlock - accrualBlockNumber()) / 1e18)```
- For y coins: ```c-rate = getPricePerFullShare() / 1e18 / coin precisions```

Then you can convert from wrapped coin amount to plain coins: ```plainAmount = wrappedAmount * coins```

## Getting data from json files

URL: https://beta.curve.fi/raw-stats/{**compound, usdt, y, busd, susd**}-{**1, 5, 10, 30, 1440**}m.json
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