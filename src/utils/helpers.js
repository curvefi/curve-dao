import Vue from 'vue'

Vue.filter('capitalize', capitalize)

Vue.filter('toFixed2', function (value) {
  if(value === 0) return (+value).toFixed(2)
  if(value == '' || value == undefined) return '';
	return (+value).toFixed(2);
})

Vue.filter('toUpper', val => val.toUpperCase())

export function capitalize(value) {
  if(value == 'susd') return 'sUSD';
  if(value == 'ycurve') return 'yCurve';
  return value.toUpperCase();
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function totalCurrencies(currencies) {
	return Object.keys(currencies).join('+');
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
  return [d.getMonth()+1,
             d.getDate(),
             d.getFullYear()].join('/')+' '+
            [`${d.getHours()}`.padStart(2, '0'),
             `${d.getMinutes()}`.padStart(2, '0'),
             `${d.getSeconds()}`.padStart(2, '0')].join(':');
}

export function formatNumber(number) {
  return (new Intl.NumberFormat().format(parseFloat(number)))
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