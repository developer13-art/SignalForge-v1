/**
 * SolanaWalletMenu
 *
 * Compact topbar widget showing the connected Solana wallet. When no
 * wallet is connected it exposes a "Connect" affordance. When
 * connected it renders the shortened address plus a dropdown with
 * settings and disconnect actions.
 *
 * @module client/src/layouts/components/SolanaWalletMenu
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Settings2, BadgeCheck } from 'lucide-react';

import { routes } from '@config/routes.config.js';
import { useSolanaWallet } from '@hooks/useSolanaWallet.js';

function shorten(address) {
  if (!address || typeof address !== 'string') {
    return '';
  }
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function SolanaWalletMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { connected, publicKey, connect, disconnect, connecting } = useSolanaWallet();

  useEffect(() => {
    function onDocClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const address = publicKey ? String(publicKey) : null;

  async function handleConnect() {
    try {
      await connect();
    } catch (err) {
      // Surface via toast provider in real flows
    }
  }

  function handleCopy() {
    if (address && navigator.clipboard) {
      navigator.clipboard.writeText(address).catch(() => {});
    }
  }

  return (
    <div className="relative" ref={ref}>
      {connected && address ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-2.5 py-1.5 text-small text-text-secondary transition hover:border-primary-500 hover:text-text-primary"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-white">
            SOL
          </span>
          <span className="hidden sm:block font-mono text-caption">{shorten(address)}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-3 py-1.5 text-small font-semibold text-white shadow-glow-primary transition hover:opacity-90 disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:block">{connecting ? 'Connecting…' : 'Connect Wallet'}</span>
        </button>
      )}

      {open && connected && address ? (
        <div className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-modal animate-fade-in">
          <div className="flex items-center gap-3 border-b border-surface-border p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-caption font-semibold text-white">
              SOL
            </span>
            <div className="min-w-0">
              <p className="text-small font-semibold text-text-primary">Solana Wallet</p>
              <p className="text-caption text-text-tertiary font-mono">{shorten(address)}</p>
              <div className="mt-1 inline-flex items-center gap-1 text-caption text-success">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </div>
            </div>
          </div>

          <nav className="p-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
            >
              <Copy className="h-4 w-4" />
              Copy address
            </button>
            <a
              href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </a>
            <Link
              to={routes.solana.walletSettings}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
            >
              <Settings2 className="h-4 w-4" />
              Wallet settings
            </Link>
          </nav>

          <div className="border-t border-surface-border p-2">
            <button
              type="button"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-error transition hover:bg-error-subtle"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}