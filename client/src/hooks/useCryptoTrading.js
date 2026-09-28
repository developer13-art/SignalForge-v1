import { useCallback, useEffect, useState } from 'react';
import {
  listCryptoPositions,
  listCryptoOrders,
  listCryptoHistory,
  closeCryptoPosition,
  cancelCryptoOrder,
  quoteSwap,
  buildSwap,
  submitSwap,
  confirmSwap,
  getTradingWallet,
  registerTradingWallet,
  unregisterTradingWallet,
} from '../api/crypto-trading.api';

export default function useCryptoTrading(initialFilters = {}) {
  const [filters, setFilters] = useState({
    positionStatus: 'open',
    orderStatus: 'open',
    page: 1,
    pageSize: 25,
    ...initialFilters,
  });

  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listCryptoPositions({
        status: filters.positionStatus,
        page: filters.page,
        pageSize: filters.pageSize,
      });
      setPositions(result.items || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to load positions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters.positionStatus, filters.page, filters.pageSize]);

  const loadOrders = useCallback(async () => {
    try {
      const result = await listCryptoOrders({
        status: filters.orderStatus,
        page: filters.page,
        pageSize: filters.pageSize,
      });
      setOrders(result.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    }
  }, [filters.orderStatus, filters.page, filters.pageSize]);

  const loadHistory = useCallback(async () => {
    try {
      const result = await listCryptoHistory({
        page: filters.page,
        pageSize: filters.pageSize,
      });
      setHistory(result.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load history');
    }
  }, [filters.page, filters.pageSize]);

  const loadWallet = useCallback(async () => {
    try {
      const result = await getTradingWallet();
      setWallet(result);
    } catch (err) {
      setWallet(null);
    }
  }, []);

  const reload = useCallback(async () => {
    await Promise.all([loadPositions(), loadOrders(), loadWallet()]);
  }, [loadPositions, loadOrders, loadWallet]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const closePosition = useCallback(
    async (positionId, payload) => {
      await closeCryptoPosition(positionId, payload);
      await loadPositions();
    },
    [loadPositions],
  );

  const cancelOrder = useCallback(
    async (orderId) => {
      await cancelCryptoOrder(orderId);
      await loadOrders();
    },
    [loadOrders],
  );

  const previewSwap = useCallback(async (params) => {
    return quoteSwap(params);
  }, []);

  const createSwap = useCallback(async (params) => {
    return buildSwap(params);
  }, []);

  const sendSwap = useCallback(async (params) => {
    return submitSwap(params);
  }, []);

  const checkSwap = useCallback(async (params) => {
    return confirmSwap(params);
  }, []);

  const connectWallet = useCallback(async (payload) => {
    const result = await registerTradingWallet(payload);
    setWallet(result);
    return result;
  }, []);

  const disconnectWallet = useCallback(async () => {
    await unregisterTradingWallet();
    setWallet(null);
  }, []);

  return {
    filters,
    setFilters,
    positions,
    orders,
    history,
    wallet,
    loading,
    error,
    reload,
    loadPositions,
    loadOrders,
    loadHistory,
    loadWallet,
    closePosition,
    cancelOrder,
    previewSwap,
    createSwap,
    sendSwap,
    checkSwap,
    connectWallet,
    disconnectWallet,
  };
}