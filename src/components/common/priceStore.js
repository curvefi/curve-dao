import * as helpers from '../../utils/helpers'

export let state = {
	btcPrice: null,
}

export async function getBTCPrice() {
	let req = await helpers.retry(fetch(`https://api.coinpaprika.com/v1/tickers/btc-bitcoin`), 300);
    let res = await req.json();
    state.btcPrice = res.quotes.USD.price;
    return res.quotes.USD.price
}