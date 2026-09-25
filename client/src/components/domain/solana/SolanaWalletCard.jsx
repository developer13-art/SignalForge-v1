import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Wallet, Copy, ExternalLink, Check, BadgeCheck, Shield } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';

const SolanaWalletCard = forwardRef(function SolanaWalletCard(
  {
    wallet,
    onCopy,
    onViewExplorer,
    onDisconnect,
    onVerify,
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!wallet) {
    return null;
  }

  const { address, name, verified, isPrimary, connectedAt, balance } = wallet;

  const truncated = address ? `${address.slice(0, 6)}...${address.slice(-6)}` : '';

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{name || 'Solana Wallet'}</p>
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <BadgeCheck size={10} aria-hidden="true" />
                  Verified
                </span>
              ) : null}
              {isPrimary ? (
                <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                  Primary
                </span>
              ) : null}
            </div>
            {connectedAt ? (
              <p className="mt-0.5 text-[11px] text-slate-500">Connected {connectedAt}</p>
            ) : null}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      </div>

      <Separator spacing="md" />

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Wallet Address
        </p>
        <div className="mt-1 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">
            {address}
          </code>
          {onCopy ? (
            <button
              type="button"
              onClick={() => onCopy(address)}
              aria-label="Copy address"
              className="shrink-0 rounded-md border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <Copy size={14} aria-hidden="true" />
            </button>
          ) : null}
          {onViewExplorer ? (
            <button
              type="button"
              onClick={() => onViewExplorer(address)}
              aria-label="View on explorer"
              className="shrink-0 rounded-md border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <ExternalLink size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {balance !== undefined ? (
        <>
          <Separator spacing="md" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                SOL Balance
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">
                {loading ? '—' : balance}
              </p>
            </div>
          </div>
        </>
      ) : null}

      {!verified && onVerify ? (
        <>
          <Separator spacing="md" />
          <div className="rounded-md border border-violet-200 bg-violet-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-900">
              <Shield size={12} aria-hidden="true" />
              Verify this wallet
            </p>
            <p className="mt-1 text-xs text-violet-800">
              Sign a message with your wallet to prove ownership and unlock on-chain reputation
              features.
            </p>
            <button
              type="button"
              onClick={onVerify}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
            >
              <BadgeCheck size={12} aria-hidden="true" />
              Sign & Verify
            </button>
          </div>
        </>
      ) : null}

      {onDisconnect ? (
        <>
          <Separator spacing="md" />
          <button
            type="button"
            onClick={onDisconnect}
            className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
          >
            Disconnect Wallet
          </button>
        </>
      ) : null}
    </Card>
  );
});

SolanaWalletCard.propTypes = {
  wallet: PropTypes.shape({
    address: PropTypes.string,
    name: PropTypes.string,
    verified: PropTypes.bool,
    isPrimary: PropTypes.bool,
    connectedAt: PropTypes.string,
    balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onCopy: PropTypes.func,
  onViewExplorer: PropTypes.func,
  onDisconnect: PropTypes.func,
  onVerify: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SolanaWalletCard;