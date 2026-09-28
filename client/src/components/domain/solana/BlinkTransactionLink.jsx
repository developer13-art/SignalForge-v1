import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ExternalLink } from 'lucide-react';

const EXPLORER_BASE = {
  'mainnet-beta': 'https://explorer.solana.com',
  mainnet: 'https://explorer.solana.com',
  devnet: 'https://explorer.solana.com',
  testnet: 'https://explorer.solana.com',
};

const CLUSTER_PARAM = {
  'mainnet-beta': '',
  mainnet: '',
  devnet: '?cluster=devnet',
  testnet: '?cluster=testnet',
};

const NETWORK = (import.meta && import.meta.env && import.meta.env.VITE_SOLANA_NETWORK) || 'mainnet-beta';

function truncateSignature(signature) {
  if (!signature || signature.length <= 12) {
    return signature;
  }
  return `${signature.slice(0, 6)}...${signature.slice(-6)}`;
}

const BlinkTransactionLink = forwardRef(function BlinkTransactionLink(
  {
    signature,
    label,
    showIcon = true,
    truncate = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const { url, display } = useMemo(() => {
    if (!signature) {
      return { url: null, display: null };
    }

    const base = EXPLORER_BASE[NETWORK] || EXPLORER_BASE['mainnet-beta'];
    const cluster = CLUSTER_PARAM[NETWORK] || '';

    return {
      url: `${base}/tx/${signature}${cluster}`,
      display: truncate ? truncateSignature(signature) : signature,
    };
  }, [signature, truncate]);

  if (!url) {
    return null;
  }

  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'inline-flex items-center gap-1 font-mono text-xs text-indigo-600 transition-colors hover:text-indigo-800 hover:underline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={signature}
      data-testid={testId}
      {...rest}
    >
      {label ? <span>{label}:</span> : null}
      <span>{display}</span>
      {showIcon ? <ExternalLink size={12} aria-hidden="true" /> : null}
    </a>
  );
});

BlinkTransactionLink.propTypes = {
  signature: PropTypes.string,
  label: PropTypes.string,
  showIcon: PropTypes.bool,
  truncate: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BlinkTransactionLink;