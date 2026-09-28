/**
 * Utils Unit Tests
 *
 * Comprehensive tests for all shared utility functions.
 *
 * @module @signalforge/shared/tests/utils
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  sha256,
  sha512,
  md5,
  hmac,
  hashObject,
  canonicalize,
  hashWithSalt,
  verifyHash,
  hashToBase64,
  hashToBase64Url,
  randomHex,
  randomBase64Url,
  generateUuid,
} from '../src/utils/hash.util.js';

import {
  deriveKey,
  generateSalt,
  generateKey,
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  packEncrypted,
  unpackEncrypted,
  encryptPacked,
  decryptPacked,
  generateSecureToken,
  constantTimeEqual,
  hashPassword,
  verifyPassword,
} from '../src/utils/crypto.util.js';

import {
  nowIso,
  nowUnix,
  toIso,
  parseDate,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  diffMs,
  diffSeconds,
  diffMinutes,
  diffHours,
  diffDays,
  isPast,
  isFuture,
  isWithin,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getSettlementPeriod,
  parseSettlementPeriod,
  getPreviousSettlementPeriod,
  getCurrentSettlementPeriod,
  formatDuration,
} from '../src/utils/date.util.js';

import {
  getSessionForTime,
  getActiveSessions,
  isMarketOpen,
  convertToTimezone,
  formatInTimezone,
  getTimezoneOffset,
  getTimezoneOffsetMinutes,
  isValidTimezone,
  getAvailableSessions,
  getSessionDefinition,
} from '../src/utils/timezone.util.js';

import {
  isValidCurrency,
  normalizeCurrency,
  getCurrencySymbol,
  getCurrencyDecimals,
  isCryptoCurrency,
  formatCurrency,
  parseCurrencyAmount,
  roundCurrency,
  sumCurrencyAmounts,
  convertCurrency,
  calculatePercentage,
  calculateFee,
  calculateNetAmount,
  allocateProportional,
} from '../src/utils/currency.util.js';

import {
  toNumber,
  round,
  floor,
  ceil,
  clamp,
  sum,
  average,
  median,
  standardDeviation,
  variance,
  min,
  max,
  percentageChange,
  percentOf,
  formatNumber,
  formatCompact,
  formatPercentage,
  safeDivide,
  weightedAverage,
  normalize,
  isBetween,
  calculateRiskRewardRatio,
  calculateWinRate,
  calculateProfitFactor,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateMaxDrawdown,
} from '../src/utils/number.util.js';

import {
  truncate,
  capitalize,
  titleCase,
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
  slugify,
  removeWhitespace,
  normalizeWhitespace,
  stripHtml,
  escapeHtml,
  sanitizeIdentifier,
  escapeRegex,
  padStart,
  padEnd,
  isBlank,
  containsAny,
  containsAll,
  countOccurrences,
  splitLines,
  extractNumbers,
  extractFirstNumber,
  removeEmojis,
  reverse,
  isEmptyOrWhitespace,
  toBooleanString,
} from '../src/utils/string.util.js';

import {
  sleep,
  calculateDelay,
  retry,
  retryWithResult,
  retryUntil,
  isRetryableError,
  withTimeout,
  poll,
} from '../src/utils/retry.util.js';

import {
  constantBackoff,
  linearBackoff,
  exponentialBackoff,
  exponentialBackoffWithJitter,
  decorrelatedJitter,
  fibonacciBackoff,
  calculateBackoff,
  createBackoffIterator,
} from '../src/utils/backoff.util.js';

import {
  buildIdempotencyKey,
  buildSourceMessageKey,
  buildTelegramMessageKey,
  buildDiscordMessageKey,
  buildWhatsAppMessageKey,
  buildEmailMessageKey,
  buildTradingViewWebhookKey,
  buildExecutionIdempotencyKey,
  buildPaymentIdempotencyKey,
  buildReferralRewardKey,
  buildProvenanceKey,
  buildAttestationKey,
  parseIdempotencyKey,
  hashIdempotencyKey,
  shortenIdempotencyKey,
  generateIdempotencyToken,
  isSameIdempotencyKey,
  isValidIdempotencyKey,
} from '../src/utils/idempotency.util.js';

import {
  buildSignalFingerprint,
  buildMessageFingerprint,
  buildTradeFingerprint,
  buildContentFingerprint,
  hashFingerprint,
  buildPrefixFingerprint,
  fingerprintEquals,
  isValidFingerprint,
  buildDuplicateKey,
  buildProviderSignalFingerprint,
  buildContractFingerprint,
} from '../src/utils/fingerprint.util.js';

import {
  normalizePagination,
  normalizeCursorPagination,
  buildPaginationMeta,
  buildCursorMeta,
  buildPaginationLinks,
  applyPagination,
  calculateTotalPages,
  getOffsetFromCursor,
  validatePaginationParams,
} from '../src/utils/pagination.util.js';

import {
  maskString,
  maskEmail,
  maskPhone,
  maskCreditCard,
  maskWalletAddress,
  maskApiKey,
  maskToken,
  maskObject,
  truncateMiddle,
  maskAccountNumber,
} from '../src/utils/mask.util.js';

import {
  AssertionError,
  assert,
  assertEqual,
  assertNotEqual,
  assertDeepEqual,
  assertTruthy,
  assertFalsy,
  assertNotNull,
  assertIsString,
  assertIsNumber,
  assertIsBoolean,
  assertIsArray,
  assertIsObject,
  assertIsFunction,
  assertIsUuid,
  assertIsIsoDate,
  assertInRange,
  assertOneOf,
  assertNotEmpty,
  assertNoThrow,
  assertThrows,
  assertDefined,
  assertHasProperty,
  assertHasProperties,
  invariant,
} from '../src/utils/assert.util.js';

describe('Hash Utils', () => {
  test('sha256 produces consistent hashes', () => {
    const hash1 = sha256('hello');
    const hash2 = sha256('hello');
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });

  test('sha512 produces 128-character hashes', () => {
    const hash = sha512('hello');
    assert.equal(hash.length, 128);
  });

  test('md5 produces 32-character hashes', () => {
    const hash = md5('hello');
    assert.equal(hash.length, 32);
  });

  test('hmac produces consistent hashes with secret', () => {
    const hash1 = hmac('message', 'secret');
    const hash2 = hmac('message', 'secret');
    assert.equal(hash1, hash2);

    const different = hmac('message', 'different');
    assert.notEqual(hash1, different);
  });

  test('hmac throws without secret', () => {
    assert.throws(() => hmac('message', ''), /HMAC secret is required/);
  });

  test('hashObject produces consistent hashes', () => {
    const obj = { a: 1, b: 2 };
    const hash1 = hashObject(obj);
    const hash2 = hashObject({ b: 2, a: 1 });
    assert.equal(hash1, hash2);
  });

  test('canonicalize produces deterministic output', () => {
    assert.equal(canonicalize({ b: 2, a: 1 }), canonicalize({ a: 1, b: 2 }));
    assert.equal(canonicalize([1, 2, 3]), '[1,2,3]');
    assert.equal(canonicalize('text'), '"text"');
    assert.equal(canonicalize(null), 'null');
  });

  test('verifyHash validates hashes', () => {
    const hash = sha256('hello');
    assert.equal(verifyHash('hello', hash), true);
    assert.equal(verifyHash('world', hash), false);
  });

  test('randomHex produces correct length', () => {
    assert.equal(randomHex(16).length, 32);
    assert.equal(randomHex(32).length, 64);
  });

  test('generateUuid produces valid UUID', () => {
    const uuid = generateUuid();
    assert.ok(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid));
  });

  test('hashToBase64 and hashToBase64Url produce different encodings', () => {
    const base64 = hashToBase64('hello');
    const base64Url = hashToBase64Url('hello');
    assert.notEqual(base64, base64Url);
  });
});

describe('Crypto Utils', () => {
  const key = Buffer.alloc(32, 0x01);

  test('encrypt and decrypt round-trip', () => {
    const plaintext = 'sensitive data';
    const encrypted = encrypt(plaintext, key);
    assert.ok(encrypted.ciphertext);
    assert.ok(encrypted.iv);
    assert.ok(encrypted.authTag);

    const decrypted = decrypt(encrypted, key);
    assert.equal(decrypted, plaintext);
  });

  test('encryptObject and decryptObject round-trip', () => {
    const obj = { foo: 'bar', nested: { value: 42 } };
    const encrypted = encryptObject(obj, key);
    const decrypted = decryptObject(encrypted, key);
    assert.deepEqual(decrypted, obj);
  });

  test('packEncrypted and unpackEncrypted', () => {
    const encrypted = encrypt('test', key);
    const packed = packEncrypted(encrypted);
    assert.equal(typeof packed, 'string');

    const unpacked = unpackEncrypted(packed);
    assert.equal(unpacked.algorithm, encrypted.algorithm);
    assert.equal(unpacked.ciphertext, encrypted.ciphertext);
  });

  test('encryptPacked and decryptPacked round-trip', () => {
    const plaintext = 'packed data test';
    const packed = encryptPacked(plaintext, key);
    const decrypted = decryptPacked(packed, key);
    assert.equal(decrypted, plaintext);
  });

  test('decrypt fails with wrong key', () => {
    const encrypted = encrypt('test', key);
    const wrongKey = Buffer.alloc(32, 0x02);
    assert.throws(() => decrypt(encrypted, wrongKey));
  });

  test('generateSecureToken produces valid tokens', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    assert.notEqual(token1, token2);
  });

  test('constantTimeEqual compares strings safely', () => {
    assert.equal(constantTimeEqual('abc', 'abc'), true);
    assert.equal(constantTimeEqual('abc', 'abd'), false);
    assert.equal(constantTimeEqual('abc', 'abcd'), false);
  });

  test('hashPassword and verifyPassword', () => {
    const { hash, salt } = hashPassword('mySecurePassword123!');
    assert.ok(hash);
    assert.ok(salt);

    assert.equal(verifyPassword('mySecurePassword123!', hash, salt), true);
    assert.equal(verifyPassword('wrongPassword', hash, salt), false);
  });

  test('generateSalt and generateKey produce buffers', () => {
    const salt = generateSalt();
    const key = generateKey();
    assert.ok(Buffer.isBuffer(salt));
    assert.ok(Buffer.isBuffer(key));
    assert.equal(key.length, 32);
  });

  test('deriveKey produces deterministic keys', () => {
    const salt = Buffer.alloc(16, 0x01);
    const key1 = deriveKey('password', salt);
    const key2 = deriveKey('password', salt);
    assert.deepEqual(key1, key2);
  });
});

describe('Date Utils', () => {
  const testDate = new Date('2026-01-15T12:30:45.000Z');

  test('nowIso and nowUnix return current time', () => {
    const iso = nowIso();
    const unix = nowUnix();
    assert.ok(iso.includes('T'));
    assert.ok(unix > 0);
  });

  test('toIso converts dates', () => {
    assert.equal(toIso(testDate), '2026-01-15T12:30:45.000Z');
    assert.equal(toIso('2026-01-15T12:30:45.000Z'), '2026-01-15T12:30:45.000Z');
    assert.equal(toIso('invalid'), null);
  });

  test('add functions correctly add time', () => {
    assert.equal(addDays(testDate, 1).getUTCDate(), 16);
    assert.equal(addMonths(testDate, 1).getUTCMonth(), 1);
    assert.equal(addYears(testDate, 1).getUTCFullYear(), 2027);
  });

  test('diff functions compute differences', () => {
    const future = new Date('2026-01-16T12:30:45.000Z');
    assert.equal(diffDays(future, testDate), 1);
    assert.equal(diffHours(future, testDate), 24);
    assert.equal(diffMinutes(future, testDate), 1440);
  });

  test('isPast and isFuture', () => {
    const pastDate = new Date('2020-01-01');
    const futureDate = new Date('2030-01-01');
    assert.equal(isPast(pastDate), true);
    assert.equal(isPast(futureDate), false);
    assert.equal(isFuture(futureDate), true);
    assert.equal(isFuture(pastDate), false);
  });

  test('startOfDay and endOfDay', () => {
    const start = startOfDay(testDate);
    const end = endOfDay(testDate);
    assert.equal(start.getUTCHours(), 0);
    assert.equal(end.getUTCHours(), 23);
  });

  test('startOfMonth and endOfMonth', () => {
    const start = startOfMonth(testDate);
    const end = endOfMonth(testDate);
    assert.equal(start.getUTCDate(), 1);
    assert.equal(end.getUTCDate(), 31);
  });

  test('getSettlementPeriod formats correctly', () => {
    assert.equal(getSettlementPeriod(testDate), '2026-01');
  });

  test('parseSettlementPeriod parses correctly', () => {
    const parsed = parseSettlementPeriod('2026-01');
    assert.equal(parsed.year, 2026);
    assert.equal(parsed.month, 1);
    assert.equal(parsed.start.getUTCDate(), 1);
    assert.equal(parsed.end.getUTCDate(), 31);
  });

  test('getPreviousSettlementPeriod returns previous month', () => {
    assert.equal(getPreviousSettlementPeriod(testDate), '2025-12');
  });

  test('formatDuration formats durations', () => {
    assert.equal(formatDuration(1000), '1s');
    assert.equal(formatDuration(60000), '1m 0s');
    assert.equal(formatDuration(3600000), '1h 0m');
    assert.equal(formatDuration(86400000), '1d 0h');
  });
});

describe('Timezone Utils', () => {
  test('getSessionForTime checks sessions', () => {
    const tokyoTime = new Date('2026-01-15T02:00:00.000Z');
    assert.equal(getSessionForTime(tokyoTime, 'TOKYO'), true);
  });

  test('getActiveSessions returns array', () => {
    const sessions = getActiveSessions();
    assert.ok(Array.isArray(sessions));
  });

  test('isMarketOpen checks market hours', () => {
    const monday = new Date('2026-01-12T12:00:00.000Z');
    const saturday = new Date('2026-01-17T12:00:00.000Z');
    assert.equal(isMarketOpen(monday), true);
    assert.equal(isMarketOpen(saturday), false);
  });

  test('isValidTimezone validates timezone strings', () => {
    assert.equal(isValidTimezone('UTC'), true);
    assert.equal(isValidTimezone('America/New_York'), true);
    assert.equal(isValidTimezone('Invalid/Zone'), false);
  });

  test('getAvailableSessions returns sessions', () => {
    const sessions = getAvailableSessions();
    assert.ok(sessions.includes('TOKYO'));
    assert.ok(sessions.includes('LONDON'));
  });

  test('getSessionDefinition returns definition', () => {
    const session = getSessionDefinition('TOKYO');
    assert.ok(session);
    assert.equal(session.timezone, 'Asia/Tokyo');
  });

  test('getTimezoneOffsetMinutes computes offset', () => {
    const offset = getTimezoneOffsetMinutes('UTC');
    assert.equal(offset, 0);
  });
});

describe('Currency Utils', () => {
  test('isValidCurrency validates codes', () => {
    assert.equal(isValidCurrency('USD'), true);
    assert.equal(isValidCurrency('EUR'), true);
    assert.equal(isValidCurrency('US'), false);
    assert.equal(isValidCurrency('USDT'), true);
  });

  test('normalizeCurrency uppercases', () => {
    assert.equal(normalizeCurrency('usd'), 'USD');
    assert.equal(normalizeCurrency('invalid'), null);
  });

  test('getCurrencySymbol returns symbols', () => {
    assert.equal(getCurrencySymbol('USD'), '$');
    assert.equal(getCurrencySymbol('EUR'), '€');
    assert.equal(getCurrencySymbol('NGN'), '₦');
  });

  test('getCurrencyDecimals returns correct decimals', () => {
    assert.equal(getCurrencyDecimals('USD'), 2);
    assert.equal(getCurrencyDecimals('JPY'), 0);
    assert.equal(getCurrencyDecimals('BTC'), 8);
  });

  test('isCryptoCurrency identifies crypto', () => {
    assert.equal(isCryptoCurrency('BTC'), true);
    assert.equal(isCryptoCurrency('SOL'), true);
    assert.equal(isCryptoCurrency('USD'), false);
  });

  test('formatCurrency formats amounts', () => {
    const formatted = formatCurrency(1234.56, 'USD');
    assert.ok(formatted.includes('1,234.56'));

    const formattedNeg = formatCurrency(-100, 'USD');
    assert.ok(formattedNeg.includes('-'));
  });

  test('parseCurrencyAmount parses strings', () => {
    assert.equal(parseCurrencyAmount('$1,234.56'), 1234.56);
    assert.equal(parseCurrencyAmount('1.5'), 1.5);
    assert.equal(parseCurrencyAmount('1,5'), 1.5);
  });

  test('roundCurrency rounds correctly', () => {
    assert.equal(roundCurrency(1.234, 'USD'), 1.23);
    assert.equal(roundCurrency(1.235, 'USD'), 1.24);
  });

  test('sumCurrencyAmounts sums values', () => {
    assert.equal(sumCurrencyAmounts([1, 2, 3.5], 'USD'), 6.5);
  });

  test('calculatePercentage computes percentages', () => {
    assert.equal(calculatePercentage(1000, 10), 100);
  });

  test('allocateProportional distributes amounts', () => {
    const allocated = allocateProportional(100, [1, 1, 2]);
    assert.equal(allocated[0], 25);
    assert.equal(allocated[2], 50);
  });
});

describe('Number Utils', () => {
  test('toNumber converts inputs', () => {
    assert.equal(toNumber('42'), 42);
    assert.equal(toNumber(42), 42);
    assert.equal(toNumber('invalid'), null);
  });

  test('round, floor, ceil work correctly', () => {
    assert.equal(round(1.2345, 2), 1.23);
    assert.equal(floor(1.99, 0), 1);
    assert.equal(ceil(1.01, 0), 2);
  });

  test('clamp limits values', () => {
    assert.equal(clamp(15, 0, 10), 10);
    assert.equal(clamp(-5, 0, 10), 0);
    assert.equal(clamp(5, 0, 10), 5);
  });

  test('sum, average, median work', () => {
    assert.equal(sum([1, 2, 3, 4, 5]), 15);
    assert.equal(average([1, 2, 3, 4, 5]), 3);
    assert.equal(median([1, 2, 3, 4, 5]), 3);
    assert.equal(median([1, 2, 3, 4]), 2.5);
  });

  test('standardDeviation computes correctly', () => {
    const stdDev = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
    assert.equal(Math.round(stdDev), 2);
  });

  test('min and max work correctly', () => {
    assert.equal(min([3, 1, 4, 1, 5, 9, 2, 6]), 1);
    assert.equal(max([3, 1, 4, 1, 5, 9, 2, 6]), 9);
  });

  test('percentageChange computes change', () => {
    assert.equal(percentageChange(100, 110), 10);
    assert.equal(percentageChange(100, 90), -10);
  });

  test('safeDivide handles division by zero', () => {
    assert.equal(safeDivide(10, 2), 5);
    assert.equal(safeDivide(10, 0), 0);
    assert.equal(safeDivide(10, 0, -1), -1);
  });

  test('calculateRiskRewardRatio computes ratio', () => {
    assert.equal(calculateRiskRewardRatio(50, 100), 2);
  });

  test('calculateWinRate computes percentage', () => {
    assert.equal(calculateWinRate(7, 10), 70);
  });

  test('calculateProfitFactor computes factor', () => {
    assert.equal(calculateProfitFactor(1000, 500), 2);
  });

  test('calculateMaxDrawdown computes drawdown', () => {
    const result = calculateMaxDrawdown([100, 120, 90, 110, 80, 100]);
    assert.equal(result.absolute, 40);
  });

  test('formatNumber formats numbers', () => {
    const formatted = formatNumber(1234.5678, { decimals: 2 });
    assert.ok(formatted.includes('1,234.57'));
  });

  test('formatPercentage formats percentages', () => {
    assert.equal(formatPercentage(12.5), '+12.50%');
    assert.equal(formatPercentage(-5.25), '-5.25%');
  });
});

describe('String Utils', () => {
  test('truncate limits string length', () => {
    assert.equal(truncate('hello world', 5), 'he...');
    assert.equal(truncate('short', 10), 'short');
  });

  test('capitalize capitalizes first letter', () => {
    assert.equal(capitalize('hello'), 'Hello');
  });

  test('titleCase titlecases strings', () => {
    assert.equal(titleCase('hello world'), 'Hello World');
  });

  test('camelCase converts to camel case', () => {
    assert.equal(camelCase('hello-world'), 'helloWorld');
    assert.equal(camelCase('hello_world'), 'helloWorld');
  });

  test('snakeCase converts to snake case', () => {
    assert.equal(snakeCase('helloWorld'), 'hello_world');
  });

  test('kebabCase converts to kebab case', () => {
    assert.equal(kebabCase('helloWorld'), 'hello-world');
  });

  test('slugify converts to slug', () => {
    assert.equal(slugify('Hello World!'), 'hello-world');
  });

  test('escapeHtml escapes HTML characters', () => {
    assert.equal(escapeHtml('<script>alert("XSS")</script>'), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  test('stripHtml removes HTML tags', () => {
    assert.equal(stripHtml('<p>Hello</p>'), 'Hello');
  });

  test('isBlank detects blank strings', () => {
    assert.equal(isBlank('  '), true);
    assert.equal(isBlank('text'), false);
    assert.equal(isBlank(null), true);
  });

  test('containsAny and containsAll work', () => {
    assert.equal(containsAny('hello world', ['foo', 'world']), true);
    assert.equal(containsAll('hello world', ['hello', 'world']), true);
    assert.equal(containsAll('hello', ['hello', 'world']), false);
  });

  test('extractNumbers extracts numbers', () => {
    assert.deepEqual(extractNumbers('price 1.50 stop 1.20'), [1.50, 1.20]);
  });

  test('removeEmojis strips emoji characters', () => {
    assert.equal(removeEmojis('hello 😀 world'), 'hello  world');
  });

  test('toBooleanString parses boolean strings', () => {
    assert.equal(toBooleanString('true'), true);
    assert.equal(toBooleanString('1'), true);
    assert.equal(toBooleanString('false'), false);
    assert.equal(toBooleanString(true), true);
  });
});

describe('Retry Utils', () => {
  test('sleep resolves after delay', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 40);
  });

  test('retry succeeds on first attempt', async () => {
    let attempts = 0;
    const result = await retry(async () => {
      attempts++;
      return 'success';
    });
    assert.equal(result, 'success');
    assert.equal(attempts, 1);
  });

  test('retry retries on failure', async () => {
    let attempts = 0;
    const result = await retry(
      async (attempt) => {
        attempts++;
        if (attempt < 3) {
          throw new Error('transient');
        }
        return 'success';
      },
      { maxAttempts: 5, baseDelay: 10 },
    );
    assert.equal(result, 'success');
    assert.equal(attempts, 3);
  });

  test('retry throws after max attempts', async () => {
    await assert.rejects(
      retry(
        async () => {
          throw new Error('persistent');
        },
        { maxAttempts: 2, baseDelay: 10 },
      ),
      /persistent/,
    );
  });

  test('isRetryableError identifies retryable errors', () => {
    assert.equal(isRetryableError({ code: 'ECONNRESET' }), true);
    assert.equal(isRetryableError({ status: 503 }), true);
    assert.equal(isRetryableError({ status: 400 }), false);
    assert.equal(isRetryableError(new Error('timeout')), true);
  });

  test('withTimeout throws on timeout', async () => {
    await assert.rejects(
      withTimeout(sleep(1000), 50, 'timed out'),
      /timed out/,
    );
  });

  test('retryWithResult returns result object', async () => {
    const result = await retryWithResult(async () => 'success');
    assert.equal(result.success, true);
    assert.equal(result.result, 'success');
    assert.equal(result.attempts, 1);
  });
});

describe('Backoff Utils', () => {
  test('constantBackoff returns fixed delay', () => {
    assert.equal(constantBackoff(1, { delay: 500 }), 500);
    assert.equal(constantBackoff(5, { delay: 500 }), 500);
  });

  test('linearBackoff increases linearly', () => {
    assert.equal(linearBackoff(1, { baseDelay: 100, increment: 100 }), 100);
    assert.equal(linearBackoff(2, { baseDelay: 100, increment: 100 }), 200);
  });

  test('exponentialBackoff increases exponentially', () => {
    assert.equal(exponentialBackoff(1, { baseDelay: 100, factor: 2 }), 100);
    assert.equal(exponentialBackoff(2, { baseDelay: 100, factor: 2 }), 200);
    assert.equal(exponentialBackoff(3, { baseDelay: 100, factor: 2 }), 400);
  });

  test('fibonacciBackoff follows sequence', () => {
    const d1 = fibonacciBackoff(1, { baseDelay: 100 });
    const d2 = fibonacciBackoff(2, { baseDelay: 100 });
    const d3 = fibonacciBackoff(3, { baseDelay: 100 });
    assert.equal(d1, 100);
    assert.equal(d2, 100);
    assert.equal(d3, 200);
  });

  test('calculateBackoff dispatches to correct strategy', () => {
    assert.equal(calculateBackoff(2, 'constant', { delay: 500 }), 500);
    assert.equal(calculateBackoff(2, 'linear', { baseDelay: 100, increment: 100 }), 200);
    assert.equal(calculateBackoff(2, 'exponential', { baseDelay: 100, factor: 2 }), 200);
  });

  test('createBackoffIterator produces delays', () => {
    const iterator = createBackoffIterator({
      strategy: 'exponential',
      baseDelay: 100,
      maxAttempts: 3,
    });
    const r1 = iterator.next();
    const r2 = iterator.next();
    const r3 = iterator.next();
    const r4 = iterator.next();
    assert.equal(r1.value.delay, 100);
    assert.equal(r2.value.delay, 200);
    assert.equal(r3.value.delay, 400);
    assert.equal(r4.done, true);
  });
});

describe('Idempotency Utils', () => {
  test('buildIdempotencyKey builds keys', () => {
    assert.equal(buildIdempotencyKey('a', 'b', 'c'), 'a:b:c');
    assert.equal(buildIdempotencyKey('a', null, 'c'), 'a::c');
  });

  test('buildTelegramMessageKey builds keys', () => {
    assert.equal(buildTelegramMessageKey('chan', 'msg'), 'telegram:chan:msg');
  });

  test('buildDiscordMessageKey builds keys', () => {
    assert.equal(
      buildDiscordMessageKey('guild', 'chan', 'msg'),
      'discord:guild:chan:msg',
    );
  });

  test('buildExecutionIdempotencyKey builds keys', () => {
    assert.equal(buildExecutionIdempotencyKey('trade123', 1), 'execution:trade123:1');
    assert.equal(buildExecutionIdempotencyKey('trade123'), 'execution:trade123:1');
  });

  test('buildReferralRewardKey builds keys', () => {
    assert.equal(
      buildReferralRewardKey('ref1', 'ref2', '2026-01'),
      'referral:ref1:ref2:2026-01',
    );
  });

  test('parseIdempotencyKey parses keys', () => {
    const parsed = parseIdempotencyKey('telegram:chan:msg');
    assert.equal(parsed.prefix, 'telegram');
    assert.deepEqual(parsed.parts, ['chan', 'msg']);
  });

  test('hashIdempotencyKey produces consistent hashes', () => {
    const hash1 = hashIdempotencyKey('key');
    const hash2 = hashIdempotencyKey('key');
    assert.equal(hash1, hash2);
  });

  test('isValidIdempotencyKey validates keys', () => {
    assert.equal(isValidIdempotencyKey('valid:key'), true);
    assert.equal(isValidIdempotencyKey(''), false);
    assert.equal(isValidIdempotencyKey('invalid key!'), false);
  });

  test('generateIdempotencyToken produces tokens', () => {
    const token1 = generateIdempotencyToken();
    const token2 = generateIdempotencyToken();
    assert.notEqual(token1, token2);
    assert.equal(token1.length, 32);
  });
});

describe('Fingerprint Utils', () => {
  test('buildSignalFingerprint produces consistent fingerprints', () => {
    const signal = {
      symbol: 'EURUSD',
      direction: 'BUY',
      entryType: 'MARKET',
      entryPrice: 1.1050,
      stopLoss: 1.1020,
      takeProfits: [1.1110],
    };
    const fp1 = buildSignalFingerprint(signal);
    const fp2 = buildSignalFingerprint(signal);
    assert.equal(fp1, fp2);
    assert.equal(fp1.length, 64);
  });

  test('buildSignalFingerprint normalizes aliases', () => {
    const signalA = { symbol: 'GOLD', direction: 'BUY', entryType: 'MARKET' };
    const signalB = { symbol: 'XAUUSD', direction: 'BUY', entryType: 'MARKET' };
    assert.equal(buildSignalFingerprint(signalA), buildSignalFingerprint(signalB));
  });

  test('buildMessageFingerprint produces fingerprints', () => {
    const message = {
      sourceType: 'TELEGRAM',
      sourceId: 'source1',
      externalMessageId: 'msg1',
      timestamp: '2026-01-15T12:00:00.000Z',
    };
    const fp = buildMessageFingerprint(message);
    assert.equal(fp.length, 64);
  });

  test('buildContentFingerprint normalizes whitespace and case', () => {
    const fp1 = buildContentFingerprint('HELLO   WORLD');
    const fp2 = buildContentFingerprint('hello world');
    assert.equal(fp1, fp2);
  });

  test('buildPrefixFingerprint produces shorter fingerprints', () => {
    const fp = buildPrefixFingerprint({ foo: 'bar' }, 8);
    assert.equal(fp.length, 8);
  });

  test('fingerprintEquals compares fingerprints', () => {
    const fp = hashFingerprint({ test: true });
    assert.equal(fingerprintEquals(fp, fp), true);
    assert.equal(fingerprintEquals(fp, hashFingerprint({ test: false })), false);
  });

  test('isValidFingerprint validates fingerprints', () => {
    assert.equal(isValidFingerprint('a'.repeat(64)), true);
    assert.equal(isValidFingerprint('a'.repeat(32)), false);
    assert.equal(isValidFingerprint('g'.repeat(64)), false);
  });

  test('buildDuplicateKey includes time window', () => {
    const fp = hashFingerprint({ test: true });
    const key = buildDuplicateKey(fp, 60);
    assert.ok(key.startsWith(fp));
  });
});

describe('Pagination Utils', () => {
  test('normalizePagination applies defaults', () => {
    const result = normalizePagination({});
    assert.equal(result.page, 1);
    assert.equal(result.limit, 20);
    assert.equal(result.offset, 0);
  });

  test('normalizePagination caps limit', () => {
    const result = normalizePagination({ limit: 1000 });
    assert.equal(result.limit, 200);
  });

  test('normalizeCursorPagination applies defaults', () => {
    const result = normalizeCursorPagination({});
    assert.equal(result.limit, 20);
    assert.equal(result.cursor, null);
    assert.equal(result.direction, 'forward');
  });

  test('buildPaginationMeta computes metadata', () => {
    const meta = buildPaginationMeta({ page: 2, limit: 10, total: 45 });
    assert.equal(meta.totalPages, 5);
    assert.equal(meta.hasNextPage, true);
    assert.equal(meta.hasPreviousPage, true);
  });

  test('buildCursorMeta slices items', () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    const meta = buildCursorMeta({ limit: 3, items });
    assert.equal(meta.items.length, 3);
    assert.equal(meta.hasMore, true);
  });

  test('calculateTotalPages computes correctly', () => {
    assert.equal(calculateTotalPages(45, 10), 5);
    assert.equal(calculateTotalPages(40, 10), 4);
    assert.equal(calculateTotalPages(0, 10), 0);
  });

  test('validatePaginationParams validates', () => {
    assert.equal(validatePaginationParams({ page: 1, limit: 10 }).valid, true);
    assert.equal(validatePaginationParams({ page: -1 }).valid, false);
    assert.equal(validatePaginationParams({ limit: 500 }).valid, false);
  });
});

describe('Mask Utils', () => {
  test('maskString masks middle characters', () => {
    const masked = maskString('1234567890');
    assert.equal(masked, '12******90');
  });

  test('maskEmail masks local part', () => {
    assert.equal(maskEmail('user@example.com'), 'us**@example.com');
    assert.equal(maskEmail('invalid'), null);
  });

  test('maskPhone masks all but last 4 digits', () => {
    const masked = maskPhone('+14155552671');
    assert.ok(masked.endsWith('2671'));
  });

  test('maskCreditCard masks all but last 4', () => {
    const masked = maskCreditCard('4111111111111111');
    assert.ok(masked.endsWith('1111'));
    assert.ok(masked.startsWith('*'));
  });

  test('maskWalletAddress abbreviates addresses', () => {
    const masked = maskWalletAddress('11111111111111111111111111111111');
    assert.ok(masked.length <= 20);
  });

  test('maskApiKey masks key', () => {
    const masked = maskApiKey('sk_test_1234567890abcdef', 8);
    assert.ok(masked.startsWith('sk_test_'));
  });

  test('maskToken masks token', () => {
    const masked = maskToken('abcdefghijklmnopqrstuvwxyz', 4);
    assert.ok(masked.startsWith('abcd'));
  });

  test('maskObject redacts sensitive keys', () => {
    const obj = { username: 'user', password: 'secret123', apiKey: 'key123' };
    const masked = maskObject(obj, ['password', 'apikey']);
    assert.equal(masked.username, 'user');
    assert.equal(masked.password, '[REDACTED]');
    assert.equal(masked.apiKey, '[REDACTED]');
  });

  test('truncateMiddle shortens strings', () => {
    const truncated = truncateMiddle('abcdefghijklmnop', 10);
    assert.ok(truncated.includes('...'));
  });

  test('maskAccountNumber masks account numbers', () => {
    const masked = maskAccountNumber('1234567890', 4);
    assert.ok(masked.endsWith('7890'));
  });
});

describe('Assert Utils', () => {
  test('assert throws AssertionError on false', () => {
    assert.throws(() => assert(false, 'failed'), AssertionError);
    assert.doesNotThrow(() => assert(true, 'passed'));
  });

  test('assertEqual compares values', () => {
    assert.doesNotThrow(() => assertEqual(1, 1));
    assert.throws(() => assertEqual(1, 2), AssertionError);
  });

  test('assertDeepEqual compares objects', () => {
    assert.doesNotThrow(() => assertDeepEqual({ a: 1 }, { a: 1 }));
    assert.throws(() => assertDeepEqual({ a: 1 }, { a: 2 }), AssertionError);
  });

  test('assertTruthy and assertFalsy', () => {
    assert.doesNotThrow(() => assertTruthy(true));
    assert.throws(() => assertTruthy(false), AssertionError);
    assert.doesNotThrow(() => assertFalsy(false));
    assert.throws(() => assertFalsy(true), AssertionError);
  });

  test('assertNotNull checks for null/undefined', () => {
    assert.doesNotThrow(() => assertNotNull('value'));
    assert.throws(() => assertNotNull(null), AssertionError);
    assert.throws(() => assertNotNull(undefined), AssertionError);
  });

  test('type assertions work', () => {
    assert.doesNotThrow(() => assertIsString('test'));
    assert.throws(() => assertIsString(123), AssertionError);

    assert.doesNotThrow(() => assertIsNumber(123));
    assert.throws(() => assertIsNumber('123'), AssertionError);

    assert.doesNotThrow(() => assertIsArray([]));
    assert.throws(() => assertIsArray('array'), AssertionError);

    assert.doesNotThrow(() => assertIsObject({}));
    assert.throws(() => assertIsObject([]), AssertionError);
  });

  test('assertIsUuid validates UUIDs', () => {
    assert.doesNotThrow(() =>
      assertIsUuid('550e8400-e29b-41d4-a716-446655440000'),
    );
    assert.throws(() => assertIsUuid('invalid'), AssertionError);
  });

  test('assertInRange validates ranges', () => {
    assert.doesNotThrow(() => assertInRange(5, 1, 10));
    assert.throws(() => assertInRange(15, 1, 10), AssertionError);
  });

  test('assertOneOf validates against allowed set', () => {
    assert.doesNotThrow(() => assertOneOf('a', ['a', 'b']));
    assert.throws(() => assertOneOf('c', ['a', 'b']), AssertionError);
  });

  test('assertThrows and assertNoThrow work', () => {
    assert.doesNotThrow(() =>
      assertThrows(() => {
        throw new Error('expected');
      }),
    );
    assert.throws(
      () => assertThrows(() => {}),
      AssertionError,
    );
  });

  test('assertHasProperty checks object properties', () => {
    assert.doesNotThrow(() => assertHasProperty({ foo: 'bar' }, 'foo'));
    assert.throws(() => assertHasProperty({}, 'foo'), AssertionError);
  });

  test('invariant throws on violation', () => {
    assert.doesNotThrow(() => invariant(true));
    assert.throws(() => invariant(false), AssertionError);
  });
});