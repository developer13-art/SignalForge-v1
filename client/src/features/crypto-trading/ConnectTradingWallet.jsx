import React, { useCallback, useState } from 'react';
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectTradingWallet({ onConnected }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState(null);

  const handleConnect = useCallback(async () => {
    if (!window?.solana?.connect) {
      toast.error(
        'No Solana wallet detected. Install Phantom, Solflare, or Backpack to connect.',
      );
      return;
    }

    setConnecting(true);

    try {
      const response = await window.solana.connect();
      const address = response.publicKey.toString();

      setWallet(address);
      setConnected(true);

      if (onConnected) {
        onConnected(address);
      }

      toast.success('Trading wallet connected');
    } catch (error) {
      toast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, [onConnected]);

  const handleDisconnect = useCallback(async () => {
    try {
      await window.solana?.disconnect?.();
    } catch (_error) {
      // Ignore
    }
    setWallet(null);
    setConnected(false);
  }, []);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Wallet size={24} aria-hidden="true" />
        </div>

        <div className="flex-1 space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Trading Wallet</h2>
          <p className="text-sm text-slate-500">
            Connect a Solana wallet to execute spot swaps and perpetuals through supported
            gateways. SignalForge never takes custody of your funds.
          </p>
        </div>
      </div>

      {connected && wallet ? (
        <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-800">Wallet connected</span>
          </div>

          <div className="rounded-md bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-800">{wallet}</p>
          </div>

          <button
            type="button"
            onClick={handleDisconnect}
            className="rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-slate-500" aria-hidden="true" />
            <span className="text-sm text-slate-700">No wallet connected</span>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Wallet size={14} aria-hidden="true" />
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      )}
    </div>
  );
}