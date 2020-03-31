import * as Comlink from 'comlink'
import BN from 'bignumber.js'

import stableswap_fns from '../../utils/stableswap_fns'

let calcPrice = (config, fromCurrency, toCurrency, precisions, usefee = false) => {
	let calc = stableswap_fns(config);
	return calc.get_dy_underlying(fromCurrency,toCurrency,precisions,usefee).toString(10)
};

Comlink.expose({calcPrice:calcPrice});