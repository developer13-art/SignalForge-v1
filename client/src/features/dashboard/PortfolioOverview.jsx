import React from 'react';
import PropTypes from 'prop-types';
import { PieChart as PieIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import EmptyState from '../../components/common/EmptyState';
import DonutChart from '../../components/charts/DonutChart';

const PortfolioOverview = function PortfolioOverview({ portfolio }) {
  if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <PieIcon size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Portfolio Overview
            </Heading>
            <Text color="muted" className="text-xs">
              Distribution of open positions
            </Text>
          </div>
        </div>

        <div className="mt-4">
          <EmptyState
            title="No open positions"
            description="Portfolio allocation will appear here once you have active trades."
            size="sm"
          />
        </div>
      </Card>
    );
  }

  const chartData = portfolio.holdings.map((h) => ({
    name: h.symbol,
    value: Math.abs(Number(h.exposure) || 0),
  }));

  const totalExposure = portfolio.holdings.reduce(
    (sum, h) => sum + Math.abs(Number(h.exposure) || 0),
    0,
  );

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <PieIcon size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Portfolio Overview
            </Heading>
            <Text color="muted" className="text-xs">
              {portfolio.holdings.length} active position
              {portfolio.holdings.length !== 1 ? 's' : ''}
            </Text>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Total Exposure
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            ${totalExposure.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="h-48">
          <DonutChart
            data={chartData}
            dataKey="value"
            nameKey="name"
            height={192}
            thickness={18}
            showLegend={false}
            centerLabel="Symbols"
            centerValue={portfolio.holdings.length}
          />
        </div>

        <ul className="space-y-2">
          {portfolio.holdings.slice(0, 5).map((holding) => {
            const isProfit = Number(holding.profit) >= 0;
            return (
              <li
                key={holding.symbol}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{holding.symbol}</p>
                  <p className="text-[11px] text-slate-500">
                    {holding.direction} · {holding.volume} lots
                  </p>
                </div>
                <p
                  className={[
                    'flex items-center gap-1 text-xs font-semibold',
                    isProfit ? 'text-emerald-600' : 'text-rose-600',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isProfit ? (
                    <TrendingUp size={10} aria-hidden="true" />
                  ) : (
                    <TrendingDown size={10} aria-hidden="true" />
                  )}
                  {isProfit ? '+' : ''}
                  {holding.profit}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};

PortfolioOverview.propTypes = {
  portfolio: PropTypes.shape({
    holdings: PropTypes.arrayOf(
      PropTypes.shape({
        symbol: PropTypes.string,
        direction: PropTypes.string,
        volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        exposure: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        profit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ),
  }),
};

export default PortfolioOverview;