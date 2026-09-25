import React from 'react';
import PropTypes from 'prop-types';
import { Layers, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import TradeDirectionBadge from '../../components/domain/trade/TradeDirectionBadge';
import PnLIndicator from '../../components/domain/trade/PnLIndicator';

const OpenTradesWidget = function OpenTradesWidget({ trades, onViewAll }) {
  const list = trades || [];

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Layers size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Open Trades
            </Heading>
            <Text color="muted" className="text-xs">
              {list.length} position{list.length !== 1 ? 's' : ''} currently open
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
            title="No open positions"
            description="Your active trades will appear here."
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
                  <TradeDirectionBadge direction={trade.direction} size="xs" />
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {trade.volume} lots · {trade.duration || '—'}
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

OpenTradesWidget.propTypes = {
  trades: PropTypes.arrayOf(PropTypes.object),
  onViewAll: PropTypes.func,
};

export default OpenTradesWidget;