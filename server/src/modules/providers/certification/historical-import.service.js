/**
 * Historical Import Service
 *
 * @module signalforge/server/modules/providers/certification/historical
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import {
  DEFAULT_MIN_HISTORICAL_MESSAGES,
  DEFAULT_MAX_HISTORICAL_MESSAGES,
} from '../provider.constants.js';
import { InsufficientHistoricalDataError } from '../provider.errors.js';
import { emitHistoricalImportStarted, emitHistoricalImportCompleted } from '../provider.events.js';

export class HistoricalImportService {
  constructor(db = null) {
    this.db = db || getDatabase();
    this.logger = getLogger('provider-historical-import');
  }

  async importForProvider(providerId, options = {}) {
    const limit = Math.min(
      Math.max(Number(options.historicalMessageLimit) || DEFAULT_MIN_HISTORICAL_MESSAGES, 100),
      DEFAULT_MAX_HISTORICAL_MESSAGES,
    );

    await emitHistoricalImportStarted(providerId, options.certificationId || null, limit);

    const query = `
      SELECT sm.id, sm.source_id, sm.channel_id, sm.external_message_id,
             sm.message_text, sm.timestamp, sm.processing_status
        FROM source_messages sm
        JOIN signal_sources ss ON ss.id = sm.source_id
       WHERE ss.user_id = (SELECT user_id FROM providers WHERE id = $1)
         AND sm.processing_status IN ('CLASSIFIED', 'PARSED', 'VALIDATED', 'EXECUTED')
       ORDER BY sm.timestamp ASC
       LIMIT $2
    `;

    const result = await this.db.query(query, [providerId, limit]);
    const messages = result.rows;

    if (messages.length < DEFAULT_MIN_HISTORICAL_MESSAGES) {
      throw new InsufficientHistoricalDataError(undefined, {
        found: messages.length,
        minimum: DEFAULT_MIN_HISTORICAL_MESSAGES,
      });
    }

    const summary = {
      importedMessages: messages.length,
      firstMessageAt: messages[0]?.timestamp || null,
      lastMessageAt: messages[messages.length - 1]?.timestamp || null,
      channelCount: new Set(messages.map((m) => m.channel_id)).size,
    };

    await emitHistoricalImportCompleted(providerId, options.certificationId || null, summary);

    return {
      messages,
      summary,
    };
  }
}

export default HistoricalImportService;