/**
 * Discord API
 *
 * @module client/src/api/discord.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const discordApi = {
  getStatus: () => get(endpoints.discord.status),

  getAuthorizeUrl: () => get(endpoints.discord.authorize),

  connect: (payload) => post(endpoints.discord.connect, payload),

  disconnect: () => post(endpoints.discord.disconnect),

  listGuilds: () => get(endpoints.discord.guilds),

  listChannels: () => get(endpoints.discord.channels),

  discoverChannels: (guildId) => get(endpoints.discord.discoverChannels(guildId)),

  optIn: (payload) => post(endpoints.discord.optIn, payload),

  optOut: (payload) => post(endpoints.discord.optOut, payload),
};

export default discordApi;