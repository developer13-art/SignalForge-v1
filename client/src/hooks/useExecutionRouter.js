import { useCallback, useEffect, useState } from 'react';
import {
  resolveRoute,
  simulateRoute,
  explainRoute,
  listSupportedGateways,
  getPolicy,
  savePolicy,
  listRoutes,
  getUsage,
} from '../api/execution-router.api';

export default function useExecutionRouter() {
  const [gateways, setGateways] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadGateways = useCallback(async () => {
    try {
      const data = await listSupportedGateways();
      setGateways(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load gateways');
    }
  }, []);

  const loadPolicy = useCallback(async () => {
    try {
      const data = await getPolicy();
      setPolicy(data);
    } catch (_error) {
      setPolicy(null);
    }
  }, []);

  const loadRoutes = useCallback(async (filters) => {
    try {
      const data = await listRoutes(filters);
      setRoutes(data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load routes');
    }
  }, []);

  const loadUsage = useCallback(async (range) => {
    try {
      const data = await getUsage(range);
      setUsage(data);
    } catch (_error) {
      setUsage(null);
    }
  }, []);

  useEffect(() => {
    loadGateways();
    loadPolicy();
  }, [loadGateways, loadPolicy]);

  const resolve = useCallback(async (payload) => resolveRoute(payload), []);
  const simulate = useCallback(async (payload) => simulateRoute(payload), []);
  const explain = useCallback(async (params) => explainRoute(params), []);

  const updatePolicy = useCallback(async (next) => {
    const saved = await savePolicy(next);
    setPolicy(saved);
    return saved;
  }, []);

  return {
    gateways,
    policy,
    routes,
    usage,
    loading,
    error,
    loadGateways,
    loadPolicy,
    loadRoutes,
    loadUsage,
    resolve,
    simulate,
    explain,
    updatePolicy,
  };
}