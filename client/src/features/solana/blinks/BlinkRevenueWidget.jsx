import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, Coins } from 'lucide-react';

function formatAmount(amount) {
  const numeric = Number(amount) || 0;
  return numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function BlinkRevenueWidget({ byToken = [], conversions = 0, confirmed = 0 }) {
  const totals = useMemo(() => {
    const totalConversions = Number(conversions) || 0;
    const confirmedConversions = Number(confirmed) || 0;
    const totalAmount = byToken.reduce(
      (sum, entry) => sum + Number(entry.confirmed_amount || 0),
      0,
    );
    const confirmedRate =
      totalConversions > 0 ? ((confirmedConversions / totalConversions) * 100).toFixed(1) : '0.0';

    return {
      totalAmount,
      totalConversions,
      confirmedConversions,
      confirmedRate,
    };
  }, [byToken, conversions, confirmed]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900">Blink Revenue</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          <TrendingUp size={10} />
          {totals.confirmedRate}% confirmed
        </span>
      </div>

      <p className="mt-4 text-3xl font-semibold text-slate-900">{formatAmount(totals.totalAmount)}</p>
      <p className="text-xs text-slate-400">
        Across {totals.confirmedConversions} confirmed of {totals.totalConversions} conversions
      </p>

      {byToken.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {byToken.map((entry) => (
            <div key={entry.token_symbol} className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{entry.token_symbol}</span>
              <span className="text-slate-500">
                {formatAmount(entry.confirmed_amount)} · {entry.confirmed || 0} confirmed
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

BlinkRevenueWidget.propTypes = {
  byToken: PropTypes.arrayOf(
    PropTypes.shape({
      token_symbol: PropTypes.string,
      confirmed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      confirmed_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  ),
  conversions: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  confirmed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};