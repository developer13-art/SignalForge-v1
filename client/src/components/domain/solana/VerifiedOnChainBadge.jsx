import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from 'lucide-react';

const LEVELS = {
  unverified: {
    container: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: ShieldQuestion,
    label: 'Unverified',
    ariaLabel: 'Unverified',
  },
  partial: {
    container: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: ShieldAlert,
    label: 'Partial Verification',
    ariaLabel: 'Partially verified',
  },
  verified: {
    container: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: ShieldCheck,
    label: 'Verified',
    ariaLabel: 'Verified',
  },
  on_chain_confirmed: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
    label: 'Verified On-Chain',
    ariaLabel: 'Verified on-chain',
  },
  broken: {
    container: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldX,
    label: 'Verification Broken',
    ariaLabel: 'Verification broken',
  },
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1 gap-2',
};

const ICON_SIZES = {
  sm: 10,
  md: 12,
  lg: 14,
};

const VerifiedOnChainBadge = forwardRef(function VerifiedOnChainBadge(
  {
    level = 'unverified',
    size = 'md',
    compact = false,
    className = '',
    title,
    onClick,
    testId,
    ...rest
  },
  ref,
) {
  const config = LEVELS[level] || LEVELS.unverified;
  const Icon = config.icon;
  const label = compact ? null : config.label;
  const sizeClass = SIZES[size] || SIZES.md;
  const iconSize = ICON_SIZES[size] || ICON_SIZES.md;

  const interactiveProps = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        onClick,
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(event);
          }
        },
      }
    : {};

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        config.container,
        sizeClass,
        onClick ? 'cursor-pointer transition-transform hover:scale-[1.03]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={title || config.ariaLabel}
      aria-label={config.ariaLabel}
      data-testid={testId}
      {...interactiveProps}
      {...rest}
    >
      <Icon size={iconSize} aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </span>
  );
});

VerifiedOnChainBadge.propTypes = {
  level: PropTypes.oneOf([
    'unverified',
    'partial',
    'verified',
    'on_chain_confirmed',
    'broken',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  compact: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  testId: PropTypes.string,
};

export default VerifiedOnChainBadge;
export { LEVELS as VERIFIED_BADGE_LEVELS };