import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listBlinks,
  getBlink,
  createBlink,
  updateBlink,
  pauseBlink,
  resumeBlink,
  archiveBlink,
  getBlinkAnalytics,
  getBlinkStats,
  recordBlinkShare,
} from '../api/solana-blinks.api';

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 12,
  templateType: null,
  status: null,
  providerId: null,
};

export default function useSolanaBlink(initialFilters = {}) {
  const mergedFilters = useMemo(
    () => ({ ...DEFAULT_FILTERS, ...initialFilters }),
    [initialFilters],
  );

  const [filters, setFilters] = useState(mergedFilters);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedBlink, setSelectedBlink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listBlinks(filters);
      setItems(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load blinks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const selectBlink = useCallback(async (blinkId) => {
    setLoading(true);
    setError(null);
    try {
      const [blinkData, statsData] = await Promise.all([
        getBlink(blinkId),
        getBlinkStats(blinkId),
      ]);
      setSelectedBlink(blinkData);
      setStats(statsData);
      return blinkData;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load blink';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async (blinkId, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBlinkAnalytics(blinkId, options);
      setAnalytics(result);
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load analytics';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const blink = await createBlink(payload);
      setItems((current) => [blink, ...current]);
      setTotal((current) => current + 1);
      return blink;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create blink';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (blinkId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const blink = await updateBlink(blinkId, payload);
      setItems((current) => current.map((item) => (item.id === blinkId ? blink : item)));
      if (selectedBlink && selectedBlink.id === blinkId) {
        setSelectedBlink(blink);
      }
      return blink;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update blink';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [selectedBlink]);

  const pause = useCallback(async (blinkId) => {
    await pauseBlink(blinkId);
    const updated = await getBlink(blinkId);
    setItems((current) => current.map((item) => (item.id === blinkId ? updated : item)));
    if (selectedBlink && selectedBlink.id === blinkId) {
      setSelectedBlink(updated);
    }
    return updated;
  }, [selectedBlink]);

  const resume = useCallback(async (blinkId) => {
    await resumeBlink(blinkId);
    const updated = await getBlink(blinkId);
    setItems((current) => current.map((item) => (item.id === blinkId ? updated : item)));
    if (selectedBlink && selectedBlink.id === blinkId) {
      setSelectedBlink(updated);
    }
    return updated;
  }, [selectedBlink]);

  const archive = useCallback(async (blinkId) => {
    await archiveBlink(blinkId);
    const updated = await getBlink(blinkId);
    setItems((current) => current.map((item) => (item.id === blinkId ? updated : item)));
    if (selectedBlink && selectedBlink.id === blinkId) {
      setSelectedBlink(updated);
    }
    return updated;
  }, [selectedBlink]);

  const share = useCallback(async (blinkId, payload) => {
    const share = await recordBlinkShare(blinkId, payload);
    return share;
  }, []);

  return {
    filters,
    setFilters,
    items,
    total,
    loading,
    error,
    selectedBlink,
    analytics,
    stats,
    reload: load,
    selectBlink,
    loadAnalytics,
    create,
    update,
    pause,
    resume,
    archive,
    share,
  };
}