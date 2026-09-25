import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Coins, Wallet, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';
import Button from '../../common/Button';
import Alert from '../../feedback/Alert';

const TOKENS = [
  { value: 'SOL', label: 'SOL', icon: Coins },
  { value: 'USDC', label: 'USDC', icon: Coins },
];

const SolanaPaymentForm = forwardRef(function SolanaPaymentForm(
  {
    amount,
    currency = 'USD',
    treasuryWallet,
    tokenPrices,
    onSubmit,
    onCancel,
    submitting = false,
    error,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [token, setToken] = useState('USDC');
  const [copied, setCopied] = useState(false);

  const convertedAmount =
    token === 'SOL' && tokenPrices?.SOL
      ? (Number(amount) / tokenPrices.SOL).toFixed(6)
      : amount;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(treasuryWallet || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (_error) {
      // silent
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ token, amount: convertedAmount, treasuryWallet });
    }
  };

  return (
    <div
      ref={ref}
      className={['space-y-4', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Pay with Solana</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Send SOL or USDC on Solana network to complete this payment
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck size={12} className="text-violet-600" aria-hidden="true" />
          <span>On-chain verified</span>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" size="sm">
          {typeof error === 'string' ? error : error.message}
        </Alert>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-medium text-slate-600">Select Token</p>
        <div className="grid grid-cols-2 gap-2">
          {TOKENS.map((t) => {
            const Icon = t.icon;
            const isActive = token === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setToken(t.value)}
                className={[
                  'flex items-center justify-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon size={14} aria-hidden="true" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Amount to Send
          </p>
          <p className="text-lg font-bold text-slate-900">
            {convertedAmount} {token}
          </p>
        </div>

        {token === 'SOL' && currency === 'USD' ? (
          <p className="mt-1 text-[11px] text-slate-500">
            Equivalent to {currency} {amount} at current rate
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-600">Treasury Wallet Address</p>
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
          <Wallet size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
            {treasuryWallet || 'Not configured'}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!treasuryWallet}
            aria-label="Copy wallet address"
            className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            {copied ? (
              <Check size={14} className="text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-violet-200 bg-violet-50 p-3">
        <p className="text-xs text-violet-900">
          After sending the exact amount above to the treasury wallet, click &quot;I Have Sent the
          Payment&quot;. Our system will verify the transaction on-chain within a few minutes and
          activate your subscription automatically.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          variant="primary"
          disabled={submitting || !treasuryWallet}
          onClick={handleSubmit}
          leadingIcon={ExternalLink}
        >
          {submitting ? 'Verifying...' : 'I Have Sent the Payment'}
        </Button>
      </div>
    </div>
  );
});

SolanaPaymentForm.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  treasuryWallet: PropTypes.string,
  tokenPrices: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SolanaPaymentForm;