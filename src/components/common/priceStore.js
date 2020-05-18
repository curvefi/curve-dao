export let state = {
	btcPrice: null,
}

export async function getBTCPrice() {
	let req = await fetch(`https://api.coinpaprika.com/v1/tickers/btc-bitcoin`);
    let res = await req.json();
    state.btcPrice = res.quotes.USD.price;
    return res.quotes.USD.price
}