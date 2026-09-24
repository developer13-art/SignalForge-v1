/**
 * WhatsApp API
 *
 * @module client/src/api/whatsapp.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const whatsappApi = {
  getStatus: () => get(endpoints.whatsapp.status),

  subscribe: (payload) => post(endpoints.whatsapp.subscribe, payload),

  unsubscribe: () => post(endpoints.whatsapp.unsubscribe),

  listGroups: () => get(endpoints.whatsapp.groups),

  optIn: (payload) => post(endpoints.whatsapp.optIn, payload),

  optOut: (payload) => post(endpoints.whatsapp.optOut, payload),

  verify: (payload) => post(endpoints.whatsapp.verify, payload),
};

export default whatsappApi;