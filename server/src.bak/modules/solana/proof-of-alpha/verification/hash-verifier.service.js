'use strict';

const crypto = require('crypto');

const memoPayloadService = require('../memo/memo-payload.service');
const parser = require('./parser.service');

const {
  InvalidMemoError,
  VerificationFailedError,
} = require('../proof.errors');

/**
 * SignalForge - Hash Verifier Service
 *
 * Confirms that the memo hash recorded by SignalForge matches the
 * canonical hash of the parsed on-chain memo. The hash function is
 * SHA-256 over the JSON serialization of the payload in the exact
 * form that was originally submitted; if the payload is
 * re-serialized from a parsed object, the serializer must produce the
 * same byte sequence.
 */

function hashString(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function hashPayloadCanonical(payload) {
  return memoPayloadService.hashPayload(payload);
}

function hashRawMemo(memo) {
  if (memo === undefined || memo === null) {
    throw new InvalidMemoError('Memo is required to compute a hash');
  }
  return hashString(memo);
}

function canonicalize(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new InvalidMemoError('Payload must be a JSON object to canonicalize');
  }

  const ordered = {};
  const keys = Object.keys(payload).sort();

  for (const key of keys) {
    const value = payload[key];
    if (value === undefined) {
      continue;
    }
    if (value === null) {
      ordered[key] = null;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      ordered[key] = canonicalize(value);
    } else if (Array.isArray(value)) {
      ordered[key] = value.map((entry) =>
        entry && typeof entry === 'object' && !Array.isArray(entry) ? canonicalize(entry) : entry,
      );
    } else {
      ordered[key] = value;
    }
  }

  return ordered;
}

function hashCanonicalPayload(payload) {
  const canonical = canonicalize(payload);
  return hashString(JSON.stringify(canonical));
}

function compareHashes(expected, actual) {
  if (!expected || !actual) {
    return false;
  }
  if (expected.length !== actual.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'));
  } catch (_error) {
    return false;
  }
}

function verifyMemoAgainstRecord({ memoText, expectedHash, expectedPayload }) {
  if (!memoText) {
    throw new InvalidMemoError('Memo text is required for hash verification');
  }

  const parsed = parser.parseMemo(memoText);

  const actualHash = hashPayloadCanonical(parsed);

  if (!expectedHash && expectedPayload) {
    const recomputed = hashPayloadCanonical(expectedPayload);
    return {
      valid: compareHashes(recomputed, actualHash),
      expectedHash: recomputed,
      actualHash,
      parsed,
    };
  }

  if (!expectedHash) {
    return {
      valid: true,
      expectedHash: null,
      actualHash,
      parsed,
      reason: 'No expected hash provided; recorded hash is reported',
    };
  }

  const matches = compareHashes(expectedHash, actualHash);

  if (!matches) {
    throw new VerificationFailedError('Memo hash does not match the recorded proof hash', {
      expectedHash,
      actualHash,
    });
  }

  return {
    valid: true,
    expectedHash,
    actualHash,
    parsed,
  };
}

function computeMemoHash(memoText) {
  if (!memoText) {
    throw new InvalidMemoError('Memo text is required');
  }
  const parsed = parser.parseMemo(memoText);
  return hashPayloadCanonical(parsed);
}

function computeSignatureHash(signature) {
  if (!signature) {
    throw new InvalidMemoError('Signature is required');
  }
  return hashString(signature);
}

function buildVerificationDigest({ signature, memoHash, providerId, tradeId }) {
  const parts = [signature || '', memoHash || '', providerId || '', tradeId || ''];
  return hashString(parts.join('|'));
}

module.exports = {
  hashString,
  hashPayloadCanonical,
  hashRawMemo,
  canonicalize,
  hashCanonicalPayload,
  compareHashes,
  verifyMemoAgainstRecord,
  computeMemoHash,
  computeSignatureHash,
  buildVerificationDigest,
};