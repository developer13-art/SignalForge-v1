import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, ShieldAlert, ShieldCheck, Ban, Clock } from 'lucide-react';
import Card from '../../common/Card';

const EVENT_CONFIG = {
  blocked: {
    label: 'Trade Blocked',
    icon: Ban,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  warning: {
    label: 'Risk Warning',
    icon: AlertTriangle,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  emergency_stop: {
    label: 'Emergency Stop',
    icon: ShieldAlert,
    color: 'text-rose-800',
    bg: 'bg-rose-100',
    border: 'border-rose-300',
  },
  limit_reached: {
    label: 'Limit Reached',
    icon: ShieldAlert,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  cleared: {
    label: 'Risk Cleared',
    icon: ShieldCheck,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

const RiskEventCard = forwardRef(function RiskEventCard(
  {
    event,
    onClick,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!event) {
    return null;
  }

  const { type, title, description, time, actor, signal, account } = event;
  const config = EVENT_CONFIG[type] || EVENT_CONFIG.warning;
  const Icon = config.icon;

  return (
    <Card
      ref={ref}
      padding="md"
      hoverable={Boolean(onClick)}
      clickable={Boolean(onClick)}
      onClick={onClick}
      className={[
        'border',
        config.border,
        config.bg,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      testId={testId}
      {...rest}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white',
            config.color,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Icon size={16} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={['text-sm font-semibold', config.color].filter(Boolean).join(' ')}>
              {title || config.label}
            </p>
            {time ? (
              <time className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock size={10} aria-hidden="true" />
                {time}
              </time>
            ) : null}
          </div>

          {description ? (
            <p className="mt-0.5 text-xs text-slate-600">{description}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
            {actor ? (
              <span>
                Actor: <strong className="font-semibold text-slate-700">{actor}</strong>
              </span>
            ) : null}
            {signal ? (
              <span>
                Signal: <strong className="font-semibold text-slate-700">{signal}</strong>
              </span>
            ) : null}
            {account ? (
              <span>
                Account: <strong className="font-semibold text-slate-700">{account}</strong>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
});

RiskEventCard.propTypes = {
  event: PropTypes.shape({
    type: PropTypes.oneOf(['blocked', 'warning', 'emergency_stop', 'limit_reached', 'cleared']),
    title: PropTypes.node,
    description: PropTypes.node,
    time: PropTypes.string,
    actor: PropTypes.string,
    signal: PropTypes.string,
    account: PropTypes.string,
  }),
  onClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RiskEventCard;