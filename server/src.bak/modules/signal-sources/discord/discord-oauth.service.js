/**
 * Discord OAuth Service
 *
 * @module signalforge/server/modules/signal-sources/discord/oauth
 */

import discordConfig from '../../../config/discord.config.js';
import { DiscordRepository } from './discord.repository.js';
import { SourceNotConfiguredError, SourceConnectionError } from '../source.errors.js';

export class DiscordOAuthService {
  constructor(repository = null) {
    this.repository = repository || new DiscordRepository();
  }

  assertConfigured() {
    if (!discordConfig.clientId || !discordConfig.clientSecret) {
      throw new SourceNotConfiguredError('Discord OAuth is not configured');
    }
  }

  getAuthorizeUrl(state) {
    this.assertConfigured();
    const params = new URLSearchParams({
      client_id: discordConfig.clientId,
      redirect_uri: discordConfig.redirectUri,
      response_type: 'code',
      scope: discordConfig.scopes.join(' '),
      state: state || '',
    });
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCode(code) {
    this.assertConfigured();
    const body = new URLSearchParams({
      client_id: discordConfig.clientId,
      client_secret: discordConfig.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: discordConfig.redirectUri,
    });

    const response = await fetch(`${discordConfig.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new SourceConnectionError('Discord token exchange failed', {
        status: response.status,
      });
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scopes: data.scope,
    };
  }

  async fetchUser(token) {
    const response = await fetch(`${discordConfig.baseUrl}/users/@me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new SourceConnectionError('Discord user fetch failed');
    }
    return response.json();
  }

  async fetchGuilds(token) {
    const response = await fetch(`${discordConfig.baseUrl}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new SourceConnectionError('Discord guild fetch failed');
    }
    return response.json();
  }

  async fetchGuildChannels(guildId, token) {
    const response = await fetch(
      `${discordConfig.baseUrl}/guilds/${guildId}/channels`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      throw new SourceConnectionError('Discord channel fetch failed');
    }
    return response.json();
  }
}

export default DiscordOAuthService;