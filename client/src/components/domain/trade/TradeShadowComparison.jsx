import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import PnLIndicator from './PnLIndicator';

const TradeShadowComparison = forwardRef(function TradeShadowComparison(
  {
    providerTrade,
    userTrade,
    divergence,
    missedProfit,
    betterExit,
    notes,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!providerTrade || !userTrade) {
    return null;
  }

  const isMissedProfit = Number(missedProfit) > 0;
  const isBetterExit = Number(betterExit) > 0;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Trade Shadow Comparison
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Original provider management vs. your actual exit
      </p>

      <Separator spacing="md" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Provider Trade
          </p>
          <dl className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <dt className="text-xs text-slate-500">Exit Price</dt>
              <dd className="text-sm font-semibold text-slate-900">{providerTrade.exitPrice}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs text-slate-500">Closed At</dt>
              <dd className="text-xs text-slate-600">{providerTrade.closedAt}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs text-slate-500">Profit</dt>
              <dd>
                <PnLIndicator value={providerTrade.profit} size="sm" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-center">
          <ArrowRight size={24} className="text-slate-300" aria-hidden="true" />
        </div>

        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            Your Trade
          </p>
          <dl className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <dt className="text-xs text-indigo-600">Exit Price</dt>
              <dd className="text-sm font-semibold text-indigo-900">{userTrade.exitPrice}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs text-indigo-600">Closed At</dt>
              <dd className="text-xs text-indigo-700">{userTrade.closedAt}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs text-indigo-600">Profit</dt>
              <dd>
                <PnLIndicator value={userTrade.profit} size="sm" />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {missedProfit !== undefined || betterExit !== undefined ? (
        <>
          <Separator spacing="md" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {missedProfit !== undefined ? (
              <div
                className={[
                  'rounded-md border p-3',
                  isMissedProfit
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-emerald-200 bg-emerald-50',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  {isMissedProfit ? (
                    <>
                      <TrendingDown size={12} className="text-rose-600" aria-hidden="true" />
                      <span className="text-rose-700">Missed Profit</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp size={12} className="text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-700">Captured Extra</span>
                    </>
                  )}
                </p>
                <p
                  className={[
                    'mt-1 text-lg font-bold',
                    isMissedProfit ? 'text-rose-700' : 'text-emerald-700',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {missedProfit}
                </p>
              </div>
            ) : null}

            {betterExit !== undefined ? (
              <div
                className={[
                  'rounded-md border p-3',
                  isBetterExit
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <p className="text-xs font-semibold text-slate-700">Better Exit Value</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{betterExit}</p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {divergence ? (
        <>
          <Separator spacing="md" />
          <p className="text-xs text-slate-500">
            <strong className="font-semibold text-slate-700">Divergence: </strong>
            {divergence}
          </p>
        </>
      ) : null}

      {notes ? (
        <>
          <Separator spacing="sm" />
          <p className="text-xs italic text-slate-500">{notes}</p>
        </>
      ) : null}
    </Card>
  );
});

TradeShadowComparison.propTypes = {
  providerTrade: PropTypes.shape({
    exitPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    closedAt: PropTypes.string,
    profit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  userTrade: PropTypes.shape({
    exitPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    closedAt: PropTypes.string,
    profit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  divergence: PropTypes.node,
  missedProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  betterExit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  notes: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeShadowComparison;