import apiClient from './client';

const BASE = '/solana/proof-of-alpha';

export async function getProof(proofId) {
  const { data } = await apiClient.get(`${BASE}/proofs/${proofId}`);
  return data;
}

export async function getProofBySignature(signature) {
  const { data } = await apiClient.get(`${BASE}/proofs/signature/${signature}`);
  return data;
}

export async function verifyProof(signature) {
  const { data } = await apiClient.get(`${BASE}/proofs/signature/${signature}/verify`);
  return data;
}

export async function verifyOnChain(signature) {
  const { data } = await apiClient.get(`${BASE}/proofs/signature/${signature}/on-chain`);
  return data;
}

export async function listPublicProofs({ page = 1, pageSize = 20, providerId } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (providerId) {
    params.set('providerId', providerId);
  }
  const { data } = await apiClient.get(`${BASE}/proofs?${params.toString()}`);
  return data;
}

export async function listProviderProofs(providerId, { page = 1, pageSize = 20, status, kind } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (status) {
    params.set('status', status);
  }
  if (kind) {
    params.set('kind', kind);
  }
  const { data } = await apiClient.get(
    `${BASE}/providers/${providerId}/proofs?${params.toString()}`,
  );
  return data;
}

export async function getProviderVerification(providerId, { from, to } = {}) {
  const params = new URLSearchParams();
  if (from) {
    params.set('from', from);
  }
  if (to) {
    params.set('to', to);
  }
  const { data } = await apiClient.get(
    `${BASE}/providers/${providerId}/verification${params.toString() ? `?${params.toString()}` : ''}`,
  );
  return data;
}

export async function getLeaderboard({
  window,
  sortBy,
  limit,
  offset,
  minTrades,
  minWinRate,
  minProfitFactor,
  minPnl,
  verifiedOnly,
  providerId,
} = {}) {
  const params = new URLSearchParams();
  if (window) {
    params.set('window', window);
  }
  if (sortBy) {
    params.set('sortBy', sortBy);
  }
  if (limit) {
    params.set('limit', String(limit));
  }
  if (offset !== undefined && offset !== null) {
    params.set('offset', String(offset));
  }
  if (minTrades) {
    params.set('minTrades', String(minTrades));
  }
  if (minWinRate !== undefined && minWinRate !== null) {
    params.set('minWinRate', String(minWinRate));
  }
  if (minProfitFactor !== undefined && minProfitFactor !== null) {
    params.set('minProfitFactor', String(minProfitFactor));
  }
  if (minPnl !== undefined && minPnl !== null) {
    params.set('minPnl', String(minPnl));
  }
  if (verifiedOnly) {
    params.set('verifiedOnly', 'true');
  }
  if (providerId) {
    params.set('providerId', providerId);
  }
  const { data } = await apiClient.get(
    `${BASE}/leaderboard${params.toString() ? `?${params.toString()}` : ''}`,
  );
  return data;
}

export async function getLeaderboardSummary({ window, sortBy } = {}) {
  const params = new URLSearchParams();
  if (window) {
    params.set('window', window);
  }
  if (sortBy) {
    params.set('sortBy', sortBy);
  }
  const { data } = await apiClient.get(
    `${BASE}/leaderboard/summary${params.toString() ? `?${params.toString()}` : ''}`,
  );
  return data;
}

export async function getTopProviders({ window, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (window) {
    params.set('window', window);
  }
  if (limit) {
    params.set('limit', String(limit));
  }
  const { data } = await apiClient.get(`${BASE}/leaderboard/top?${params.toString()}`);
  return data;
}

export async function getLeaderboardEntry(providerId, { window, sortBy } = {}) {
  const params = new URLSearchParams();
  if (window) {
    params.set('window', window);
  }
  if (sortBy) {
    params.set('sortBy', sortBy);
  }
  const { data } = await apiClient.get(
    `${BASE}/leaderboard/providers/${providerId}${params.toString() ? `?${params.toString()}` : ''}`,
  );
  return data;
}

export async function getProviderBadge(providerId) {
  const { data } = await apiClient.get(`${BASE}/leaderboard/providers/${providerId}/badge`);
  return data;
}

export async function refreshLeaderboard({ window, sortBy } = {}) {
  const { data } = await apiClient.post(`${BASE}/leaderboard/refresh`, { window, sortBy });
  return data;
}

export async function clearLeaderboardCache({ window, sortBy } = {}) {
  const { data } = await apiClient.post(`${BASE}/leaderboard/clear-cache`, { window, sortBy });
  return data;
}