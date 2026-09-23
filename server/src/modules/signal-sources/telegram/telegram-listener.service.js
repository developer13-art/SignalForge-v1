/**
 * Telegram Listener Service
 *
 * Subscribes to opted-in channels and forwards incoming messages to
 * the message service for persistence and processing.
 *
 * @module signalforge/server/modules/signal-sources/telegram/listener
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { TelegramRepository } from './telegram.repository.js';
import { TelegramSessionStoreService } from './telegram-session-store.service.js';
import { TelegramClientFactory } from './telegram-client.factory.js';
import { MessageService } from '../messages/message.service.js';
import { MessageNormalizerService } from '../messages/message-normalizer.service.js';
import { TelegramAdapter } from '../adapters/telegram.adapter.js';
import {
  SESSION_HEALTH_CHECK_INTERVAL_MS,
  RECONNECT_BASE_DELAY_MS,
  MAX_RECONNECT_ATTEMPTS,
} from './telegram.constants.js';
import { emitMessageReceived, emitMessageEdited, emitMessageDeleted } from '../source.events.js';

export class TelegramListenerService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TelegramRepository();
    this.sessionStore = dependencies.sessionStore || new TelegramSessionStoreService(this.repository);
    this.messageService = dependencies.messageService || new MessageService();
    this.normalizer = new MessageNormalizerService();
    this.logger = getLogger('telegram-listener');
    this.activeListeners = new Map();
  }

  async start(userId) {
    if (this.activeListeners.has(userId)) {
      return { started: true, already: true };
    }

    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection || connection.status !== 'CONNECTED') {
      throw new Error('Telegram connection is not connected');
    }

    const sessionString = await this.sessionStore.retrieveSession(connection.id);
    if (!sessionString) {
      throw new Error('Telegram session is missing');
    }

    const client = TelegramClientFactory.create({ session: sessionString });
    const adapter = new TelegramAdapter({ client });
    const channels = await this.repository.listOptedInChannels(connection.id);
    const channelIds = channels.map((c) => c.channel_id);

    if (channelIds.length === 0) {
      this.logger.warn({ userId }, 'No opted-in channels to listen to');
      return { started: false, reason: 'no_channels' };
    }

    let backoff = RECONNECT_BASE_DELAY_MS;
    let attempts = 0;
    let stopped = false;

    const handleNewMessage = async (rawMessage) => {
      const normalized = adapter.normalizeMessage(rawMessage);
      if (!normalized) {
        return;
      }
      if (!channelIds.includes(String(normalized.channelId))) {
        return;
      }
      try {
        const result = await this.messageService.ingest(
          { id: connection.source_id || connection.id, user_id: userId, source_type: 'TELEGRAM' },
          this.normalizer.normalize(normalized),
        );
        if (!result.duplicate) {
          await emitMessageReceived(userId, connection.id, result.messageId, {
            channelId: normalized.channelId,
          });
        }
      } catch (error) {
        this.logger.error({ err: error, userId }, 'Failed to ingest telegram message');
      }
    };

    const handleEditedMessage = async (rawMessage) => {
      const normalized = adapter.normalizeMessage(rawMessage);
      if (!normalized) {
        return;
      }
      await emitMessageEdited(userId, connection.id, normalized.externalMessageId);
    };

    const handleDeletedMessage = async (rawMessage) => {
      await emitMessageDeleted(userId, connection.id, rawMessage?.id);
    };

    const startSubscription = async () => {
      while (!stopped) {
        try {
          await client.connect();
          await client.subscribeToChannels(channelIds, {
            onNewMessage: handleNewMessage,
            onEditedMessage: handleEditedMessage,
            onDeletedMessage: handleDeletedMessage,
          });
          backoff = RECONNECT_BASE_DELAY_MS;
          attempts = 0;
          break;
        } catch (error) {
          attempts++;
          this.logger.error({ err: error, userId, attempts }, 'Telegram listener reconnect');
          if (attempts >= MAX_RECONNECT_ATTEMPTS) {
            throw error;
          }
          await new Promise((r) => setTimeout(r, backoff));
          backoff = Math.min(backoff * 2, 60000);
        }
      }
    };

    await startSubscription();

    const healthInterval = setInterval(async () => {
      try {
        const healthy = await client.isConnected();
        if (!healthy) {
          this.logger.warn({ userId }, 'Telegram client not connected, restarting listener');
          await client.connect();
        }
      } catch (error) {
        this.logger.error({ err: error, userId }, 'Telegram health check failed');
      }
    }, SESSION_HEALTH_CHECK_INTERVAL_MS);

    if (healthInterval.unref) {
      healthInterval.unref();
    }

    this.activeListeners.set(userId, {
      stop: async () => {
        stopped = true;
        clearInterval(healthInterval);
        await client.disconnect();
      },
    });

    return { started: true };
  }

  async stop(userId) {
    const listener = this.activeListeners.get(userId);
    if (!listener) {
      return { stopped: false, reason: 'not_running' };
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

export default TelegramListenerService;