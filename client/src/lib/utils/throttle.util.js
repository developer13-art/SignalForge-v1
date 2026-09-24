/**
 * Throttle Utility
 *
 * @module client/src/lib/utils/throttle.util
 */

export function throttle(fn, intervalMs = 300) {
  if (typeof fn !== 'function') {
    throw new Error('fn must be a function');
  }

  let lastCallTime = 0;
  let timer = null;
  let lastArgs = null;

  const throttled = function throttled(...args) {
    const now = Date.now();
    const elapsed = now - lastCallTime;

    lastArgs = args;

    if (elapsed >= intervalMs) {
      lastCallTime = now;
      fn.apply(this, args);
      return;
    }

    if (!timer) {
      timer = setTimeout(() => {
        lastCallTime = Date.now();
        timer = null;
        fn.apply(this, lastArgs);
      }, intervalMs - elapsed);
    }
  };

  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return throttled;
}

export function throttleLeading(fn, intervalMs = 300) {
  let lastCallTime = 0;

  return function throttledLeading(...args) {
    const now = Date.now();
    if (now - lastCallTime >= intervalMs) {
      lastCallTime = now;
      return fn.apply(this, args);
    }
    return undefined;
  };
}

export const throttleUtil = {
  throttle,
  throttleLeading,
};

export default throttle;