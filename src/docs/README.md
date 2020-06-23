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


# How to integrate Curve smart contracts

First of all, you'll need to know the contract's
[ABI](https://github.com/curvefi/curve-contract/blob/compounded/deployed/2020-01-21_mainnet/swap.abi).
Addresses of the contract and the token representing liquidity are
[here](https://github.com/curvefi/curve-contract/blob/compounded/deployed/2020-01-21_mainnet/mainnet.log).

Next is the breif description of methods you need to fascilitate exchanges.

## Getting static information

```python
coins: public(address[N_COINS])
```
- By calling `contract.coins(i)`, you get contract address of i-th c-token
  (cDAI, cUSDC, ...); `i = 0, 1, ...`.

```python
underlying_coins: public(address[N_COINS])
```
- By calling `contract.underlying_coins(i)`, you get contract address of i-th token
  (DAI, USDC, ...).

Both those methods don't change the state.

## Getting price for c-tokens (cDAI, cUSDC)

```python
def get_dy(i: int128, j: int128, dx: uint256) -> uint256:
```

How much of c-token `j` you'll get in exchange for `dx` of c-token `i`,
including the fee. For example, `get_dy(0, 1, dx)` will give you amount of cUSDC
you'll get for `dx` of cDAI.

This method doesn't change the state.

## Getting price for underlying tokens (DAI, USDC)

```python
def get_dy_underlying(i: int128, j: int128, dx: uint256) -> uint256:
```

How much of underlying token `j` you'll get in exchange for `dx` of token `i`,
including the fee. For example, `get_dy_underlying(0, 1, dx)` will give you amount of USDC
you'll get for `dx` of DAI.

This method doesn't change the state.

## Exchanging c-tokens

```python
def exchange(i: int128, j: int128, dx: uint256, min_dy: uint256):
```

This method exchanges `dx` of c-token `i` into c-token `j`.
You specify `min_dy` as the minimal amount of c-token `j` to get to avoid
front-running. You can also use `deadline` to make transaction revert if it
wasn't accepted for too long.

Used to exchange `cDAI<>cUSDC` (and analogues in future deployments).

## Exchanging underlying tokens

```python
def exchange_underlying(i: int128, j: int128, dx: uint256, min_dy: uint256):
```

This method exchanges `dx` of underlying token `i` into token `j`.
You specify `min_dy` as the minimal amount of token `j` to get to avoid
front-running. You can also use `deadline` to make transaction revert if it
wasn't accepted for too long.

Used to exchange `DAI<>USDC` (and analogues in future deployments).

## Calculating approximate token amount to mint/burn for deposit/withdrawal
```python
def calc_token_amount(amounts: uint256[N_COINS], deposit: bool) -> uint256:
```
This read-only method accepts an array of `amounts` and a `deposit` bool param 
and returns an approximate amount of pool tokens you'll receive.

## Depositing into the pool

```python
def add_liquidity(amounts: uint256[N_COINS], min_mint_amount: uint256):
```

This method accepts an array of `amounts` to deposit and minimum amount `min_mint_amount` 
of pool tokens to receive. It reverts if minted tokens are less than specified `min_mint_amount`.
You can calculate the `min_mint_amount` using `calc_token_amount` for the same inputs and multiplying
by 99% for example.

## Withdrawing share from the pool

```python
def remove_liquidity(_amount: uint256, min_amounts: uint256[N_COINS]):
```

This method accepts a token amount `_amount` to withdraw from the pool and an array of
minimum coin amounts `min_amounts` to receive. Reverts if any of the received coin amounts
is less than specified.

## Withdrawing in imbalance from the pool

```python
def remove_liquidity_imbalance(amounts: uint256[N_COINS], max_burn_amount: uint256):
```

This method is used when you want to remove liquidity from the pool in uneven amounts. That can give
**slippage** or **bonus** depending on if the coin is low or high in the pool.

This method accepts an array of coin amounts to remove from the pool and max amount of pool tokens to burn
`max_burn_amount`. Reverts if amount of burned pool tokens is bigger than specified `max_burn_amount`.


## Bonus: measuring profits

```python
def get_virtual_price() -> uint256:
```

This read-only methods calculates price of liquidity share. In order to
calculate profits between two points, you measure virtual price in those two
moments and divide later by the earlier, and subtract 1.

The method doesn't measure the real price in dollars, but rather profit on top
of what you would have observe with fee-less exchange. It is not affected by
market fluctuations, and can measure returns even in a volatile market, over any
periods of time.



# Calculating volume, balances and prices

## Getting from on-chain data

###### Calculating wrapped rates for Exchange events
In order to convert from compounded coins to plain coins, you need to get the current exchange rate of the compounded coin, supply rate per block and accrual block number, then rate for converting from compounded coin to plain coin is calculated by:

```c-rate = exchangeRateStored() * (1 + supplyRatePerBlock() * (currentBlock - accrualBlockNumber()) / 1e18)```

For plain coins the rate for conversion is: 

```c-rate = 1 / coin precisions```

For y tokens you need to call getPricePerFullShare and then calculate the c-rate using: 

```c-rate = getPricePerFullShare() / 1e18 / coin precisions```

Then you can convert from wrapped coin amount to plain coins: 

```plainAmount = wrappedAmount * coins```

In order to calculate balances, you can call the `balance` function on the swap contracts with the index of the coin in the pool. For example for susd `balance(0)` returns the balance of DAI.
Then, multiply the balance by c-rates.

Sum of balances is the liquidity of the pool.

## Getting data from json files

URL: https://curve.fi/raw-stats/{ **compound, usdt, y, busd, susd, pax, ren2, rens** }-{ **1, 5, 10, 30, 1440** }m.json
for example https://curve.fi/raw-stats/compound-5m.json

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

You can also get the balances from the json files and divide by coin precisions.

For example: 
```
"balances": [
      2.0664613069111704e+24,
      2793142029856,
      2775461182730,
      3.4125362659002725e+24
    ]
```

Balance of DAI = 2.0664613069111704e+24/1e18 = 2066461.3069111704

Sum of balances is the liquidity of the pool.



You can get the average USD value of tokens by multiplying them with virtual_price

To get balances in underlying tokens i.e DAI/USDC/USDT/TUSD/BUDS/sUSD or renBTC/WBTC/sBTC you'd need to multiply `balances` * `rates`
and divide by coin precision * 1e18

For example for y pool(with corresponding precisions 1e18,1e6,1e6,1e18)

```
"balances": [
  5.441087739682752e+23,
  3654224272877,
  3581888313242,
  2.987406680137162e+24
],
"rates": [
  1018057440565402500,
  1156077092373270800,
  1024755437988100600,
  1014147947003410400
],
```

```
balances.map((coin_balance, i) => coin_balance / precisions[i] * obj.rates[i] / 1e18)
```

Result [DAI, USDC, USDT, TUSD]

```
[553933.9858153213, 4224564.972267471, 3670559.5272607645, 3029672.351525377]
```