import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Clock, TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';

const EVENT_ICONS = {
  profit: TrendingUp,
  loss: TrendingDown,
  trade: Activity,
  warning: AlertCircle,
  milestone: CheckCircle2,
};

const EVENT_COLORS = {
  profit: 'bg-emerald-500',
  loss: 'bg-rose-500',
  trade: 'bg-indigo-500',
  warning: 'bg-amber-500',
  milestone: 'bg-sky-500',
};

const TraderBehaviorTimeline = forwardRef(function TraderBehaviorTimeline(
  {
    events = [],
    title = 'Behavior Timeline',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">
        Chronological behavioral events detected in this trader's history
      </p>

      <Separator spacing="md" />

      <ol className="relative flex flex-col gap-4">
        {events.map((event, index) => {
          const Icon = EVENT_ICONS[event.type] || Activity;
          const colorClass = EVENT_COLORS[event.type] || 'bg-slate-500';
          const isLast = index === events.length - 1;

          return (
            <li key={event.key || index} className="relative flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <span
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-full text-white',
                    colorClass,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon size={12} aria-hidden="true" />
                </span>
                {!isLast ? (
                  <span
                    className="absolute top-full left-1/2 h-4 w-0.5 -translate-x-1/2 bg-slate-200"
                    aria-hidden="true"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  {event.time ? (
                    <time className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={10} aria-hidden="true" />
                      {event.time}
                    </time>
                  ) : null}
                </div>
                {event.description ? (
                  <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
                ) : null}
                {event.metric ? (
                  <p className="mt-1 text-xs font-medium text-slate-700">{event.metric}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
});

TraderBehaviorTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.oneOf(['profit', 'loss', 'trade', 'warning', 'milestone']),
      title: PropTypes.node,
      description: PropTypes.node,
      time: PropTypes.string,
      metric: PropTypes.node,
    })
  ),
  title: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TraderBehaviorTimeline;