/**
 * Timestamp Normalizer Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/normalization/timestamp
 */

export class TimestampNormalizerService {
  normalize(input) {
    if (!input) {
      return new Date().toISOString();
    }
    if (input instanceof Date) {
      return Number.isNaN(input.getTime()) ? null : input.toISOString();
    }
    if (typeof input === 'number') {
      const parsed = new Date(input);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }
    if (typeof input === 'string') {
      const parsed = new Date(input);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }
    return null;
  }

  isExpired(timestamp, windowMinutes = 30) {
    const parsed = this.normalize(timestamp);
    if (!parsed) {
      return true;
    }
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    return new Date(parsed).getTime() < cutoff;
  }
}

export default TimestampNormalizerService;