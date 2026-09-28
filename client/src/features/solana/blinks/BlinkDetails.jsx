import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Archive, Share2, BarChart3 } from 'lucide-react';

import BlinkStatusBadge from '../../../components/domain/solana/BlinkStatusBadge';
import BlinkShareDialog from './BlinkShareDialog';
import BlinkAnalytics from './BlinkAnalytics';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import {
  getBlink,
  getBlinkStats,
  pauseBlink,
  resumeBlink,
  archiveBlink,
} from '../../../api/solana-blinks.api';

export default function BlinkDetails() {
  const { blinkId } = useParams();
  const navigate = useNavigate();

  const [blink, setBlink] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [tab, setTab] = useState('overview');

  const load = useCallback(async () => {
    if (!blinkId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [blinkData, statsData] = await Promise.all([
        getBlink(blinkId),
        getBlinkStats(blinkId),
      ]);
      setBlink(blinkData);
      setStats(statsData);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load blink');
    } finally {
      setLoading(false);
    }
  }, [blinkId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePause = useCallback(async () => {
    await pauseBlink(blinkId);
    load();
  }, [blinkId, load]);

  const handleResume = useCallback(async () => {
    await resumeBlink(blinkId);
    load();
  }, [blinkId, load]);

  const handleArchive = useCallback(async () => {
    await archiveBlink(blinkId);
    load();
  }, [blinkId, load]);

  if (loading) {
    return <LoadingState label="Loading Blink" />;
  }

  if (error || !blink) {
    return <ErrorState description={error || 'Blink not found'} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">{blink.title}</h1>
              <BlinkStatusBadge status={blink.status} />
            </div>
            <p className="text-sm text-slate-500">{blink.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Share2 size={14} />
            Share
          </button>

          {blink.status === 'active' ? (
            <button
              type="button"
              onClick={handlePause}
              className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
            >
              <Pause size={14} />
              Pause
            </button>
          ) : null}

          {blink.status === 'paused' ? (
            <button
              type="button"
              onClick={handleResume}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <Play size={14} />
              Resume
            </button>
          ) : null}

          {blink.status !== 'archived' ? (
            <button
              type="button"
              onClick={handleArchive}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Archive size={14} />
              Archive
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            type="button"
            onClick={() => setTab('overview')}
            className={[
              'border-b-2 px-1 pb-2 text-sm font-medium transition-colors',
              tab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setTab('analytics')}
            className={[
              'inline-flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm font-medium transition-colors',
              tab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <BarChart3 size={14} />
            Analytics
          </button>
        </nav>
      </div>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Shares</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats?.share_count || 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Clicks</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats?.click_count || 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Conversions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {stats?.conversion_count || 0}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Confirmed Revenue
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {Number(stats?.total_amount || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
              <span className="text-sm font-medium text-slate-500">{blink.token_symbol}</span>
            </p>
          </div>
        </div>
      ) : (
        <BlinkAnalytics blinkId={blinkId} />
      )}

      <BlinkShareDialog open={shareOpen} onClose={() => setShareOpen(false)} blink={blink} />
    </div>
  );
}