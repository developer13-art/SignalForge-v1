import React, { forwardRef, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { TOKEN_SYMBOL_INDEX } from '../../../../../shared/src/constants/crypto-pairs/token-registry';

const SIZE_CLASSES = {
  xs: 'h-4 w-4 text-[8px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base',
};

const FALLBACK_COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-fuchsia-500',
];

function colorForSymbol(symbol) {
  if (!symbol) {
    return FALLBACK_COLORS[0];
  }
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = (hash * 31 + symbol.charCodeAt(i)) % FALLBACK_COLORS.length;
  }
  return FALLBACK_COLORS[hash];
}

const TokenIcon = forwardRef(function TokenIcon(
  { symbol, src, size = 'md', className = '', testId, ...rest },
  ref,
) {
  const [imageError, setImageError] = useState(false);

  const meta = useMemo(() => {
    if (!symbol) {
      return null;
    }
    return TOKEN_SYMBOL_INDEX[String(symbol).toUpperCase()] || null;
  }, [symbol]);

  const resolvedSrc = src || (meta && meta.logo) || null;

  useEffect(() => {
    setImageError(false);
  }, [resolvedSrc]);

  const showImage = Boolean(resolvedSrc) && !imageError;

  return (
    <span
      ref={ref}
      className={[
        'relative inline-flex items-center justify-center overflow-hidden rounded-full',
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        showImage ? 'bg-slate-100' : `${colorForSymbol(symbol)} text-white`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      aria-label={symbol || 'Token'}
      {...rest}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-semibold">{(symbol || '?').slice(0, 3)}</span>
      )}
    </span>
  );
});

TokenIcon.propTypes = {
  symbol: PropTypes.string,
  src: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TokenIcon;