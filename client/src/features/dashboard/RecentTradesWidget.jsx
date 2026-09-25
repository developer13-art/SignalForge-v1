import React from 'react';
import PropTypes from 'prop-types';
import { Clock, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import TradeStatusBadge from '../../components/domain/trade/TradeStatusBadge';
import PnLIndicator from '../../components/domain/trade/PnLIndicator';

const RecentTradesWidget = function RecentTradesWidget({ trades, onViewAll }) {
  const list = trades || [];

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Clock size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Recent Trades
            </Heading>
            <Text color="muted" className="text-xs">
              Last {list.length} closed positions
            </Text>
          </div>
        </div>

        {onViewAll ? (
          <Button variant="ghost" size="sm" onClick={onViewAll} trailingIcon={ArrowRight}>
            View all
          </Button>
        ) : null}
      </div>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No recent trades"
            description="Closed positions will appear here."
            size="sm"
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.slice(0, 5).map((trade, index) => (
            <li
              key={trade.id || index}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{trade.symbol}</p>
                  <TradeStatusBadge status={trade.status} size="xs" />
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Closed {trade.closedAt || '—'}
                </p>
              </div>

              <PnLIndicator
                value={trade.profit}
                percent={trade.profitPercent}
                size="sm"
                align="right"
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

RecentTradesWidget.propTypes = {
  trades: PropTypes.arrayOf(PropTypes.object),
  onViewAll: PropTypes.func,
};

export default RecentTradesWidget;