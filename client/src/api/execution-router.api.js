import apiClient from './client';

const BASE = '/execution/router';

export async function resolveRoute(payload) {
  const { data } = await apiClient.post(`${BASE}/resolve`, payload);
  return data;
}

export async function simulateRoute(payload) {
  const { data } = await apiClient.post(`${BASE}/simulate`, payload);
  return data;
}

export async function explainRoute({ symbol, payload }) {
  const { data } = await apiClient.post(`${BASE}/explain`, { symbol, ...payload });
  return data;
}

export async function listSupportedGateways() {
  const { data } = await apiClient.get(`${BASE}/gateways`);
  return data;
}

export async function listPolicies() {
  const { data } = await apiClient.get(`${BASE}/policies`);
  return data;
}

export async function getPolicy() {
  const { data } = await apiClient.get(`${BASE}/policies/default`);
  return data;
}

export async function savePolicy(payload) {
  const { data } = await apiClient.post(`${BASE}/policies`, payload);
  return data;
}

export async function deletePolicy(policyId) {
  const { data } = await apiClient.delete(`${BASE}/policies/${policyId}`);
  return data;
}

export async function setDefaultPolicy(policyId) {
  const { data } = await apiClient.post(`${BASE}/policies/${policyId}/default`);
  return data;
}

export async function listRoutes({ page = 1, pageSize = 25, status, symbol } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (status) {
    params.set('status', status);
  }
  if (symbol) {
    params.set('symbol', symbol);
  }
  const { data } = await apiClient.get(`${BASE}/routes?${params.toString()}`);
  return data;
}

export async function getRoute(routeId) {
  const { data } = await apiClient.get(`${BASE}/routes/${routeId}`);
  return data;
}

export async function listRouteLogs(routeId) {
  const { data } = await apiClient.get(`${BASE}/routes/${routeId}/logs`);
  return data;
}

export async function getUsage({ from, to } = {}) {
  const params = new URLSearchParams();
  if (from) {
    params.set('from', from);
  }
  if (to) {
    params.set('to', to);
  }
  const { data } = await apiClient.get(`${BASE}/usage?${params.toString()}`);
  return data;
}

export async function getMetrics() {
  const { data } = await apiClient.get(`${BASE}/metrics`);
  return data;
}