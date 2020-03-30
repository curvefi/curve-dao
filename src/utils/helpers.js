import Vue from 'vue'

Vue.filter('capitalize', function (value) {
  if(value == 'susd') return 'sUSD';
  if(value == 'ycurve') return 'yCurve';
	return value.toUpperCase();
})

Vue.filter('toFixed2', function (value) {
  if(value == '' || value == undefined) return '';
	return (+value).toFixed(2);
})

Vue.filter('toUpper', val => val.toUpperCase())

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function totalCurrencies(currencies) {
	return Object.keys(currencies).join('+');
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

export function formatDate(date) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return monthNames[date.getMonth()] + String(date.getDate()).padStart(2, '0');
}

export function formatNumber(number) {
  return number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}

Vue.filter('formatNumber', formatNumber)