/**
 * Sleep Utilities
 *
 * @module server/utils/sleep.util
 */

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sleepUntil(date) {
  const target = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diff = target - Date.now();
  if (diff <= 0) {
    return Promise.resolve();
  }
  return sleep(diff);
}

export function sleepWithJitter(baseMs, jitterFactor = 0.25) {
  const jitter = baseMs * jitterFactor;
  const adjusted = Math.max(0, baseMs + (Math.random() * 2 - 1) * jitter);
  return sleep(adjusted);
}

export const sleepUtil = {
  sleep,
  sleepUntil,
  sleepWithJitter,
};