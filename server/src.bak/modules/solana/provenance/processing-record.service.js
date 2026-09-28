/**
 * Processing Record Service
 *
 * Builds the canonical record of how a signal was processed so that
 * it can be hashed and anchored on Solana. The record contains only
 * metadata (versions, parser type, step names), never raw content.
 *
 * @module server/modules/solana/provenance/processing-record.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';

export const PROCESSING_STEPS = Object.freeze({
  RECEIVED: 'received',
  CLASSIFIED: 'classified',
  PARSED: 'parsed',
  DNA_APPLIED: 'dna_applied',
  NORMALIZED: 'normalized',
  VALIDATED: 'validated',
  CONSENSUS: 'consensus',
  RISK_EVALUATED: 'risk_evaluated',
  EXECUTED: 'executed',
});

export function buildProcessingRecord({
  signalId,
  providerId,
  aiVersion,
  parserType,
  modelId,
  steps,
  occurredAt,
}) {
  if (!signalId || !aiVersion) {
    throw new AppError('signalId and aiVersion are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalizedSteps = Array.isArray(steps)
    ? steps.filter((step) => Object.values(PROCESSING_STEPS).includes(step))
    : [];

  return {
    signalId,
    providerId: providerId || null,
    aiVersion,
    parserType: parserType || null,
    modelId: modelId || null,
    steps: normalizedSteps,
    occurredAt: occurredAt || new Date().toISOString(),
  };
}

export function summarizeProcessingRecord({ record }) {
  if (!record) {
    return { totalSteps: 0, steps: [] };
  }
  return {
    totalSteps: Array.isArray(record.steps) ? record.steps.length : 0,
    steps: record.steps || [],
    aiVersion: record.aiVersion || null,
    parserType: record.parserType || null,
  };
}

export function attachStepsToRecord({ record, additionalSteps }) {
  if (!record) {
    throw new AppError('record is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const existing = Array.isArray(record.steps) ? record.steps : [];
  const extra = Array.isArray(additionalSteps) ? additionalSteps : [];

  const combined = Array.from(new Set([...existing, ...extra]));

  return { ...record, steps: combined };
}

export const processingRecordService = {
  buildProcessingRecord,
  summarizeProcessingRecord,
  attachStepsToRecord,
  PROCESSING_STEPS,
};