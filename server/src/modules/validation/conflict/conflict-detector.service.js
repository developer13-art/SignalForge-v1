/**
 * Conflict Detector Service
 *
 * @module signalforge/server/modules/validation/conflict/detector
 */

import { ConflictRepository } from './conflict.repository.js';
import { StandardizationRepository } from '../../signal-standardization/standardization.repository.js';
import {
  DEFAULT_CONFLICT_WINDOW_MINUTES,
} from '../validation.constants.js';
import { emitConflictDetected } from '../validation.events.js';

export class ConflictDetectorService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ConflictRepository();
    this.standardizationRepository =
      dependencies.standardizationRepository || new StandardizationRepository();
  }

  async detect(signal, options = {}) {
    if (!signal || !signal.symbol || !signal.direction) {
      return { conflicting: false, reason: 'MISSING_FIELDS' };
    }

    const windowMinutes = options.windowMinutes ?? DEFAULT_CONFLICT_WINDOW_MINUTES;
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const oppositeDirection = signal.direction === 'BUY' ? 'SELL' : 'BUY';

    const result = await this.standardizationRepository.listSignals(
      {
        symbol: signal.normalizedSymbol || signal.symbol,
        direction: oppositeDirection,
        since: since.toISOString(),
      },
      { limit: 10, offset: 0 },
    );

    const candidates = (result.signals || []).filter(
      (candidate) => candidate.provider_id !== signal.providerId,
    );

    if (candidates.length === 0) {
      return { conflicting: false };
    }

    const conflicts = [];

    for (const candidate of candidates) {
      const created = await this.repository.create({
        signalId: signal.signalId,
        conflictingSignalId: candidate.signal_id,
        symbol: signal.normalizedSymbol || signal.symbol,
        direction: signal.direction,
        conflictingDirection: candidate.direction,
        providerId: signal.providerId,
        conflictingProviderId: candidate.provider_id,
        windowSeconds: windowMinutes * 60,
        resolved: false,
      });

      conflicts.push(created);

      await emitConflictDetected(signal.signalId, candidate.signal_id, {
        symbol: signal.symbol,
      });
    }

    return {
      conflicting: true,
      conflictCount: conflicts.length,
      conflicts,
    };
  }

  async findBySignal(signalId) {
    return this.repository.findBySignal(signalId);
  }

  async findUnresolvedBySymbol(symbol, windowMinutes) {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    return this.repository.findUnresolvedBySymbol(symbol, since);
  }
}

export default ConflictDetectorService;