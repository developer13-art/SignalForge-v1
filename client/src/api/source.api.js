/**
 * Signal Sources API
 *
 * @module client/src/api/source.api
 */

import { get, post, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const sourceApi = {
  list: () => get(endpoints.sources.list),

  create: (payload) => post(endpoints.sources.create, payload),

  get: (sourceId) => get(endpoints.sources.details(sourceId)),

  update: (sourceId, payload) => patch(endpoints.sources.update(sourceId), payload),

  remove: (sourceId) => del(endpoints.sources.delete(sourceId)),

  checkHealth: (sourceId) => get(endpoints.sources.health(sourceId)),
};

export default sourceApi;