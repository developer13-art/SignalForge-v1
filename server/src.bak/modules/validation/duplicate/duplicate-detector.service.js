/**
 * Duplicate Detector Service
 *
 * @module signalforge/server/modules/validation/duplicate/detector
 */

import { DuplicateRepository } from './duplicate.repository.js';
import { FingerprintMatcherService } from './fingerprint-matcher.service.js';
import { StandardizationRepository } from '../../signal-standardization/standardization.repository.js';
import {
  DEFAULT_DUPLICATE_WINDOW_MINUTES,
} from '../validation.constants.js';
import { emitDuplicateDetected } from '../validation.events.js';

export class DuplicateDetectorService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DuplicateRepository();
    this.matcher = dependencies.matcher || new FingerprintMatcherService();
    this.standardizationRepository =
      dependencies.standardizationRepository || new StandardizationRepository();
  }

  async detect(signal, options = {}) {
    if (!signal || !signal.fingerprint) {
      return { duplicate: false, reason: 'NO_FINGERPRINT' };
    }

    const windowMinutes = options.windowMinutes ?? DEFAULT_DUPLICATE_WINDOW_MINUTES;
    const windowSeconds = windowMinutes * 60;

    const existing = await this.standardizationRepository.findRecentDuplicate(
      signal.fingerprint,
      windowSeconds,
    );

    if (!existing) {
      return { duplicate: false };
    }

    if (existing.signal_id === signal.signalId) {
      return { duplicate: false, reason: 'SAME_SIGNAL' };
    }

    await this.repository.create({
      signalId: signal.signalId,
      duplicateSignalId: existing.signal_id,
      fingerprint: signal.fingerprint,
      similarity: 1,
      windowSeconds,
      providerId: signal.providerId,
      reason: 'FINGERPRINT_MATCH',
    });

    await emitDuplicateDetected(signal.signalId, existing.signal_id, {
      windowSeconds,
    });

    return {
      duplicate: true,
      duplicateSignalId: existing.signal_id,
      fingerprint: signal.fingerprint,
      windowSeconds,
    };
  }

  async findBySignal(signalId) {
    return this.repository.findBySignal(signalId);
  }
}

export default DuplicateDetectorService;