import React from 'react';
import PropTypes from 'prop-types';
import { Radio, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import SignalConfidenceBadge from '../../components/domain/signal/SignalConfidenceBadge';
import SignalStatusBadge from '../../components/domain/signal/SignalStatusBadge';

const ActiveSignalsWidget = function ActiveSignalsWidget({ signals, onViewAll }) {
  const list = signals || [];

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Active Signals
            </Heading>
            <Text color="muted" className="text-xs">
              {list.length} signal{list.length !== 1 ? 's' : ''} processed recently
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
            title="No active signals"
            description="Signals from your connected sources will appear here."
            size="sm"
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.slice(0, 5).map((signal, index) => (
            <li
              key={signal.id || index}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{signal.symbol}</p>
                  <span
                    className={[
                      'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                      signal.direction === 'BUY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {signal.direction}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {signal.provider} · {signal.time}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {signal.confidence !== undefined ? (
                  <SignalConfidenceBadge confidence={signal.confidence} size="xs" />
                ) : null}
                <SignalStatusBadge status={signal.status} size="xs" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

ActiveSignalsWidget.propTypes = {
  signals: PropTypes.arrayOf(PropTypes.object),
  onViewAll: PropTypes.func,
};

export default ActiveSignalsWidget;