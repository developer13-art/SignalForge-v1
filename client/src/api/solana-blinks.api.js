import apiClient from './client';

const BASE = '/solana/actions/blinks';

export async function listBlinks({ page = 1, pageSize = 20, templateType, status, providerId } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (templateType) {
    params.set('templateType', templateType);
  }
  if (status) {
    params.set('status', status);
  }
  if (providerId) {
    params.set('providerId', providerId);
  }
  const { data } = await apiClient.get(`${BASE}?${params.toString()}`);
  return data;
}

export async function getBlink(blinkId) {
  const { data } = await apiClient.get(`${BASE}/${blinkId}`);
  return data;
}

export async function createBlink(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data;
}

export async function updateBlink(blinkId, payload) {
  const { data } = await apiClient.patch(`${BASE}/${blinkId}`, payload);
  return data;
}

export async function pauseBlink(blinkId) {
  const { data } = await apiClient.post(`${BASE}/${blinkId}/pause`);
  return data;
}

export async function resumeBlink(blinkId) {
  const { data } = await apiClient.post(`${BASE}/${blinkId}/resume`);
  return data;
}

export async function archiveBlink(blinkId) {
  const { data } = await apiClient.post(`${BASE}/${blinkId}/archive`);
  return data;
}

export async function recordBlinkShare(blinkId, payload) {
  const { data } = await apiClient.post(`${BASE}/${blinkId}/share`, payload);
  return data;
}

export async function listBlinkShares(blinkId, { page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  const { data } = await apiClient.get(`${BASE}/${blinkId}/shares?${params.toString()}`);
  return data;
}

export async function getBlinkShareLinks(blinkId, { text, via, hashtags, channels } = {}) {
  const { data } = await apiClient.post(`${BASE}/${blinkId}/share-links`, {
    text,
    via,
    hashtags,
    channels,
  });
  return data;
}

export async function getBlinkAnalytics(blinkId, { window, groupBy, from, to } = {}) {
  const params = new URLSearchParams();
  if (window) {
    params.set('window', window);
  }
  if (groupBy) {
    params.set('groupBy', groupBy);
  }
  if (from) {
    params.set('from', from);
  }
  if (to) {
    params.set('to', to);
  }
  const { data } = await apiClient.get(
    `${BASE}/${blinkId}/analytics${params.toString() ? `?${params.toString()}` : ''}`,
  );
  return data;
}

export async function getBlinkFunnel(blinkId, { window, from, to } = {}) {
  const params = new URLSearchParams();
  if (window) {
    params.set('window', window);
  }
  if (from) {
    params.set('from', from);
  }
  if (to) {
    params.set('to', to);
  }
  const { data } = await apiClient.get(
    `${BASE}/${blinkId}/funnel${params.toString() ? `?${params.toString()}` : ''}`,
  );
  return data;
}

export async function getBlinkTopConversions(blinkId, { window, from, to, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (window) {
    params.set('window', window);
  }
  if (from) {
    params.set('from', from);
  }
  if (to) {
    params.set('to', to);
  }
  if (limit) {
    params.set('limit', String(limit));
  }
  const { data } = await apiClient.get(
    `${BASE}/${blinkId}/top-conversions${params.toString() ? `?${params.toString()}` : ''}`,
  );
  return data;
}

export async function getBlinkStats(blinkId) {
  const { data } = await apiClient.get(`${BASE}/${blinkId}/stats`);
  return data;
}

export async function getOwnerBlinkStats() {
  const { data } = await apiClient.get(`${BASE}/analytics/me`);
  return data;
}

export async function listBlinkTemplates({ page = 1, pageSize = 20, templateType } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (templateType) {
    params.set('templateType', templateType);
  }
  const { data } = await apiClient.get(`${BASE}/templates?${params.toString()}`);
  return data;
}

export async function createBlinkTemplate(payload) {
  const { data } = await apiClient.post(`${BASE}/templates`, payload);
  return data;
}

export async function getBlinkTemplate(templateId) {
  const { data } = await apiClient.get(`${BASE}/templates/${templateId}`);
  return data;
}

export async function updateBlinkTemplate(templateId, payload) {
  const { data } = await apiClient.patch(`${BASE}/templates/${templateId}`, payload);
  return data;
}

export async function deleteBlinkTemplate(templateId) {
  const { data } = await apiClient.delete(`${BASE}/templates/${templateId}`);
  return data;
}