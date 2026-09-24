/**
 * REST API Source API
 *
 * @module client/src/api/rest-api.api
 */

import { get, post, del } from './client.js';
import { endpoints } from './endpoints.js';

export const restApiApi = {
  listKeys: () => get(endpoints.restApi.keys),

  createKey: (payload) => post(endpoints.restApi.createKey, payload),

  revokeKey: (keyId) => del(endpoints.restApi.revokeKey(keyId)),

  submitSignal: (payload) => post(endpoints.restApi.submitSignal, payload),
};

export default restApiApi;