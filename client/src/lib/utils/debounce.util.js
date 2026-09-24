/**
 * Debounce Utility
 *
 * @module client/src/lib/utils/debounce.util
 */

export function debounce(fn, delayMs = 300) {
  if (typeof fn !== 'function') {
    throw new Error('fn must be a function');
  }

  let timer = null;

  const debounced = function debounced(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  debounced.flush = function flush(...args) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn.apply(this, args);
  };

  return debounced;
}

export function debounceAsync(fn, delayMs = 300) {
  const debounced = debounce(fn, delayMs);
  return debounced;
}

export default debounce;