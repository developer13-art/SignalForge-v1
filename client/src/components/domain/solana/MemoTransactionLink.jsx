import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ExternalLink, Copy } from 'lucide-react';

const EXPLORER_BASE = 'https://explorer.solana.com';

const CLUSTER_QUERY = {
  'mainnet-beta': '',
  mainnet: '',
  devnet: '?cluster=devnet',
  testnet: '?cluster=testnet',
};

const NETWORK =
  (typeof import.meta !== 'undefined' &&
    import.meta &&
    import.meta.env &&
    import.meta.env.VITE_SOLANA_NETWORK) ||
  'mainnet-beta';

function truncateSignature(signature, head = 6, tail = 6) {
  if (!signature || signature.length <= head + tail + 3) {
    return signature;
  }
  return `${signature.slice(0, head)}...${signature.slice(-tail)}`;
}

const MemoTransactionLink = forwardRef(function MemoTransactionLink(
  {
    signature,
    label,
    truncate = true,
    showCopy = false,
    showIcon = true,
    className = '',
    onCopy,
    testId,
    ...rest
  },
  ref,
) {
  const { url, display } = useMemo(() => {
    if (!signature) {
      return { url: null, display: null };
    }

    const cluster = CLUSTER_QUERY[NETWORK] || '';

    return {
      url: `${EXPLORER_BASE}/tx/${signature}${cluster}`,
      display: truncate ? truncateSignature(signature) : signature,
    };
  }, [signature, truncate]);

  if (!url) {
    return null;
  }

  const handleCopy = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(signature);
      if (onCopy) {
        onCopy(signature);
      }
    } catch (_error) {
      // Ignore clipboard failures
    }
  };

  return (
    <span
      ref={ref}
      className={['inline-flex items-center gap-1.5', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {label ? <span className="text-xs text-slate-500">{label}:</span> : null}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 transition-colors hover:text-indigo-800 hover:underline"
        title={signature}
      >
        <span>{display}</span>
        {showIcon ? <ExternalLink size={12} aria-hidden="true" /> : null}
      </a>
      {showCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Copy signature"
        >
          <Copy size={10} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
});

MemoTransactionLink.propTypes = {
  signature: PropTypes.string,
  label: PropTypes.string,
  truncate: PropTypes.bool,
  showCopy: PropTypes.bool,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  onCopy: PropTypes.func,
  testId: PropTypes.string,
};

export default MemoTransactionLink;