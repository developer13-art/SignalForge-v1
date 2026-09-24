/**
 * Email Source API
 *
 * @module client/src/api/email.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const emailApi = {
  getStatus: () => get(endpoints.email.status),

  subscribe: (payload) => post(endpoints.email.subscribe, payload),

  unsubscribe: () => post(endpoints.email.unsubscribe),

  getMailbox: () => get(endpoints.email.mailbox),

  verify: (payload) => post(endpoints.email.verify, payload),
};

export default emailApi;