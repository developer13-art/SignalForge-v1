/**
 * API Client
 *
 * Central Axios instance used by every domain API module. Handles
 * base URL resolution, default headers, request/response
 * interceptors, and exposes typed helpers for GET, POST, PUT,
 * PATCH, and DELETE requests.
 *
 * @module client/src/api/client
 */

import axios from 'axios';
import { apiConfig } from '../config/api.config.js';
import { attachInterceptors } from './interceptors.js';

export const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: apiConfig.headers,
  withCredentials: false,
});

attachInterceptors(apiClient);

export async function request(config) {
  const response = await apiClient.request(config);
  return response.data;
}

export function get(url, config = {}) {
  return request({ ...config, method: 'GET', url });
}

export function post(url, data = null, config = {}) {
  return request({ ...config, method: 'POST', url, data });
}

export function put(url, data = null, config = {}) {
  return request({ ...config, method: 'PUT', url, data });
}

export function patch(url, data = null, config = {}) {
  return request({ ...config, method: 'PATCH', url, data });
}

export function del(url, config = {}) {
  return request({ ...config, method: 'DELETE', url });
}

export function upload(url, formData, onProgress, config = {}) {
  return request({
    ...config,
    method: 'POST',
    url,
    data: formData,
    timeout: apiConfig.uploadTimeoutMs,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
}

export default apiClient;