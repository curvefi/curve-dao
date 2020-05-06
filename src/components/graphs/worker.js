import * as Comlink from 'comlink'
import BN from 'bignumber.js'

import stableswap_fns from '../../utils/stableswap_fns'

let calcPrice = (config, fromCurrency, toCurrency, precisions, usefee = false) => {
	let calc = stableswap_fns(config);
	return calc.get_dy_underlying(fromCurrency,toCurrency,precisions,usefee).toString(10)
};

let calcPriceWrapped = (config, fromCurrency, toCurrency, precisions, usefee = false) => {
	let calc = stableswap_fns(config)
	return calc.get_dy(fromCurrency,toCurrency,precisions,usefee).toString(10)
}

let normalizeCoinIdx = (i, pool) => {
	if(pool == 'susd' && i == 3) return 5;
	if(pool == 'busd' && i == 3) return 4;
	return i;
}

let getVolumePerCoin = (data, pools, allabis) => {
	let poolnames = pools.map(entry => entry[0])
	let volumes = [[],[],[],[],[],[]]
	for(let i = 0; i < data.compound.length; i++) {
		let timestamp = data.compound[i].timestamp
		for(let pool of poolnames) {
			let key = pool
			let v = data[key][i]
			if(Object.keys(v).length === 0 && v.constructor === Object) continue;
			let vol = Object.entries(v.volume)
			for(let [pair, val] of vol) {
				let [m, n] = pair.split('-')
				let volSold = val[0]
				let volBought = val[1]
				let normM = normalizeCoinIdx(m, key)
				let normN = normalizeCoinIdx(n, key)
				volumes[normM].push([
					v.timestamp * 1000,
					volSold / allabis[key == 'y' ? 'iearn' : key == 'susd' ? 'susdv2' : key].coin_precisions[m]
				])
				volumes[normN].push([
					v.timestamp * 1000,
					volBought / allabis[key == 'y' ? 'iearn' : key == 'susd' ? 'susdv2' : key].coin_precisions[n]
				])
			}
		}
	}
	return volumes
}

Comlink.expose({calcPrice:calcPrice, calcPriceWrapped:calcPriceWrapped, getVolumePerCoin});