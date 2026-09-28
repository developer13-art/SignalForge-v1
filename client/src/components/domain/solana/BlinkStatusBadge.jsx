import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const STATUS_STYLES = {
  draft: {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    label: 'Draft',
  },
  active: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  paused: {
    container: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Paused',
  },
  archived: {
    container: 'bg-slate-100 text-slate-500 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Archived',
  },
  confirmed: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Confirmed',
  },
  pending: {
    container: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    label: 'Pending',
  },
  failed: {
    container: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Failed',
  },
  expired: {
    container: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Expired',
  },
  cancelled: {
    container: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Cancelled',
  },
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1 gap-2',
};

const BlinkStatusBadge = forwardRef(function BlinkStatusBadge(
  {
    status,
    size = 'md',
    showDot = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const config = STATUS_STYLES[status] || STATUS_STYLES.draft;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Status: ${config.label}`}
      className={[
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        config.container,
        SIZES[size] || SIZES.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showDot ? (
        <span
          className={['h-1.5 w-1.5 rounded-full', config.dot].filter(Boolean).join(' ')}
          aria-hidden="true"
        />
      ) : null}
      {config.label}
    </span>
  );
});

BlinkStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'draft',
    'active',
    'paused',
    'archived',
    'confirmed',
    'pending',
    'failed',
    'expired',
    'cancelled',
  ]).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showDot: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BlinkStatusBadge;
export { STATUS_STYLES as BLINK_STATUS_BADGE_STYLES };