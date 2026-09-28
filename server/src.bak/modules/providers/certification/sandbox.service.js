/**
 * Provider Sandbox Service
 *
 * @module signalforge/server/modules/providers/certification/sandbox
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { emitSandboxRunCompleted } from '../provider.events.js';

export class SandboxService {
  constructor() {
    this.logger = getLogger('provider-sandbox');
  }

  async runSandbox(providerId, certificationId, messages, parser) {
    const results = [];
    let parsed = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        const output = await parser({
          id: message.id,
          text: message.message_text,
          sourceId: message.source_id,
          channelId: message.channel_id,
        });
        results.push({ messageId: message.id, output, success: true });
        parsed++;
      } catch (error) {
        results.push({ messageId: message.id, error: error.message, success: false });
        failed++;
        this.logger.debug({ err: error, messageId: message.id }, 'Sandbox parse failed');
      }
    }

    const summary = {
      total: messages.length,
      parsed,
      failed,
      accuracy: messages.length > 0 ? Number((parsed / messages.length).toFixed(4)) : 0,
    };

    await emitSandboxRunCompleted(providerId, certificationId, summary);

    return { summary, results };
  }
}

export default SandboxService;