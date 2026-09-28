import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import TokenIcon from '../../components/domain/crypto/TokenIcon';

export default function WalletTradingAccount({ wallet, balances = [] }) {
  const [copied, setCopied] = useState(false);

  if (!wallet) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_error) {
      // Ignore
    }
  };

  const explorerUrl = `https://explorer.solana.com/address/${wallet}`;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">Trading Wallet</p>
          <div className="flex items-center gap-2">
            <p className="break-all font-mono text-sm text-slate-800">{wallet}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Copy wallet address"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
              aria-label="Open in explorer"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {balances.length > 0 ? (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Balances</p>
          <div className="space-y-2">
            {balances.map((balance) => (
              <div
                key={balance.symbol}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={balance.symbol} size="sm" />
                  <span className="text-sm font-medium text-slate-800">{balance.symbol}</span>
                </div>
                <span className="text-sm text-slate-700">
                  {Number(balance.amount || 0).toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}