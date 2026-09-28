/**
 * Telegram Channel Service
 *
 * Manages the set of Telegram channels a user has opted in to.
 *
 * @module signalforge/server/modules/signal-sources/telegram/channel
 */

import { TelegramRepository } from './telegram.repository.js';
import { TelegramSessionStoreService } from './telegram-session-store.service.js';
import { TelegramClientFactory } from './telegram-client.factory.js';
import { CHANNEL_OPT_IN_STATUSES } from '../source.constants.js';
import {
  ChannelAlreadyOptedInError,
  ChannelNotOptedInError,
  SourceNotFoundError,
} from '../source.errors.js';

export class TelegramChannelService {
  constructor(repository = null, sessionStore = null) {
    this.repository = repository || new TelegramRepository();
    this.sessionStore = sessionStore || new TelegramSessionStoreService(this.repository);
  }

  async discover(userId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      throw new SourceNotFoundError('Telegram connection not found for user');
    }

    if (!TelegramClientFactory.isConfigured()) {
      return [];
    }

    const sessionString = await this.sessionStore.retrieveSession(connection.id);
    const client = TelegramClientFactory.create({ session: sessionString });
    const dialogs = await client.getDialogs();

    const channels = [];
    for (const dialog of dialogs) {
      if (!dialog.isChannel && !dialog.isGroup) {
        continue;
      }
      const existing = await this.repository.findChannel(connection.id, dialog.id);
      const optInStatus = existing?.opt_in_status || CHANNEL_OPT_IN_STATUSES.OPTED_OUT;

      const upserted = await this.repository.upsertChannel({
        connectionId: connection.id,
        userId,
        channelId: String(dialog.id),
        channelName: dialog.title,
        channelType: dialog.isChannel ? 'CHANNEL' : 'GROUP',
        optInStatus,
      });

      channels.push({
        channelId: upserted.channel_id,
        channelName: upserted.channel_name,
        channelType: upserted.channel_type,
        optInStatus: upserted.opt_in_status,
      });
    }

    return channels;
  }

  async list(userId, filters = {}) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      return [];
    }
    const channels = await this.repository.listChannels(connection.id, filters);
    return channels.map((c) => this.serialize(c));
  }

  async optIn(userId, channelId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      throw new SourceNotFoundError('Telegram connection not found');
    }

    const existing = await this.repository.findChannel(connection.id, channelId);

    if (existing && existing.opt_in_status === CHANNEL_OPT_IN_STATUSES.OPTED_IN) {
      throw new ChannelAlreadyOptedInError();
    }

    await this.repository.upsertChannel({
      connectionId: connection.id,
      userId,
      channelId,
      channelName: existing?.channel_name || null,
      channelType: existing?.channel_type || null,
      optInStatus: CHANNEL_OPT_IN_STATUSES.OPTED_IN,
    });

    return { channelId, optInStatus: CHANNEL_OPT_IN_STATUSES.OPTED_IN };
  }

  async optOut(userId, channelId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      throw new SourceNotFoundError('Telegram connection not found');
    }
    const existing = await this.repository.findChannel(connection.id, channelId);
    if (!existing || existing.opt_in_status !== CHANNEL_OPT_IN_STATUSES.OPTED_IN) {
      throw new ChannelNotOptedInError();
    }
    await this.repository.updateChannelOptIn(
      connection.id,
      channelId,
      CHANNEL_OPT_IN_STATUSES.OPTED_OUT,
    );
    return { channelId, optInStatus: CHANNEL_OPT_IN_STATUSES.OPTED_OUT };
  }

  async listOptedIn(userId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      return [];
    }
    const channels = await this.repository.listOptedInChannels(connection.id);
    return channels.map((c) => this.serialize(c));
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      channelId: row.channel_id,
      channelName: row.channel_name,
      channelType: row.channel_type,
      optInStatus: row.opt_in_status,
      lastMessageAt: row.last_message_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default TelegramChannelService;