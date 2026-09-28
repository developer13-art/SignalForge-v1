import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getBlinkAnalytics } from '../../../api/solana-blinks.api';

const WINDOWS = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: '7 days' },
  { key: 'month', label: '30 days' },
  { key: 'quarter', label: '90 days' },
  { key: 'year', label: '1 year' },
  { key: 'all', label: 'All time' },
];

const GROUP_BY = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#e11d48', '#0ea5e9', '#8b5cf6'];

function StatTile({ label, value, sublabel }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-slate-400">{sublabel}</p> : null}
    </div>
  );
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sublabel: PropTypes.string,
};

export default function BlinkAnalytics({ blinkId: blinkIdProp }) {
  const params = useParams();
  const blinkId = blinkIdProp || params.blinkId;

  const [window, setWindow] = useState('month');
  const [groupBy, setGroupBy] = useState('day');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!blinkId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getBlinkAnalytics(blinkId, { window, groupBy });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [blinkId, window, groupBy]);

  useEffect(() => {
    load();
  }, [load]);

  const funnel = data?.funnel || {};
  const totalClicks = funnel.clicks || 0;
  const totalConversions = funnel.conversions || 0;
  const confirmed = funnel.confirmed || 0;
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';
  const confirmedRate = totalConversions > 0 ? ((confirmed / totalConversions) * 100).toFixed(1) : '0.0';

  const chartData = useMemo(() => {
    if (!data?.velocity || !Array.isArray(data.velocity)) {
      return [];
    }
    return data.velocity.map((point) => ({
      period: point.period,
      total: Number(point.total) || 0,
      confirmed: Number(point.confirmed) || 0,
      amount: Number(point.confirmed_amount) || 0,
    }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data?.byToken) {
      return [];
    }
    return data.byToken.map((entry) => ({
      name: entry.token_symbol,
      value: Number(entry.confirmed_amount) || 0,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Blink Analytics</h1>
          <p className="text-sm text-slate-500">Track clicks, conversions, and confirmed revenue.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={window}
            onChange={(event) => setWindow(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {WINDOWS.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.label}
              </option>
            ))}
          </select>
          <select
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {GROUP_BY.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatTile label="Clicks" value={totalClicks} />
            <StatTile label="Conversions" value={totalConversions} sublabel={`${conversionRate}% of clicks`} />
            <StatTile label="Confirmed" value={confirmed} sublabel={`${confirmedRate}% of conversions`} />
            <StatTile
              label="Revenue"
              value={`${Number(
                data?.byToken?.reduce((sum, entry) => sum + Number(entry.confirmed_amount || 0), 0) || 0,
              ).toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Conversion velocity</h2>
            <div className="mt-4 h-72">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No activity in this window
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} name="Total" />
                    <Line
                      type="monotone"
                      dataKey="confirmed"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Confirmed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900">By channel</h2>
              <div className="mt-4 h-64">
                {!data?.byChannel || data.byChannel.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No channel data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byChannel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="channel" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="conversions" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900">By token</h2>
              <div className="mt-4 h-64">
                {pieData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No token data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

BlinkAnalytics.propTypes = {
  blinkId: PropTypes.string,
};