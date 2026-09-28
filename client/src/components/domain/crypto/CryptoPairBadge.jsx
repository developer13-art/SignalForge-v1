import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import TokenIcon from './TokenIcon';

const CryptoPairBadge = forwardRef(function CryptoPairBadge(
  { canonicalSymbol, size = 'md', showIcons = true, className = '', testId, ...rest },
  ref,
) {
  if (!canonicalSymbol) {
    return null;
  }

  const normalized = String(canonicalSymbol).toUpperCase();
  const stripped = normalized.replace(/-PERP$/, '').replace(/-SWAP$/, '');
  const [base, quote] = stripped.split('/');

  const isPerp = normalized.endsWith('-PERP');
  const isSwap = normalized.endsWith('-SWAP');

  const sizeClass =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const iconSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  return (
    <span
      ref={ref}
      className={['inline-flex items-center gap-1.5', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcons ? (
        <span className="inline-flex -space-x-1">
          <TokenIcon symbol={base} size={iconSize} />
          {quote ? <TokenIcon symbol={quote} size={iconSize} /> : null}
        </span>
      ) : null}

      <span className={['font-semibold text-slate-900', sizeClass].join(' ')}>
        {base || '—'}
        <span className="text-slate-400">/</span>
        {quote || '—'}
      </span>

      {isPerp ? (
        <span className="ml-1 rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-700">
          Perp
        </span>
      ) : null}

      {isSwap ? (
        <span className="ml-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-700">
          Swap
        </span>
      ) : null}
    </span>
  );
});

CryptoPairBadge.propTypes = {
  canonicalSymbol: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showIcons: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default CryptoPairBadge;