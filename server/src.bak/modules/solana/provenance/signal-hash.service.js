/**
 * Signal Hash Service
 *
 * Computes deterministic hashes for the pieces of a signal processing
 * record that need to be anchored on-chain. The input is never the
 * raw message; it is a canonicalized subset of the parsed output.
 *
 * @module server/modules/solana/provenance/signal-hash.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { hashObject, canonicalize } from '@signalforge/shared/utils/hash.util';

const PUBLIC_SIGNAL_FIELDS = Object.freeze([
  'signalId',
  'providerId',
  'symbol',
  'direction',
  'entryType',
  'entryPrice',
  'stopLoss',
  'takeProfits',
  'confidence',
  'classification',
  'timestamp',
]);

function pickPublicFields({ signal }) {
  if (!signal || typeof signal !== 'object') {
    return {};
  }

  const picked = {};

  for (const field of PUBLIC_SIGNAL_FIELDS) {
    if (signal[field] !== undefined) {
      picked[field] = signal[field];
    }
  }

  return picked;
}

export function computeSignalHash({ signal }) {
  if (!signal || typeof signal !== 'object') {
    throw new AppError('signal is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const picked = pickPublicFields({ signal });

  return hashObject(picked);
}

export function computeProcessingHash({ signal, aiVersion, parserType, modelId, processingSteps }) {
  if (!signal || !aiVersion) {
    throw new AppError('signal and aiVersion are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const canonical = {
    signal: pickPublicFields({ signal }),
    aiVersion,
    parserType: parserType || null,
    modelId: modelId || null,
    steps: Array.isArray(processingSteps) ? processingSteps : [],
  };

  return hashObject(canonical);
}

export function verifyProcessingHash({ signal, aiVersion, parserType, modelId, processingSteps, expectedHash }) {
  if (!expectedHash) {
    throw new AppError('expectedHash is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const computed = computeProcessingHash({
    signal,
    aiVersion,
    parserType,
    modelId,
    processingSteps,
  });

  return { matches: computed === expectedHash, computed, expected: expectedHash };
}

export function canonicalizePublicSignal({ signal }) {
  return canonicalize(pickPublicFields({ signal }));
}

export const signalHashService = {
  computeSignalHash,
  computeProcessingHash,
  verifyProcessingHash,
  canonicalizePublicSignal,
  PUBLIC_SIGNAL_FIELDS,
};