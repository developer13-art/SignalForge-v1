import { useCallback, useEffect, useState } from 'react';
import {
  getLeaderboard,
  getLeaderboardSummary,
  getTopProviders,
  getProviderVerification,
  getProviderBadge,
  listProviderProofs,
  verifyProof,
  verifyOnChain,
} from '../api/proof-of-alpha.api';

export default function useProofOfAlpha(initialOptions = {}) {
  const [leaderboardOptions, setLeaderboardOptions] = useState({
    window: 'month',
    sortBy: 'total_pnl',
    limit: 25,
    offset: 0,
    verifiedOnly: true,
    ...initialOptions,
  });

  const [leaderboard, setLeaderboard] = useState(null);
  const [summary, setSummary] = useState(null);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeaderboard(options || leaderboardOptions);
      setLeaderboard(result);
      return result;
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to load leaderboard';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [leaderboardOptions]);

  const loadSummary = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeaderboardSummary(options || leaderboardOptions);
      setSummary(result);
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load summary';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [leaderboardOptions]);

  const loadTop = useCallback(async (options) => {
    const result = await getTopProviders(options || leaderboardOptions);
    setTopProviders(result.rows || []);
    return result.rows || [];
  }, [leaderboardOptions]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const fetchProviderVerification = useCallback(async (providerId, options) => {
    return getProviderVerification(providerId, options);
  }, []);

  const fetchProviderBadge = useCallback(async (providerId) => {
    return getProviderBadge(providerId);
  }, []);

  const fetchProviderProofs = useCallback(async (providerId, filters) => {
    return listProviderProofs(providerId, filters);
  }, []);

  const verifyBySignature = useCallback(async (signature) => {
    return verifyProof(signature);
  }, []);

  const verifyRawOnChain = useCallback(async (signature) => {
    return verifyOnChain(signature);
  }, []);

  return {
    options: leaderboardOptions,
    setOptions: setLeaderboardOptions,
    leaderboard,
    summary,
    topProviders,
    loading,
    error,
    reload: loadLeaderboard,
    loadLeaderboard,
    loadSummary,
    loadTop,
    fetchProviderVerification,
    fetchProviderBadge,
    fetchProviderProofs,
    verifyBySignature,
    verifyRawOnChain,
  };
}