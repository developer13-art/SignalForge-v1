import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ExternalLink, Copy, Check } from 'lucide-react';

const SIZES = {
  xs: { text: 'text-[10px]', icon: 10, container: 'gap-1' },
  sm: { text: 'text-xs', icon: 12, container: 'gap-1.5' },
  md: { text: 'text-sm', icon: 14, container: 'gap-2' },
  lg: { text: 'text-base', icon: 16, container: 'gap-2.5' },
};

function truncate(signature, startChars = 6, endChars = 6) {
  if (!signature) {
    return '';
  }
  if (signature.length <= startChars + endChars + 3) {
    return signature;
  }
  return `${signature.slice(0, startChars)}...${signature.slice(-endChars)}`;
}

const TxSignatureLink = forwardRef(function TxSignatureLink(
  {
    signature,
    network = 'mainnet',
    truncateLength = 6,
    size = 'sm',
    showIcon = true,
    showCopy = true,
    full = false,
    label,
    onCopy,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [copied, setCopied] = useState(false);

  if (!signature) {
    return null;
  }

  const sizeConfig = SIZES[size] || SIZES.sm;
  const display = full ? signature : truncate(signature, truncateLength, truncateLength);

  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${network}`;

  const handleCopy = async (event) => {
    event.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(signature);
        setCopied(true);
        if (onCopy) {
          onCopy(signature);
        }
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (_error) {
      // silent
    }
  };

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center',
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {label ? (
        <span className={['font-medium text-slate-500', sizeConfig.text].filter(Boolean).join(' ')}>
          {label}
        </span>
      ) : null}

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={[
          'inline-flex items-center gap-1 rounded font-mono font-medium text-violet-600 transition-colors hover:text-violet-800',
          sizeConfig.text,
        ]
          .filter(Boolean)
          .join(' ')}
        title={signature}
      >
        {showIcon ? <ExternalLink size={sizeConfig.icon} aria-hidden="true" /> : null}
        <span>{display}</span>
      </a>

      {showCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy transaction signature"
          className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          {copied ? (
            <Check size={sizeConfig.icon} className="text-emerald-600" aria-hidden="true" />
          ) : (
            <Copy size={sizeConfig.icon} aria-hidden="true" />
          )}
        </button>
      ) : null}
    </span>
  );
});

TxSignatureLink.propTypes = {
  signature: PropTypes.string,
  network: PropTypes.oneOf(['mainnet', 'devnet', 'testnet']),
  truncateLength: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showCopy: PropTypes.bool,
  full: PropTypes.bool,
  label: PropTypes.string,
  onCopy: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TxSignatureLink;