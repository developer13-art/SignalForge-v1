/**
 * Discord Listener Service
 *
 * Subscribes to Discord channels via the bot and forwards messages
 * to the message service.
 *
 * @module signalforge/server/modules/signal-sources/discord/listener
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { DiscordRepository } = require('./discord.repository.js');
const { DiscordAdapter } = require('../adapters/discord.adapter.js');
const { MessageService } = require('../messages/message.service.js');
const { MessageNormalizerService } = require('../messages/message-normalizer.service.js');
const discordConfig = require('../../../config/discord.config.js');
const { emitMessageReceived } = require('../source.events.js');
class DiscordListenerService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DiscordRepository();
    this.messageService = dependencies.messageService || new MessageService();
    this.normalizer = new MessageNormalizerService();
    this.logger = getLogger('discord-listener');
    this.activeListeners = new Map();
  }

  async start(userId) {
    if (this.activeListeners.has(userId)) {
      return { started: true, already: true };
    }
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection || connection.status !== 'CONNECTED') {
      throw new Error('Discord connection is not connected');
    }

    const adapter = new DiscordAdapter({});
    const channelIds = connection.channel_ids || [];

    const handleMessage = async (rawMessage) => {
      const normalized = adapter.normalizeMessage(rawMessage);
      if (!normalized) {
        return;
      }
      if (!channelIds.includes(String(normalized.channelId))) {
        return;
      }
      try {
        const result = await this.messageService.ingest(
          { id: connection.source_id || connection.id, user_id: userId, source_type: 'DISCORD' },
          this.normalizer.normalize(normalized),
        );
        if (!result.duplicate) {
          await emitMessageReceived(userId, connection.id, result.messageId, {
            channelId: normalized.channelId,
          });
        }
      } catch (error) {
        this.logger.error({ err: error, userId }, 'Failed to ingest discord message');
      }
    };

    this.activeListeners.set(userId, {
      handleMessage,
      stop: async () => {},
    });

    return { started: true };
  }

  async stop(userId) {
    const listener = this.activeListeners.get(userId);
    if (!listener) {
      return { stopped: false };
    }
    await listener.stop();
    this.activeListeners.delete(userId);
    return { stopped: true };
  }

  async stopAll() {
    for (const userId of Array.from(this.activeListeners.keys())) {
      await this.stop(userId);
    }
  }
}
module.exports = DiscordListenerService;
module.exports.DiscordListenerService = DiscordListenerService;
