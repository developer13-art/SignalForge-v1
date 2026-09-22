/**
 * Ledger Entry Schema
 *
 * Defines the structure of an immutable ledger entry. Every monetary
 * change in SignalForge flows through an explicit ledger entry so that
 * balances are never mutated directly.
 *
 * @module @signalforge/shared/schemas/ledger-entry
 */

import { LEDGER_ENTRY_TYPE_VALUES } from '../constants/ledger-entry-types.js';

export const LEDGER_ENTRY_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'entryId',
    'walletId',
    'entryType',
    'amount',
    'currency',
    'recordedAt',
  ],
  properties: {
    entryId: { type: 'string', format: 'uuid' },
    walletId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid', nullable: true },
    providerId: { type: 'string', format: 'uuid', nullable: true },
    entryType: { type: 'string', enum: LEDGER_ENTRY_TYPE_VALUES },
    amount: { type: 'number' },
    currency: { type: 'string', minLength: 3, maxLength: 8, default: 'USD' },
    balanceBefore: { type: 'number', nullable: true },
    balanceAfter: { type: 'number', nullable: true },
    referenceType: { type: 'string', nullable: true, maxLength: 64 },
    referenceId: { type: 'string', nullable: true, maxLength: 128 },
    description: { type: 'string', nullable: true, maxLength: 512 },
    relatedEntryId: { type: 'string', format: 'uuid', nullable: true },
    isReversal: { type: 'boolean', default: false },
    reversalOfEntryId: { type: 'string', format: 'uuid', nullable: true },
    actorId: { type: 'string', format: 'uuid', nullable: true },
    actorType: { type: 'string', nullable: true, maxLength: 64 },
    recordedAt: { type: 'string', format: 'date-time' },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildLedgerEntry(input) {
  return {
    entryId: input.entryId,
    walletId: input.walletId,
    userId: input.userId || null,
    providerId: input.providerId || null,
    entryType: input.entryType,
    amount: input.amount,
    currency: input.currency || 'USD',
    balanceBefore: input.balanceBefore ?? null,
    balanceAfter: input.balanceAfter ?? null,
    referenceType: input.referenceType || null,
    referenceId: input.referenceId || null,
    description: input.description || null,
    relatedEntryId: input.relatedEntryId || null,
    isReversal: input.isReversal ?? false,
    reversalOfEntryId: input.reversalOfEntryId || null,
    actorId: input.actorId || null,
    actorType: input.actorType || null,
    recordedAt: input.recordedAt || new Date().toISOString(),
    metadata: input.metadata || null,
  };
}

export function validateLedgerEntry(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { valid: false, errors: ['Ledger entry must be an object'] };
  }

  for (const field of LEDGER_ENTRY_SCHEMA.required) {
    if (entry[field] === undefined || entry[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (entry.entryType && !LEDGER_ENTRY_TYPE_VALUES.includes(entry.entryType)) {
    errors.push(`Invalid entryType: ${entry.entryType}`);
  }

  if (typeof entry.amount !== 'number') {
    errors.push('Amount must be a number');
  }

  return { valid: errors.length === 0, errors };
}

export const LEDGER_ENTRY_FIELDS = Object.freeze(
  Object.keys(LEDGER_ENTRY_SCHEMA.properties),
);