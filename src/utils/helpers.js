import Vue from 'vue'

Vue.filter('capitalize', capitalize)

Vue.filter('toFixed2', function (value) {
  if(value === 0) return (+value).toFixed(2)
  if(value == '' || value == undefined) return '';
	return (+value).toFixed(2);
})

Vue.filter('toUpper', val => val.toUpperCase())

export function capitalize(value) {
  let capitalizations = {
    susd: 'sUSD',
    ycurve: 'yCurve',
    wbtc: 'wBTC',
    renbtc: 'renBTC',
  }
  if(capitalizations[value]) return capitalizations[value]
  return value.toUpperCase();
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function totalCurrencies(currencies) {
	return Object.keys(currencies).join('+');
}

export function getTokenIcon(token, wrapped, pool) {
    if(wrapped && ['compound', 'usdt'].includes(pool) && token != 'pax') {
        token = 'c' + token
    }
    else if(wrapped && ['iearn', 'y', 'busd', 'pax'].includes(pool) && token != 'pax') {
        token = '_y' + token
    }
    let asset
    try {
        asset = require('../assets/tokens/' + token + '.png')
    }
    catch(err) {
        try {
            asset = require('../assets/tokens/' + token + '.svg')
        }
        catch(err) {
            console.error(err)
            asset = ''
        }
    }
    return asset;
}

export function interpolate(x, x0, x1) {
  return (y0, y1) => y0 + (x - x0)*(y1 - y0)/(x1 - x0)
}

export function debounced(delay, fn) {
  let timerId;
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }
}

export function omit(keys, obj) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)))
}

export function makeCancelable(promise) {
    let rejectFn;

    const wrappedPromise = new Promise((resolve, reject) => {
        rejectFn = reject;

        Promise.resolve(promise)
            .then(resolve)
            .catch(reject);
    });

    wrappedPromise.cancel = (reason) => {
        rejectFn({ canceled: true, reason: reason });
    };

    return wrappedPromise;
};

export function setTimeoutPromise(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

export function generateID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export async function retry(fn, retryDelay = 100, numRetries = 3) {
  for (let i = 0; i < numRetries; i++) {
    try {
      return await fn
    } 
    catch (e) {
      if (i === numRetries - 1) throw e
      await setTimeoutPromise(retryDelay)
      retryDelay = retryDelay * 2
    }
  }
}

export function formatDate(date) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return monthNames[date.getMonth()] + String(date.getDate()).padStart(2, '0');
}

export function formatDateToHuman(timestamp) {
  //convert to UTC
  let d = new Date(timestamp*1000+(new Date).getTimezoneOffset() * 60 * 1000)
  return [
            d.getDate(),
            `${(d.getMonth()+1).toString().padStart(2, '0')}`,
            d.getFullYear()].join('/')+' '+
            [`${d.getHours()}`.padStart(2, '0'),
            `${d.getMinutes()}`.padStart(2, '0'),
            `${d.getSeconds()}`.padStart(2, '0'),
          ]
          .join(':');
}

export function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text); 

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

export function formatNumber(number, dec = 2, dsep, tsep) {
  if(number == 0) return 0
  if (isNaN(+number) || number == null) return '';
  number = parseFloat(number)
  number = number.toFixed(~~dec);
  tsep = typeof tsep == 'string' ? tsep : ',';

  var parts = number.split('.'),
    fnums = parts[0],
    decimals = parts[1] ? (dsep || '.') + parts[1] : '';

  return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
}

export async function getETHPrice() {
  let req = await fetch('https://api.coinpaprika.com/v1/tickers/eth-ethereum');
  let res = await req.json()
  return res.quotes.USD.price
}

export function findClosestIndex(timestamp, data) {
    let index = data.findIndex(d=>d.timestamp - timestamp > 0);
    return index;
}

export function binary_search(x, val) {
    let ascending = (x[x.length - 1] > x[0])
    let start = 0
    let end = x.length - 1

    while (true) {
        if (Math.abs(start - end) <= 1) return Math.min(start, end)
        if (x[start] == val) return start
        if (x[end] == val) return end

        let mid = Math.floor((start + end) / 2)

        if (ascending) {
            if (val >= x[mid])
                start = mid
            else
                end = mid
        } else {
            if (val <= x[mid])
                start = mid
            else
                end = mid
        }
    }
}

export function interp(x, y, val) {
  let x_min = Math.min(x[0], x[x.length - 1])
  let x_max = Math.max(x[0], x[x.length - 1])
  return val => {
    if ((val <= x_min) | (val >= x_max))
        return 0
    let i = binary_search(x, val)
    return y[i] + (y[i+1] - y[i]) / (x[i+1] - x[i]) * (val - x[i])
  }
}

export function chunkArr(arr, chunks) {
  return new Array(Math.ceil(arr.length / chunks)).fill().map((_, i) => arr.slice(i*chunks,i*chunks+chunks))
}


Vue.filter('formatNumber', formatNumber)