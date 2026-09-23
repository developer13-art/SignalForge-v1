/**
 * Signal Standardization Service
 *
 * Orchestrates the standardization of a parsed signal into the
 * canonical standardized signal object used by every downstream
 * component.
 *
 * @module signalforge/server/modules/signal-standardization/service
 */

import crypto from 'node:crypto';

import { StandardizationRepository } from './standardization.repository.js';
import { SchemaMapperService } from './schema-mapper.service.js';
import { FingerprintService } from './fingerprint.service.js';
import { CanonicalFormService } from './canonical-form.service.js';
import { DuplicateFingerprintError } from './standardization.errors.js';
import {
  DUPLICATE_WINDOW_SECONDS,
  MAX_STANDARDIZED_SIGNAL_SIZE_BYTES,
} from './standardization.constants.js';
import {
  emitStandardizationStarted,
  emitStandardizationCompleted,
  emitStandardizationFailed,
  emitFingerprintComputed,
  emitDuplicateFingerprintDetected,
  emitCanonicalFormApplied,
} from './standardization.events.js';

export class StandardizationService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new StandardizationRepository();
    this.mapper = dependencies.mapper || new SchemaMapperService();
    this.fingerprint = dependencies.fingerprint || new FingerprintService();
    this.canonical = dependencies.canonical || new CanonicalFormService();
    this.duplicateWindowSeconds =
      dependencies.duplicateWindowSeconds || DUPLICATE_WINDOW_SECONDS;
  }

  async standardize(input, envelope = {}) {
    const messageId = input.rawMessageId || envelope.rawMessageId || null;

    await emitStandardizationStarted(messageId, {
      providerId: input.providerId || envelope.providerId || null,
    });

    try {
      const mapped = this.mapper.map(input, envelope);

      if (!mapped.signalId) {
        mapped.signalId = crypto.randomUUID();
      }

      const { fingerprint, components } = this.fingerprint.compute(mapped);
      mapped.fingerprint = fingerprint;

      const canonical = this.canonical.build(mapped);
      const serialized = JSON.stringify(canonical);
      if (serialized.length > MAX_STANDARDIZED_SIGNAL_SIZE_BYTES) {
        throw new Error('Standardized signal exceeds maximum size');
      }

      const duplicate = await this.repository.findRecentDuplicate(
        fingerprint,
        this.duplicateWindowSeconds,
      );

      if (duplicate) {
        await emitDuplicateFingerprintDetected(
          mapped.signalId,
          duplicate.signal_id,
          fingerprint,
        );
        throw new DuplicateFingerprintError('Duplicate signal detected', {
          existingSignalId: duplicate.signal_id,
          fingerprint,
        });
      }

      const stored = await this.repository.createSignal({
        ...mapped,
        context: mapped.context || null,
      });

      await emitFingerprintComputed(mapped.signalId, fingerprint);
      await emitCanonicalFormApplied(mapped.signalId);
      await emitStandardizationCompleted(mapped.signalId, {
        providerId: mapped.providerId,
      });

      return {
        signalId: mapped.signalId,
        storedId: stored?.id || null,
        fingerprint,
        fingerprintComponents: components,
        signal: mapped,
        canonical,
      };
    } catch (error) {
      if (error instanceof DuplicateFingerprintError) {
        throw error;
      }
      await emitStandardizationFailed(messageId, error, {
        providerId: input.providerId || envelope.providerId || null,
      });
      throw error;
    }
  }

  async getBySignalId(signalId) {
    const row = await this.repository.findSignalById(signalId);
    return this.serialize(row);
  }

  async getByRawMessageId(rawMessageId) {
    const row = await this.repository.findSignalByRawMessageId(rawMessageId);
    return this.serialize(row);
  }

  async getByFingerprint(fingerprint) {
    const row = await this.repository.findSignalByFingerprint(fingerprint);
    return this.serialize(row);
  }

  async list(filters, pagination) {
    const result = await this.repository.listSignals(filters, pagination);
    return {
      signals: result.signals.map((s) => this.serialize(s)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async stats(filters) {
    const [byClassification, bySymbol] = await Promise.all([
      this.repository.countByClassification(filters),
      this.repository.countBySymbol(filters),
    ]);
    return { byClassification, bySymbol };
  }

  async updateStatus(signalId, status) {
    await this.repository.updateSignalStatus(signalId, status);
    return { updated: true };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      signalId: row.signal_id,
      providerId: row.provider_id,
      sourceType: row.source_type,
      sourceId: row.source_id,
      rawMessageId: row.raw_message_id,
      channelId: row.channel_id,
      symbol: row.symbol,
      normalizedSymbol: row.normalized_symbol,
      direction: row.direction,
      entryType: row.entry_type,
      entryPrice: row.entry_price,
      stopLoss: row.stop_loss,
      takeProfits: row.take_profits,
      riskPercent: row.risk_percent,
      lotSize: row.lot_size,
      timeframe: row.timeframe,
      classification: row.classification,
      confidence: row.confidence,
      parserType: row.parser_type,
      parserVersion: row.parser_version,
      aiModel: row.ai_model,
      dnaVersion: row.dna_version,
      language: row.language,
      originalText: row.original_text,
      context: row.context,
      fingerprint: row.fingerprint,
      expiresAt: row.expires_at,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default StandardizationService;