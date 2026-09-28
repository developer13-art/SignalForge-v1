/**
 * Validators Unit Tests
 *
 * Comprehensive tests for all shared validation functions.
 *
 * @module @signalforge/shared/tests/validators
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  isValidEmail,
  normalizeEmail,
  isDisposableEmail,
  getEmailDomain,
  getEmailLocalPart,
  validateEmail,
} from '../src/validators/email.validator.js';

import {
  isValidE164,
  stripPhoneFormatting,
  normalizePhone,
  isValidPhone,
  validatePhoneForCountry,
  getCountryFromPhone,
  maskPhone,
} from '../src/validators/phone.validator.js';

import {
  hasLowercase,
  hasUppercase,
  hasDigit,
  hasSpecial,
  isCommonPassword,
  hasRepeatingCharacters,
  hasSequentialCharacters,
  calculatePasswordStrength,
  validatePassword,
} from '../src/validators/password.validator.js';

import {
  isValidUsername,
  isReservedUsername,
  normalizeUsername,
  validateUsername,
} from '../src/validators/username.validator.js';

import {
  normalizeSymbol,
  isValidSymbol,
  validateSymbol,
  symbolsMatch,
  isForexSymbol,
  isMetalSymbol,
  isCryptoSymbol,
  isIndexSymbol,
} from '../src/validators/symbol.validator.js';

import {
  normalizeTimeframe,
  isValidTimeframe,
  validateTimeframe,
  getTimeframeMinutes,
  isHigherTimeframe,
  isLowerTimeframe,
} from '../src/validators/timeframe.validator.js';

import {
  isValidPrice,
  parsePrice,
  countDecimals,
  roundPrice,
  validatePrice,
  comparePrices,
  priceInRange,
  calculatePipValue,
  calculatePipDistance,
} from '../src/validators/price.validator.js';

import {
  isValidVolume,
  parseVolume,
  roundToStep,
  isOnStep,
  validateVolume,
  calculateVolumeForRisk,
  validateRiskPercent,
} from '../src/validators/lot-size.validator.js';

import {
  isValidBase58,
  isValidSolanaAddress,
  validateSolanaAddress,
  normalizeSolanaAddress,
  areSameWallet,
  shortenAddress,
  isValidTokenMint,
  isValidProgramId,
} from '../src/validators/wallet-address.validator.js';

import {
  isValidTxSignature,
  validateTxSignature,
  normalizeTxSignature,
  areSameTxSignature,
  shortenTxSignature,
  getSolanaExplorerUrl,
} from '../src/validators/tx-signature.validator.js';

import {
  validateSignalPayload,
  normalizeSignalPayload,
} from '../src/validators/signal-payload.validator.js';

import {
  validateTradePayload,
  normalizeTradePayload,
  validateRiskRewardRatio,
} from '../src/validators/trade-payload.validator.js';

import {
  validateStripeWebhookPayload,
  validatePaystackWebhookPayload,
  validateFlutterwaveWebhookPayload,
  validateKycWebhookPayload,
  validateWebhookSize,
  validateGenericWebhookPayload,
} from '../src/validators/webhook-payload.validator.js';

describe('Email Validator', () => {
  test('isValidEmail accepts valid emails', () => {
    assert.equal(isValidEmail('user@example.com'), true);
    assert.equal(isValidEmail('first.last@subdomain.example.com'), true);
    assert.equal(isValidEmail('user+tag@example.co.uk'), true);
  });

  test('isValidEmail rejects invalid emails', () => {
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail('notanemail'), false);
    assert.equal(isValidEmail('@example.com'), false);
    assert.equal(isValidEmail('user@'), false);
    assert.equal(isValidEmail('user..name@example.com'), false);
    assert.equal(isValidEmail('.user@example.com'), false);
    assert.equal(isValidEmail('user@example..com'), false);
    assert.equal(isValidEmail(null), false);
    assert.equal(isValidEmail(undefined), false);
  });

  test('normalizeEmail trims and lowercases', () => {
    assert.equal(normalizeEmail('  USER@EXAMPLE.COM  '), 'user@example.com');
    assert.equal(normalizeEmail(null), null);
  });

  test('isDisposableEmail detects disposable domains', () => {
    assert.equal(isDisposableEmail('test@mailinator.com'), true);
    assert.equal(isDisposableEmail('test@tempmail.com'), true);
    assert.equal(isDisposableEmail('test@example.com'), false);
  });

  test('getEmailDomain extracts the domain', () => {
    assert.equal(getEmailDomain('user@example.com'), 'example.com');
    assert.equal(getEmailDomain('invalid'), null);
  });

  test('getEmailLocalPart extracts the local part', () => {
    assert.equal(getEmailLocalPart('user@example.com'), 'user');
    assert.equal(getEmailLocalPart('invalid'), null);
  });

  test('validateEmail returns structured result', () => {
    const valid = validateEmail('user@example.com');
    assert.equal(valid.valid, true);
    assert.equal(valid.errors.length, 0);

    const invalid = validateEmail('notanemail');
    assert.equal(invalid.valid, false);
    assert.ok(invalid.errors.length > 0);
  });

  test('validateEmail rejects disposable when option set', () => {
    const result = validateEmail('test@mailinator.com', { rejectDisposable: true });
    assert.equal(result.valid, false);
  });
});

describe('Phone Validator', () => {
  test('isValidE164 accepts valid E.164 numbers', () => {
    assert.equal(isValidE164('+14155552671'), true);
    assert.equal(isValidE164('+2348012345678'), true);
  });

  test('isValidE164 rejects invalid numbers', () => {
    assert.equal(isValidE164('14155552671'), false);
    assert.equal(isValidE164('+0123456789'), false);
    assert.equal(isValidE164(''), false);
    assert.equal(isValidE164(null), false);
  });

  test('stripPhoneFormatting removes formatting', () => {
    assert.equal(stripPhoneFormatting('+1 (415) 555-2671'), '+14155552671');
    assert.equal(stripPhoneFormatting(null), null);
  });

  test('normalizePhone produces E.164 format', () => {
    assert.equal(normalizePhone('+14155552671'), '+14155552671');
    assert.equal(normalizePhone('0014155552671'), '+14155552671');
    assert.equal(normalizePhone('08012345678', 'NG'), '+2348012345678');
  });

  test('validatePhoneForCountry validates specific countries', () => {
    const ngValid = validatePhoneForCountry('+2348012345678', 'NG');
    assert.equal(ngValid.valid, true);

    const ngInvalid = validatePhoneForCountry('+23480123', 'NG');
    assert.equal(ngInvalid.valid, false);
  });

  test('getCountryFromPhone identifies country', () => {
    assert.equal(getCountryFromPhone('+14155552671'), 'US');
    assert.equal(getCountryFromPhone('+2348012345678'), 'NG');
  });

  test('maskPhone masks middle digits', () => {
    const masked = maskPhone('+14155552671');
    assert.ok(masked.includes('****'));
  });
});

describe('Password Validator', () => {
  test('character class detection', () => {
    assert.equal(hasLowercase('abc'), true);
    assert.equal(hasLowercase('ABC'), false);
    assert.equal(hasUppercase('ABC'), true);
    assert.equal(hasUppercase('abc'), false);
    assert.equal(hasDigit('abc1'), true);
    assert.equal(hasDigit('abc'), false);
    assert.equal(hasSpecial('abc!'), true);
    assert.equal(hasSpecial('abc'), false);
  });

  test('isCommonPassword detects known weak passwords', () => {
    assert.equal(isCommonPassword('password'), true);
    assert.equal(isCommonPassword('password123'), true);
    assert.equal(isCommonPassword('Str0ng!Pass'), false);
  });

  test('hasRepeatingCharacters detects excessive repeats', () => {
    assert.equal(hasRepeatingCharacters('aaabbb'), false);
    assert.equal(hasRepeatingCharacters('aaaa'), true);
  });

  test('hasSequentialCharacters detects sequential patterns', () => {
    assert.equal(hasSequentialCharacters('abcd1234'), true);
    assert.equal(hasSequentialCharacters('a1b2c3d4'), false);
  });

  test('calculatePasswordStrength returns score and level', () => {
    const weak = calculatePasswordStrength('abc');
    assert.equal(weak.level, 'weak');
    assert.ok(weak.feedback.length > 0);

    const strong = calculatePasswordStrength('Str0ng!Passw0rd123');
    assert.ok(['strong', 'very-strong'].includes(strong.level));
  });

  test('validatePassword enforces requirements', () => {
    const valid = validatePassword('Str0ng!Pass');
    assert.equal(valid.valid, true);

    const noUpper = validatePassword('str0ng!pass');
    assert.equal(noUpper.valid, false);

    const noSpecial = validatePassword('Str0ngPass');
    assert.equal(noSpecial.valid, false);

    const tooShort = validatePassword('Ab1!');
    assert.equal(tooShort.valid, false);
  });
});

describe('Username Validator', () => {
  test('isValidUsername accepts valid usernames', () => {
    assert.equal(isValidUsername('user123'), true);
    assert.equal(isValidUsername('user_name'), true);
    assert.equal(isValidUsername('user-name'), true);
    assert.equal(isValidUsername('User123'), true);
  });

  test('isValidUsername rejects invalid usernames', () => {
    assert.equal(isValidUsername('ab'), false);
    assert.equal(isValidUsername('_user'), false);
    assert.equal(isValidUsername('-user'), false);
    assert.equal(isValidUsername('user name'), false);
    assert.equal(isValidUsername('a'.repeat(31)), false);
  });

  test('isReservedUsername identifies reserved names', () => {
    assert.equal(isReservedUsername('admin'), true);
    assert.equal(isReservedUsername('ADMIN'), true);
    assert.equal(isReservedUsername('signalforge'), true);
    assert.equal(isReservedUsername('myuser'), false);
  });

  test('validateUsername returns structured result', () => {
    const valid = validateUsername('user123');
    assert.equal(valid.valid, true);

    const reserved = validateUsername('admin');
    assert.equal(reserved.valid, false);
  });
});

describe('Symbol Validator', () => {
  test('normalizeSymbol applies aliases', () => {
    assert.equal(normalizeSymbol('GOLD'), 'XAUUSD');
    assert.equal(normalizeSymbol('EUR/USD'), 'EURUSD');
    assert.equal(normalizeSymbol('BTC'), 'BTCUSD');
    assert.equal(normalizeSymbol('eurusd'), 'EURUSD');
  });

  test('isValidSymbol accepts valid symbols', () => {
    assert.equal(isValidSymbol('EURUSD'), true);
    assert.equal(isValidSymbol('XAUUSD'), true);
    assert.equal(isValidSymbol('GOLD'), true);
    assert.equal(isValidSymbol('US30'), true);
  });

  test('isValidSymbol rejects invalid symbols', () => {
    assert.equal(isValidSymbol(''), false);
    assert.equal(isValidSymbol('a'.repeat(40)), false);
    assert.equal(isValidSymbol(null), false);
  });

  test('symbolsMatch compares normalized forms', () => {
    assert.equal(symbolsMatch('GOLD', 'XAUUSD'), true);
    assert.equal(symbolsMatch('EURUSD', 'EUR/USD'), true);
    assert.equal(symbolsMatch('EURUSD', 'GBPUSD'), false);
  });

  test('isForexSymbol detects forex pairs', () => {
    assert.equal(isForexSymbol('EURUSD'), true);
    assert.equal(isForexSymbol('GBPJPY'), true);
    assert.equal(isForexSymbol('XAUUSD'), false);
    assert.equal(isForexSymbol('BTCUSD'), false);
  });

  test('isMetalSymbol detects metals', () => {
    assert.equal(isMetalSymbol('XAUUSD'), true);
    assert.equal(isMetalSymbol('XAGUSD'), true);
    assert.equal(isMetalSymbol('EURUSD'), false);
  });

  test('isCryptoSymbol detects crypto', () => {
    assert.equal(isCryptoSymbol('BTCUSD'), true);
    assert.equal(isCryptoSymbol('ETHUSD'), true);
    assert.equal(isCryptoSymbol('SOLUSD'), true);
    assert.equal(isCryptoSymbol('EURUSD'), false);
  });

  test('isIndexSymbol detects indices', () => {
    assert.equal(isIndexSymbol('US30'), true);
    assert.equal(isIndexSymbol('NAS100'), true);
    assert.equal(isIndexSymbol('EURUSD'), false);
  });

  test('validateSymbol respects allowed list', () => {
    const result = validateSymbol('EURUSD', { allowedSymbols: ['GBPUSD'] });
    assert.equal(result.valid, false);
  });
});

describe('Timeframe Validator', () => {
  test('normalizeTimeframe handles aliases', () => {
    assert.equal(normalizeTimeframe('1h'), 'H1');
    assert.equal(normalizeTimeframe('1H'), 'H1');
    assert.equal(normalizeTimeframe('4H'), 'H4');
    assert.equal(normalizeTimeframe('1D'), 'D1');
    assert.equal(normalizeTimeframe('DAILY'), 'D1');
    assert.equal(normalizeTimeframe('30M'), 'M30');
  });

  test('isValidTimeframe identifies valid timeframes', () => {
    assert.equal(isValidTimeframe('M1'), true);
    assert.equal(isValidTimeframe('H4'), true);
    assert.equal(isValidTimeframe('D1'), true);
    assert.equal(isValidTimeframe('X1'), false);
  });

  test('getTimeframeMinutes returns correct minutes', () => {
    assert.equal(getTimeframeMinutes('M1'), 1);
    assert.equal(getTimeframeMinutes('H1'), 60);
    assert.equal(getTimeframeMinutes('D1'), 1440);
    assert.equal(getTimeframeMinutes('invalid'), null);
  });

  test('isHigherTimeframe compares correctly', () => {
    assert.equal(isHigherTimeframe('H4', 'H1'), true);
    assert.equal(isHigherTimeframe('M1', 'H1'), false);
  });

  test('isLowerTimeframe compares correctly', () => {
    assert.equal(isLowerTimeframe('M1', 'H1'), true);
    assert.equal(isLowerTimeframe('D1', 'H1'), false);
  });
});

describe('Price Validator', () => {
  test('isValidPrice accepts valid prices', () => {
    assert.equal(isValidPrice(1.2345), true);
    assert.equal(isValidPrice('1.2345'), true);
    assert.equal(isValidPrice(0), true);
  });

  test('isValidPrice rejects invalid prices', () => {
    assert.equal(isValidPrice(-1), false);
    assert.equal(isValidPrice('abc'), false);
    assert.equal(isValidPrice(Infinity), false);
    assert.equal(isValidPrice(null), false);
  });

  test('parsePrice normalizes to number', () => {
    assert.equal(parsePrice('1,234.56'), 1234.56);
    assert.equal(parsePrice('1.5'), 1.5);
    assert.equal(parsePrice('invalid'), null);
  });

  test('countDecimals counts decimal places', () => {
    assert.equal(countDecimals(1.2345), 4);
    assert.equal(countDecimals(100), 0);
  });

  test('roundPrice rounds to specified decimals', () => {
    assert.equal(roundPrice(1.23456, 2), 1.23);
    assert.equal(roundPrice(1.23456, 4), 1.2346);
  });

  test('comparePrices compares within tolerance', () => {
    assert.equal(comparePrices(1.0, 1.0), 0);
    assert.equal(comparePrices(1.01, 1.0, 0.02), 0);
    assert.equal(comparePrices(1.1, 1.0), 1);
    assert.equal(comparePrices(0.9, 1.0), -1);
  });

  test('priceInRange checks range', () => {
    assert.equal(priceInRange(1.5, 1.0, 2.0), true);
    assert.equal(priceInRange(0.5, 1.0, 2.0), false);
  });

  test('calculatePipValue returns correct pip for symbol', () => {
    assert.equal(calculatePipValue('EURUSD', 1.1), 0.0001);
    assert.equal(calculatePipValue('USDJPY', 110), 0.01);
    assert.equal(calculatePipValue('XAUUSD', 2000), 0.01);
    assert.equal(calculatePipValue('BTCUSD', 50000), 1);
  });

  test('calculatePipDistance computes pip distance', () => {
    const distance = calculatePipDistance('EURUSD', 1.1000, 1.1050);
    assert.equal(distance, 50);
  });
});

describe('Lot Size Validator', () => {
  test('isValidVolume accepts valid volumes', () => {
    assert.equal(isValidVolume(0.01), true);
    assert.equal(isValidVolume(1.0), true);
    assert.equal(isValidVolume('1.5'), true);
  });

  test('isValidVolume rejects invalid volumes', () => {
    assert.equal(isValidVolume(0), false);
    assert.equal(isValidVolume(-1), false);
    assert.equal(isValidVolume('abc'), false);
  });

  test('roundToStep rounds to nearest step', () => {
    assert.equal(roundToStep(0.123, 0.01), 0.12);
    assert.equal(roundToStep(0.126, 0.01), 0.13);
  });

  test('isOnStep validates step alignment', () => {
    assert.equal(isOnStep(0.05, 0.01), true);
    assert.equal(isOnStep(0.055, 0.01), false);
  });

  test('validateVolume returns structured result', () => {
    const valid = validateVolume(0.1);
    assert.equal(valid.valid, true);

    const invalid = validateVolume(0.0001);
    assert.equal(invalid.valid, false);
  });

  test('calculateVolumeForRisk computes position size', () => {
    const volume = calculateVolumeForRisk({
      accountBalance: 10000,
      riskPercent: 1,
      stopLossPips: 50,
      pipValuePerLot: 10,
    });
    assert.equal(volume, 0.2);
  });

  test('validateRiskPercent validates risk range', () => {
    const valid = validateRiskPercent(2.5);
    assert.equal(valid.valid, true);

    const tooHigh = validateRiskPercent(15);
    assert.equal(tooHigh.valid, false);
  });
});

describe('Solana Wallet Address Validator', () => {
  const validAddress = '11111111111111111111111111111111';

  test('isValidBase58 identifies base58 strings', () => {
    assert.equal(isValidBase58('abc123'), true);
    assert.equal(isValidBase58('0OIl'), false);
  });

  test('isValidSolanaAddress accepts valid addresses', () => {
    assert.equal(isValidSolanaAddress(validAddress), true);
  });

  test('isValidSolanaAddress rejects invalid addresses', () => {
    assert.equal(isValidSolanaAddress('short'), false);
    assert.equal(isValidSolanaAddress(''), false);
    assert.equal(isValidSolanaAddress('0OIl'), false);
  });

  test('validateSolanaAddress returns structured result', () => {
    const valid = validateSolanaAddress(validAddress);
    assert.equal(valid.valid, true);

    const invalid = validateSolanaAddress('bad');
    assert.equal(invalid.valid, false);
  });

  test('normalizeSolanaAddress trims valid addresses', () => {
    assert.equal(normalizeSolanaAddress(`  ${validAddress}  `), validAddress);
    assert.equal(normalizeSolanaAddress('bad'), null);
  });

  test('areSameWallet compares addresses', () => {
    assert.equal(areSameWallet(validAddress, validAddress), true);
    assert.equal(areSameWallet(validAddress, 'different'), false);
  });

  test('shortenAddress abbreviates addresses', () => {
    const shortened = shortenAddress(validAddress);
    assert.ok(shortened.includes('...'));
  });

  test('isValidTokenMint validates token mints', () => {
    assert.equal(isValidTokenMint(validAddress), true);
  });

  test('isValidProgramId validates program ids', () => {
    assert.equal(isValidProgramId(validAddress), true);
  });
});

describe('Tx Signature Validator', () => {
  const validSignature = '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW';

  test('isValidTxSignature accepts valid signatures', () => {
    assert.equal(isValidTxSignature(validSignature), true);
  });

  test('isValidTxSignature rejects invalid signatures', () => {
    assert.equal(isValidTxSignature('short'), false);
    assert.equal(isValidTxSignature(''), false);
    assert.equal(isValidTxSignature(null), false);
  });

  test('validateTxSignature returns structured result', () => {
    const valid = validateTxSignature(validSignature);
    assert.equal(valid.valid, true);

    const invalid = validateTxSignature('bad');
    assert.equal(invalid.valid, false);
  });

  test('areSameTxSignature compares signatures', () => {
    assert.equal(areSameTxSignature(validSignature, validSignature), true);
    assert.equal(areSameTxSignature(validSignature, 'other'), false);
  });

  test('shortenTxSignature abbreviates signatures', () => {
    const shortened = shortenTxSignature(validSignature);
    assert.ok(shortened.includes('...'));
  });

  test('getSolanaExplorerUrl builds explorer URL', () => {
    const url = getSolanaExplorerUrl(validSignature, 'devnet');
    assert.ok(url.startsWith('https://explorer.solana.com/tx/'));
    assert.ok(url.includes('cluster=devnet'));
  });
});

describe('Signal Payload Validator', () => {
  const validSignal = {
    symbol: 'EURUSD',
    direction: 'BUY',
    entryType: 'MARKET',
    entryPrice: 1.1050,
    stopLoss: 1.1020,
    takeProfits: [1.1110, 1.1150],
    riskPercent: 1,
    timeframe: 'H1',
  };

  test('validateSignalPayload accepts valid signals', () => {
    const result = validateSignalPayload(validSignal);
    assert.equal(result.valid, true);
  });

  test('validateSignalPayload rejects missing required fields', () => {
    const result = validateSignalPayload({});
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  test('validateSignalPayload rejects invalid direction', () => {
    const result = validateSignalPayload({ ...validSignal, direction: 'INVALID' });
    assert.equal(result.valid, false);
  });

  test('validateSignalPayload respects requireStopLoss', () => {
    const noStop = { ...validSignal };
    delete noStop.stopLoss;
    const result = validateSignalPayload(noStop, { requireStopLoss: true });
    assert.equal(result.valid, false);
  });

  test('normalizeSignalPayload produces canonical form', () => {
    const normalized = normalizeSignalPayload({
      symbol: 'GOLD',
      direction: 'long',
      entryPrice: '2000.50',
      stopLoss: '1990',
      takeProfits: ['2010', '2020'],
    });
    assert.equal(normalized.symbol, 'XAUUSD');
    assert.equal(normalized.direction, 'BUY');
    assert.equal(normalized.entryPrice, 2000.50);
    assert.deepEqual(normalized.takeProfits, [2010, 2020]);
  });
});

describe('Trade Payload Validator', () => {
  const validTrade = {
    symbol: 'EURUSD',
    direction: 'BUY',
    orderType: 'MARKET',
    volume: 0.1,
    price: 1.1050,
    stopLoss: 1.1020,
    takeProfit: 1.1110,
  };

  test('validateTradePayload accepts valid trades', () => {
    const result = validateTradePayload(validTrade);
    assert.equal(result.valid, true);
  });

  test('validateTradePayload rejects invalid direction', () => {
    const result = validateTradePayload({ ...validTrade, direction: 'INVALID' });
    assert.equal(result.valid, false);
  });

  test('validateTradePayload validates BUY stop loss placement', () => {
    const result = validateTradePayload({
      ...validTrade,
      stopLoss: 1.1100,
    });
    assert.equal(result.valid, false);
  });

  test('validateTradePayload validates SELL take profit placement', () => {
    const result = validateTradePayload({
      ...validTrade,
      direction: 'SELL',
      stopLoss: 1.1100,
      takeProfit: 1.1200,
    });
    assert.equal(result.valid, false);
  });

  test('normalizeTradePayload produces canonical form', () => {
    const normalized = normalizeTradePayload({
      symbol: 'GOLD',
      direction: 'long',
      volume: '0.5',
      price: '2000.50',
    });
    assert.equal(normalized.symbol, 'XAUUSD');
    assert.equal(normalized.direction, 'BUY');
    assert.equal(normalized.volume, 0.5);
  });

  test('validateRiskRewardRatio checks minimum ratio', () => {
    const result = validateRiskRewardRatio(
      {
        symbol: 'EURUSD',
        price: 1.1050,
        stopLoss: 1.1020,
        takeProfit: 1.1110,
      },
      { minRatio: 2 },
    );
    assert.equal(result.valid, true);
  });
});

describe('Webhook Payload Validator', () => {
  test('validateStripeWebhookPayload accepts valid payloads', () => {
    const result = validateStripeWebhookPayload(
      {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: { object: {} },
      },
      't=123,v1=abc',
      'secret',
    );
    assert.equal(result.valid, true);
  });

  test('validatePaystackWebhookPayload accepts valid payloads', () => {
    const result = validatePaystackWebhookPayload(
      {
        event: 'charge.success',
        data: { reference: 'ref_123' },
      },
      'signature',
      'secret',
    );
    assert.equal(result.valid, true);
  });

  test('validateFlutterwaveWebhookPayload validates signature', () => {
    const result = validateFlutterwaveWebhookPayload(
      { status: 'successful', txRef: 'ref_123' },
      'secret',
      'secret',
    );
    assert.equal(result.valid, true);

    const invalid = validateFlutterwaveWebhookPayload(
      { status: 'successful', txRef: 'ref_123' },
      'wrong',
      'secret',
    );
    assert.equal(invalid.valid, false);
  });

  test('validateKycWebhookPayload requires application id or reference', () => {
    const valid = validateKycWebhookPayload({
      applicationId: 'app_123',
      status: 'approved',
    });
    assert.equal(valid.valid, true);

    const invalid = validateKycWebhookPayload({});
    assert.equal(invalid.valid, false);
  });

  test('validateWebhookSize enforces max size', () => {
    const valid = validateWebhookSize(Buffer.from('small'));
    assert.equal(valid.valid, true);

    const large = Buffer.alloc(1024 * 1024 + 1);
    const invalid = validateWebhookSize(large);
    assert.equal(invalid.valid, false);
  });

  test('validateGenericWebhookPayload validates required fields', () => {
    const valid = validateGenericWebhookPayload(
      { foo: 'bar', baz: 'qux' },
      { requiredFields: ['foo', 'baz'] },
    );
    assert.equal(valid.valid, true);

    const invalid = validateGenericWebhookPayload(
      { foo: 'bar' },
      { requiredFields: ['foo', 'baz'] },
    );
    assert.equal(invalid.valid, false);
  });
});