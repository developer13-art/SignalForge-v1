import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * SignalForge - DexBadge
 *
 * Renders a small badge identifying a DEX or perpetual gateway.
 * The gateway metadata is defined inline so the badge does not depend
 * on the shared package being resolvable during the client build.
 * When the shared package is wired into the Vite resolve aliases,
 * this inline registry can be replaced with the shared import.
 */

const DEX_REGISTRY = {
  jupiter: {
    key: 'jupiter',
    displayName: 'Jupiter',
    type: 'dex',
    logo: '/assets/dex/jupiter.svg',
  },
  raydium: {
    key: 'raydium',
    displayName: 'Raydium',
    type: 'dex',
    logo: '/assets/dex/raydium.svg',
  },
  orca: {
    key: 'orca',
    displayName: 'Orca',
    type: 'dex',
    logo: '/assets/dex/orca.svg',
  },
  hyperliquid: {
    key: 'hyperliquid',
    displayName: 'Hyperliquid',
    type: 'perp',
    logo: '/assets/dex/hyperliquid.svg',
  },
  drift: {
    key: 'drift',
    displayName: 'Drift Protocol',
    type: 'perp',
    logo: '/assets/dex/drift.svg',
  },
};

const FALLBACK = {
  displayName: 'Unknown DEX',
  type: 'dex',
};

const TYPE_COLORS = {
  dex: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  perp: 'bg-violet-50 text-violet-700 border-violet-200',
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1 gap-2',
};

const DexBadge = forwardRef(function DexBadge(
  { gateway, size = 'md', showType = true, className = '', testId, ...rest },
  ref,
) {
  const normalized = gateway ? String(gateway).toLowerCase() : null;
  const meta = normalized ? DEX_REGISTRY[normalized] : null;
  const config = meta || FALLBACK;
  const colorClass = TYPE_COLORS[config.type] || TYPE_COLORS.dex;

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        colorClass,
        SIZES[size] || SIZES.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {meta && meta.logo ? (
        <img src={meta.logo} alt="" className="h-3 w-3" aria-hidden="true" />
      ) : null}
      <span>{config.displayName}</span>
      {showType && meta ? (
        <span className="ml-1 text-[9px] font-medium normal-case opacity-70">
          {meta.type}
        </span>
      ) : null}
    </span>
  );
});

DexBadge.propTypes = {
  gateway: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showType: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default DexBadge;