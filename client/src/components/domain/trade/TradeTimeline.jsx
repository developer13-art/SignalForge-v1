import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Play,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  Clock,
  Edit,
  Layers,
} from 'lucide-react';

const EVENT_MAP = {
  opened: { label: 'Trade Opened', icon: Play, color: 'bg-indigo-500' },
  executed: { label: 'Executed', icon: CheckCircle2, color: 'bg-indigo-500' },
  modified: { label: 'Modified', icon: Edit, color: 'bg-sky-500' },
  sl_modified: { label: 'Stop Loss Modified', icon: Edit, color: 'bg-amber-500' },
  tp_modified: { label: 'Take Profit Modified', icon: Edit, color: 'bg-amber-500' },
  break_even: { label: 'Break Even', icon: TrendingUp, color: 'bg-emerald-500' },
  trailing_stop: { label: 'Trailing Stop Activated', icon: TrendingUp, color: 'bg-emerald-500' },
  partial_close: { label: 'Partial Close', icon: Layers, color: 'bg-amber-500' },
  closed: { label: 'Trade Closed', icon: X, color: 'bg-slate-500' },
  profit: { label: 'Profit Taken', icon: DollarSign, color: 'bg-emerald-600' },
  loss: { label: 'Loss Taken', icon: TrendingDown, color: 'bg-rose-600' },
  stop_loss_hit: { label: 'Stop Loss Hit', icon: TrendingDown, color: 'bg-rose-600' },
  take_profit_hit: { label: 'Take Profit Hit', icon: TrendingUp, color: 'bg-emerald-600' },
};

const TradeTimeline = forwardRef(function TradeTimeline(
  {
    events = [],
    orientation = 'vertical',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!events || events.length === 0) {
    return null;
  }

  const isVertical = orientation === 'vertical';

  return (
    <ol
      ref={ref}
      className={[
        'relative flex',
        isVertical ? 'flex-col gap-4' : 'flex-row items-start gap-0 overflow-x-auto pb-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {events.map((event, index) => {
        const config = EVENT_MAP[event.type] || EVENT_MAP.opened;
        const Icon = event.icon || config.icon;
        const isLast = index === events.length - 1;

        return (
          <li
            key={event.key || index}
            className={[
              'relative flex',
              isVertical ? 'items-start gap-3' : 'flex-col items-center',
              isVertical ? '' : 'min-w-[140px] flex-1',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div
              className={[
                'relative flex shrink-0 flex-col items-center',
                isVertical ? '' : 'w-full',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-white',
                  config.color,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon size={14} aria-hidden="true" />
              </span>

              {!isLast ? (
                <span
                  className={[
                    'absolute bg-slate-200',
                    isVertical
                      ? 'top-full left-1/2 h-4 w-0.5 -translate-x-1/2'
                      : 'top-4 left-1/2 h-0.5 w-full',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <div
              className={['min-w-0 flex-1', isVertical ? '' : 'mt-2 text-center']
                .filter(Boolean)
                .join(' ')}
            >
              <p className="text-sm font-semibold text-slate-900">
                {event.title || config.label}
              </p>

              {event.description ? (
                <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
              ) : null}

              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                {event.time ? (
                  <time className="flex items-center gap-1">
                    <Clock size={10} aria-hidden="true" />
                    {event.time}
                  </time>
                ) : null}
                {event.actor ? <span>by {event.actor}</span> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
});

TradeTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.string,
      title: PropTypes.node,
      description: PropTypes.node,
      time: PropTypes.string,
      actor: PropTypes.string,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeTimeline;