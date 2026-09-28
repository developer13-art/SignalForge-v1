import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

const VARIANTS = {
  unverified: {
    container: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: ShieldQuestion,
    label: 'Unverified',
  },
  partial: {
    container: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: ShieldAlert,
    label: 'Partial',
  },
  on_chain_confirmed: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
    label: 'On-Chain',
  },
  broken: {
    container: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldAlert,
    label: 'Broken',
  },
};

const SIZES = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-1',
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

function resolveVariant({ verificationLevel, hasProof, broken }) {
  if (broken) {
    return 'broken';
  }
  if (verificationLevel === 'on_chain_confirmed') {
    return 'on_chain_confirmed';
  }
  if (verificationLevel === 'partial') {
    return 'partial';
  }
  if (hasProof) {
    return 'partial';
  }
  return 'unverified';
}

const TradeProofBadge = forwardRef(function TradeProofBadge(
  {
    verificationLevel = 'unverified',
    hasProof = false,
    broken = false,
    size = 'sm',
    showLabel = true,
    signature,
    onOpenProof,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const variant = resolveVariant({ verificationLevel, hasProof, broken });
  const config = VARIANTS[variant] || VARIANTS.unverified;
  const Icon = config.icon;

  const title = useMemo(() => {
    if (signature) {
      return `Proof: ${signature}`;
    }
    return config.label;
  }, [signature, config.label]);

  return (
    <span
      ref={ref}
      role={onOpenProof ? 'button' : undefined}
      tabIndex={onOpenProof ? 0 : undefined}
      onClick={onOpenProof ? () => onOpenProof({ verificationLevel, signature }) : undefined}
      onKeyDown={
        onOpenProof
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenProof({ verificationLevel, signature });
              }
            }
          : undefined
      }
      className={[
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        config.container,
        SIZES[size] || SIZES.sm,
        onOpenProof ? 'cursor-pointer transition-transform hover:scale-[1.03]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={title}
      aria-label={config.label}
      data-testid={testId}
      {...rest}
    >
      <Icon size={size === 'md' ? 12 : 10} aria-hidden="true" />
      {showLabel ? <span>{config.label}</span> : null}
    </span>
  );
});

TradeProofBadge.propTypes = {
  verificationLevel: PropTypes.oneOf(['unverified', 'partial', 'verified', 'on_chain_confirmed']),
  hasProof: PropTypes.bool,
  broken: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md']),
  showLabel: PropTypes.bool,
  signature: PropTypes.string,
  onOpenProof: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeProofBadge;
export { VARIANTS as TRADE_PROOF_BADGE_VARIANTS };