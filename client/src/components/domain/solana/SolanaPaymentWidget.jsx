import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Coins, Copy, Check, ExternalLink, Wallet } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';

const SolanaPaymentWidget = forwardRef(function SolanaPaymentWidget(
  {
    amount,
    token = 'USDC',
    treasuryWallet,
    tokenPrice,
    onCopyAddress,
    onViewExplorer,
    onMarkPaid,
    paid = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [copied, setCopied] = useState(false);

  const convertedAmount =
    token === 'SOL' && tokenPrice
      ? (Number(amount) / Number(tokenPrice)).toFixed(6)
      : amount;

  const handleCopy = async () => {
    if (!treasuryWallet) {
      return;
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(treasuryWallet);
        setCopied(true);
        if (onCopyAddress) {
          onCopyAddress(treasuryWallet);
        }
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (_error) {
      // silent
    }
  };

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Coins size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Pay with Solana</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Send {token} to the treasury wallet
            </p>
          </div>
        </div>

        {paid ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
            <Check size={12} aria-hidden="true" />
            Confirmed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
            Awaiting payment
          </span>
        )}
      </div>

      <Separator spacing="md" />

      <div className="rounded-md border border-violet-200 bg-violet-50 p-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-violet-700">
          Amount to Send
        </p>
        <p className="mt-1 text-3xl font-bold text-violet-900">
          {convertedAmount} {token}
        </p>
        {token === 'SOL' && tokenPrice ? (
          <p className="mt-1 text-[11px] text-violet-700">
            Rate: 1 SOL = ${Number(tokenPrice).toFixed(2)}
          </p>
        ) : null}
      </div>

      <Separator spacing="md" />

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Treasury Wallet
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <Wallet size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-800">
              {treasuryWallet}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!treasuryWallet}
            aria-label="Copy wallet address"
            className="shrink-0 rounded-md border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
          >
            {copied ? (
              <Check size={14} className="text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <Separator spacing="md" />

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-semibold text-amber-900">Payment instructions</p>
        <ol className="mt-2 space-y-1 text-xs text-amber-800">
          <li>1. Open your Solana wallet (Phantom, Solflare, Backpack).</li>
          <li>2. Send exactly {convertedAmount} {token} to the treasury wallet above.</li>
          <li>3. After confirmation, click the button below.</li>
        </ol>
      </div>

      <Separator spacing="md" />

      <div className="flex flex-wrap items-center gap-2">
        {onMarkPaid && !paid ? (
          <button
            type="button"
            onClick={onMarkPaid}
            className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
          >
            <Check size={12} aria-hidden="true" />
            I Have Sent the Payment
          </button>
        ) : null}

        {onViewExplorer ? (
          <button
            type="button"
            onClick={onViewExplorer}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ExternalLink size={12} aria-hidden="true" />
            Open Solana Explorer
          </button>
        ) : null}
      </div>
    </Card>
  );
});

SolanaPaymentWidget.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  token: PropTypes.oneOf(['SOL', 'USDC']),
  treasuryWallet: PropTypes.string,
  tokenPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCopyAddress: PropTypes.func,
  onViewExplorer: PropTypes.func,
  onMarkPaid: PropTypes.func,
  paid: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SolanaPaymentWidget;