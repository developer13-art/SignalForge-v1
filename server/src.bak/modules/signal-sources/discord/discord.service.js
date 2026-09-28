/**
 * Discord Service (facade)
 *
 * @module signalforge/server/modules/signal-sources/discord/service
 */

import { DiscordRepository } from './discord.repository.js';
import { DiscordOAuthService } from './discord-oauth.service.js';
import { DiscordListenerService } from './discord-listener.service.js';

export class DiscordService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DiscordRepository();
    this.oauth = dependencies.oauth || new DiscordOAuthService(this.repository);
    this.listener = dependencies.listener || new DiscordListenerService({
      repository: this.repository,
    });
  }

  async getAuthorizeUrl(state) {
    return { url: this.oauth.getAuthorizeUrl(state) };
  }

  async handleCallback(userId, code, guildId = null) {
    const tokens = await this.oauth.exchangeCode(code);
    const user = await this.oauth.fetchUser(tokens.accessToken);
    const guilds = await this.oauth.fetchGuilds(tokens.accessToken);

    let channels = [];
    if (guildId) {
      channels = await this.oauth.fetchGuildChannels(guildId, tokens.accessToken);
    }

    let connection = await this.repository.findConnectionByUser(userId);
    if (connection) {
      await this.repository.updateConnection(connection.id, {
        guildId,
        channelIds: channels.map((c) => c.id),
        status: 'CONNECTED',
        lastConnectedAt: new Date(),
      });
    } else {
      connection = await this.repository.createConnection({
        userId,
        guildId,
        channelIds: channels.map((c) => c.id),
        accessTokenEncrypted: tokens.accessToken,
        refreshTokenEncrypted: tokens.refreshToken,
        status: 'CONNECTED',
      });
    }

    return {
      connectionId: connection.id,
      user: { id: user.id, username: user.username },
      guilds,
      channels: channels.map((c) => ({ id: c.id, name: c.name })),
    };
  }

  async listGuilds(userId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      return { guilds: [] };
    }
    const guilds = await this.oauth.fetchGuilds(connection.access_token_encrypted);
    return { guilds };
  }

  async listChannels(userId, guildId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      return { channels: [] };
    }
    const channels = await this.oauth.fetchGuildChannels(
      guildId,
      connection.access_token_encrypted,
    );
    return { channels };
  }

  async updateChannels(userId, channelIds) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      throw new Error('Discord connection not found');
    }
    await this.repository.updateConnection(connection.id, {
      channelIds,
    });
    return { updated: true, channelCount: channelIds.length };
  }
}

export default DiscordService;