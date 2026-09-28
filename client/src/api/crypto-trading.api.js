import apiClient from './client';

const BASE = '/crypto-trading';

export async function listCryptoPositions({ status, page = 1, pageSize = 50 } = {}) {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  const { data } = await apiClient.get(`${BASE}/positions?${params.toString()}`);
  return data;
}

export async function getCryptoPosition(positionId) {
  const { data } = await apiClient.get(`${BASE}/positions/${positionId}`);
  return data;
}

export async function closeCryptoPosition(positionId, payload) {
  const { data } = await apiClient.post(`${BASE}/positions/${positionId}/close`, payload || {});
  return data;
}

export async function listCryptoOrders({ status, page = 1, pageSize = 50 } = {}) {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  const { data } = await apiClient.get(`${BASE}/orders?${params.toString()}`);
  return data;
}

export async function getCryptoOrder(orderId) {
  const { data } = await apiClient.get(`${BASE}/orders/${orderId}`);
  return data;
}

export async function cancelCryptoOrder(orderId) {
  const { data } = await apiClient.post(`${BASE}/orders/${orderId}/cancel`);
  return data;
}

export async function listCryptoHistory({ page = 1, pageSize = 25 } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  const { data } = await apiClient.get(`${BASE}/history?${params.toString()}`);
  return data;
}

export async function quoteSwap({ inputMint, outputMint, amount, slippageBps, preferredGateway }) {
  const { data } = await apiClient.post(`${BASE}/swap/quote`, {
    inputMint,
    outputMint,
    amount,
    slippageBps,
    preferredGateway,
  });
  return data;
}

export async function buildSwap({ quoteId, wallet, slippageBps, priorityFeeLevel }) {
  const { data } = await apiClient.post(`${BASE}/swap/build`, {
    quoteId,
    wallet,
    slippageBps,
    priorityFeeLevel,
  });
  return data;
}

export async function submitSwap({ swapId, signature }) {
  const { data } = await apiClient.post(`${BASE}/swap/submit`, { swapId, signature });
  return data;
}

export async function confirmSwap({ swapId, signature }) {
  const { data } = await apiClient.post(`${BASE}/swap/confirm`, { swapId, signature });
  return data;
}

export async function listSwaps({ page = 1, pageSize = 25, status } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (status) {
    params.set('status', status);
  }
  const { data } = await apiClient.get(`${BASE}/swaps?${params.toString()}`);
  return data;
}

export async function getTradingWallet() {
  const { data } = await apiClient.get(`${BASE}/wallet`);
  return data;
}

export async function registerTradingWallet(payload) {
  const { data } = await apiClient.post(`${BASE}/wallet`, payload);
  return data;
}

export async function unregisterTradingWallet() {
  const { data } = await apiClient.delete(`${BASE}/wallet`);
  return data;
}

export async function getCryptoRiskSettings() {
  const { data } = await apiClient.get(`${BASE}/risk`);
  return data;
}

export async function updateCryptoRiskSettings(payload) {
  const { data } = await apiClient.put(`${BASE}/risk`, payload);
  return data;
}

export async function getCryptoAutomation() {
  const { data } = await apiClient.get(`${BASE}/automation`);
  return data;
}

export async function updateCryptoAutomation(payload) {
  const { data } = await apiClient.put(`${BASE}/automation`, payload);
  return data;
}