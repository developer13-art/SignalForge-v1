/**
 * SolanaWalletMenu
 *
 * Compact wallet chip and dropdown for the Solana wallet. Shows the
 * connected wallet address and lets the user copy it, open settings,
 * or disconnect.
 *
 * @module client/src/layouts/components/SolanaWalletMenu
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Wallet, Copy, LogOut, Settings } from 'lucide-react';

import {
  selectPrimaryWallet,
  selectSolanaConnectionStatus,
} from '../../store/slices/solana.slice.js';
import { pushToast } from '../../store/slices/ui.slice.js';
import { featureFlags } from '../../config/feature-flags.config.js';
import { cn } from '../../lib/utils/cn.util.js';

function shortenAddress(address) {
  if (!address || address.length < 10) {
    return address || '';
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function SolanaWalletMenu({ open, onClose }) {
  const dispatch = useDispatch();
  const primaryWallet = useSelector(selectPrimaryWallet);
  const connectionStatus = useSelector(selectSolanaConnectionStatus);
  const [copied, setCopied] = useState(false);

  if (!featureFlags.solana) {
    return null;
  }

  const connected = Boolean(primaryWallet && connectionStatus === 'connected');
  const address = primaryWallet?.walletAddress || '';

  const handleCopy = async () => {
    if (!address) {
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      dispatch(
        pushToast({
          id: `wallet-copy-${Date.now()}`,
          type: 'success',
          title: 'Wallet address copied',
          duration: 2500,
        }),
      );
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      dispatch(
        pushToast({
          id: `wallet-copy-failed-${Date.now()}`,
          type: 'error',
          title: 'Could not copy wallet address',
          duration: 3000,
        }),
      );
    }
  };

  return (
    <div className="relative">
      {!connected ? (
        <Link
          to="/solana/wallet/connect"
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary transition-colors hover:border-primary-500/40 hover:text-text-primary"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-500/40 bg-primary-500/10 px-3 py-1.5 text-caption font-medium text-primary-200 transition-colors hover:border-primary-500 hover:text-primary-100"
          aria-label="Copy wallet address"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          <span className="hidden sm:inline">{shortenAddress(address)}</span>
        </button>
      )}

      {open && connected ? (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-surface-border bg-surface shadow-modal animate-fade-in"
          onMouseLeave={onClose}
        >
          <div className="border-b border-surface-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-caption font-medium text-text-tertiary">Connected wallet</p>
                <p className="truncate text-small font-semibold text-text-primary">
                  {shortenAddress(address)}
                </p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy address'}
            </button>
            <Link
              to="/solana/wallet/settings"
              onClick={onClose}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              <Settings className="h-4 w-4" />
              Wallet settings
            </Link>
          </div>
          <div className="border-t border-surface-border p-2">
            <Link
              to="/solana/wallet/settings"
              onClick={onClose}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-error transition-colors hover:bg-error-subtle',
              )}
            >
              <LogOut className="h-4 w-4" />
              Manage connection
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}