import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Radio,
  Brain,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';

const STATUS_ICONS = {
  received: Radio,
  classified: Brain,
  parsed: Brain,
  validated: ShieldCheck,
  approved: ShieldCheck,
  executed: Zap,
  completed: CheckCircle2,
  pending: Circle,
  rejected: AlertCircle,
  failed: AlertCircle,
};

const STATUS_STYLES = {
  received: 'bg-sky-100 text-sky-700',
  classified: 'bg-indigo-100 text-indigo-700',
  parsed: 'bg-indigo-100 text-indigo-700',
  validated: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-emerald-100 text-emerald-700',
  executed: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-600 text-white',
  pending: 'bg-slate-100 text-slate-400',
  rejected: 'bg-rose-100 text-rose-700',
  failed: 'bg-rose-100 text-rose-700',
};

const SignalTimeline = forwardRef(function SignalTimeline(
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
        const Icon = STATUS_ICONS[event.status] || Circle;
        const iconStyle = STATUS_STYLES[event.status] || STATUS_STYLES.pending;
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
                  'flex items-center justify-center rounded-full',
                  iconStyle,
                  isVertical ? 'h-8 w-8' : 'h-8 w-8',
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
                      ? 'top-full left-1/2 -translate-x-1/2 h-4 w-0.5'
                      : 'top-4 left-1/2 h-0.5 w-full',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <div className={['min-w-0 flex-1', isVertical ? '' : 'text-center mt-2'].filter(Boolean).join(' ')}>
              <p className="text-sm font-semibold text-slate-900">{event.title}</p>
              {event.description ? (
                <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
              ) : null}
              {event.time ? (
                <time className="mt-1 block text-[11px] text-slate-400">{event.time}</time>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
});

SignalTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      title: PropTypes.node,
      description: PropTypes.node,
      time: PropTypes.string,
    })
  ).isRequired,
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalTimeline;