import Vue from 'vue'

Vue.filter('capitalize', function (value) {
	return value.toUpperCase();
})

Vue.filter('toFixed2', function (value) {
  if(value == '') return '';
	return (+value).toFixed(2);
})

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