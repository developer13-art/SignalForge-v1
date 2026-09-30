import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

import BlinkCard from '../../../components/domain/solana/BlinkCard';
import Pagination from '../../../components/common/Pagination';
import EmptyState from '../../../components/common/EmptyState';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import { listBlinks, pauseBlink, resumeBlink, archiveBlink } from '../../../api/solana-blinks.api';
import solanaActionConstants from '@signalforge/shared/constants/solana-actions';

const { BLINK_TEMPLATE_LIST } = solanaActionConstants;

const PAGE_SIZE = 12;

export default function BlinkHistory() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [templateType, setTemplateType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listBlinks({
        page,
        pageSize: PAGE_SIZE,
        templateType: templateType || undefined,
        status: status || undefined,
      });
      setItems(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load blinks');
    } finally {
      setLoading(false);
    }
  }, [page, templateType, status]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const filtered = useMemo(() => {
    if (!search) {
      return items;
    }
    const term = search.toLowerCase();
    return items.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      return title.includes(term) || description.includes(term);
    });
  }, [items, search]);

  const handlePause = useCallback(
    async (blink) => {
      await pauseBlink(blink.id);
      load();
    },
    [load],
  );

  const handleResume = useCallback(
    async (blink) => {
      await resumeBlink(blink.id);
      load();
    },
    [load],
  );

  const handleArchive = useCallback(
    async (blink) => {
      await archiveBlink(blink.id);
      load();
    },
    [load],
  );

  const handleCopyUrl = useCallback(async (blink) => {
    try {
      const base = window.location.origin;
      const url = `${base}/api/actions/${blink.template_type}?blinkId=${blink.id}`;
      await navigator.clipboard.writeText(url);
    } catch (_error) {
      // Ignored
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Blinks</h1>
          <p className="text-sm text-slate-500">
            Manage every Blink you have published on the Solana network.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/solana/blinks/create')}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={14} />
          Create Blink
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or description"
            className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={templateType}
          onChange={(event) => {
            setPage(1);
            setTemplateType(event.target.value);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">All templates</option>
          {BLINK_TEMPLATE_LIST.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <LoadingState variant="skeleton-cards" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={total === 0 ? 'No Blinks yet' : 'No matches found'}
          description={
            total === 0
              ? 'Create your first Solana Action to start receiving on-chain payments.'
              : 'Adjust your filters or search term to find what you are looking for.'
          }
          action={
            total === 0 ? (
              <button
                type="button"
                onClick={() => navigate('/solana/blinks/create')}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus size={14} />
                Create Blink
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((blink) => (
              <BlinkCard
                key={blink.id}
                blink={blink}
                onPause={handlePause}
                onResume={handleResume}
                onArchive={handleArchive}
                onCopyUrl={handleCopyUrl}
                onViewDetails={(b) => navigate(`/solana/blinks/${b.id}`)}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex justify-center pt-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}