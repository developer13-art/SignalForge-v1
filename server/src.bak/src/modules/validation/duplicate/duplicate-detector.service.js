/**
 * Duplicate Detector Service
 *
 * @module signalforge/server/modules/validation/duplicate/detector
 */
const { DuplicateRepository } = require('./duplicate.repository.js');
const { FingerprintMatcherService } = require('./fingerprint-matcher.service.js');
const { StandardizationRepository } = require('../../signal-standardization/standardization.repository.js');
const { DEFAULT_DUPLICATE_WINDOW_MINUTES } = require('../validation.constants.js');
const { emitDuplicateDetected } = require('../validation.events.js');

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
module.exports = DuplicateDetectorService;