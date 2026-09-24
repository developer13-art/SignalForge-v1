/**
 * Telegram API
 *
 * @module client/src/api/telegram.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const telegramApi = {
  getStatus: () => get(endpoints.telegram.status),

  initiateLogin: (payload) => post(endpoints.telegram.initiate, payload),

  completeLogin: (payload) => post(endpoints.telegram.completeLogin, payload),

  submitPassword: (payload) => post(endpoints.telegram.submitPassword, payload),

  logout: () => post(endpoints.telegram.logout),

  listChannels: () => get(endpoints.telegram.channels),

  discoverChannels: () => post(endpoints.telegram.discoverChannels),

  optIn: (payload) => post(endpoints.telegram.optIn, payload),

  optOut: (payload) => post(endpoints.telegram.optOut, payload),

  getListenerStatus: () => get(endpoints.telegram.listener),

  startListening: () => post(endpoints.telegram.startListening),

  stopListening: () => post(endpoints.telegram.stopListening),

  checkHealth: () => get(endpoints.telegram.health),
};

export default telegramApi;