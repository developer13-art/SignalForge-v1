import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function BlinkConversionChart({ data, height = 280 }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((point) => ({
      period: point.period,
      total: Number(point.total) || 0,
      confirmed: Number(point.confirmed) || 0,
      amount: Number(point.confirmed_amount) || 0,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-sm text-slate-400">
        No conversion data yet
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
    </div>
  );
}

BlinkConversionChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      period: PropTypes.string,
      total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      confirmed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      confirmed_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  ),
  height: PropTypes.number,
};